# Backend Integration Audit Report
## DineIn Malta - Supabase Production Readiness Assessment

**Date:** 2025-01-16  
**Scope:** Database Schema, RLS Policies, Edge Functions, Security, Data Flow  
**Status:** ⚠️ **NOT PRODUCTION READY** - Critical blockers identified

---

## Executive Summary

The current backend implementation has a solid foundation with well-designed database schema and RLS structure. However, **critical security vulnerabilities** and **missing production safeguards** prevent go-live. The most critical issue is that **orders can be forged** by clients, allowing fraud and data integrity violations.

### Overall Status: 🔴 **CRITICAL ISSUES** (4 blockers)
- ✅ **Database Schema:** Solid foundation, minimal and clean
- ⚠️ **RLS Policies:** Good structure but allows dangerous client writes
- 🔴 **Edge Functions:** Incomplete, missing critical production functions
- 🔴 **Security:** Order creation vulnerable to manipulation
- ⚠️ **Performance:** Missing critical indexes
- ⚠️ **Storage:** Not configured

---

## 1. Database Schema Assessment

### ✅ **Strengths**

1. **Well-structured tables** with proper relationships
   - Clean separation: `vendors`, `vendor_users`, `orders`, `order_items`, `tables`, `reservations`
   - Proper foreign keys with cascade behavior
   - Good use of enums for status fields

2. **Helper functions** are production-ready
   - `is_admin()`, `is_vendor_member()`, `vendor_role_for()`, etc.
   - Security definer functions properly scoped

3. **Timestamps and triggers** properly configured
   - `updated_at` triggers on all relevant tables

### 🔴 **Critical Gaps**

#### Missing Constraints (Data Integrity)
```sql
-- MISSING: Price validation
ALTER TABLE menu_items ADD CONSTRAINT menu_items_price_nonnegative 
  CHECK (price >= 0);

-- MISSING: Order total validation  
ALTER TABLE orders ADD CONSTRAINT orders_total_nonnegative 
  CHECK (total_amount >= 0);

-- MISSING: Table number validation
ALTER TABLE tables ADD CONSTRAINT tables_number_positive 
  CHECK (table_number > 0);

-- MISSING: Party size validation
ALTER TABLE reservations ADD CONSTRAINT reservations_party_size_positive 
  CHECK (party_size > 0);

-- MISSING: Unique order code per vendor (prevents collisions)
ALTER TABLE orders ADD CONSTRAINT orders_vendor_code_unique 
  UNIQUE (vendor_id, order_code);
```

#### Missing Performance Indexes
```sql
-- MISSING: Fast vendor dashboard queries
CREATE INDEX idx_orders_vendor_status_created 
  ON orders(vendor_id, status, created_at DESC);

-- MISSING: Available menu items lookup
CREATE INDEX idx_menu_items_vendor_available 
  ON menu_items(vendor_id, is_available) 
  WHERE is_available = true;

-- MISSING: Table lookup by public_code (QR scanning)
CREATE INDEX idx_tables_public_code 
  ON tables(public_code) 
  WHERE is_active = true;
```

### ⚠️ **Schema Mismatches with Frontend**

**Critical Issue:** Frontend code references `venues` table, but schema uses `vendors` table.

**Files affected:**
- `apps/universal/services/mockDatabase.ts` - all `from('venues')` calls
- `apps/universal/supabase/functions/business-logic/index.ts` - `from('venues')` references

**Impact:** Vendor operations will fail in production.

**Fix Required:** Either:
1. Update frontend to use `vendors` table (recommended - aligns with schema)
2. Create a `venues` view pointing to `vendors` (temporary workaround)

---

## 2. RLS (Row Level Security) Assessment

### ✅ **Strengths**

1. RLS enabled on all tables ✅
2. Good use of helper functions for permission checks ✅
3. Admin access properly gated via `admin_users` table ✅
4. Vendor membership checks working correctly ✅

### 🔴 **Critical Vulnerabilities**

#### **BLOCKER A: Orders Can Be Forged** ⚠️ **HIGHEST PRIORITY**

**Current RLS Policy:**
```sql
CREATE POLICY "orders_insert_client"
ON public.orders FOR INSERT
WITH CHECK (client_auth_user_id = auth.uid());
```

**Vulnerability:**
A client can insert an order with:
- Any `vendor_id` (including inactive vendors)
- Any `table_id` (even from another vendor)
- Any `total_amount` (can manipulate price)
- Any `status` (can set to 'served' or 'paid')
- Any `payment_status` (can claim payment made)

**Attack Scenario:**
```javascript
// Malicious client code
await supabase.from('orders').insert({
  vendor_id: 'victim-vendor-id',
  table_id: 'any-table-id',
  total_amount: 0.01,  // Manipulated price
  status: 'served',    // Skip to served
  payment_status: 'paid',  // Claim payment made
  client_auth_user_id: auth.uid(),
  order_code: 'FAKE-1234'
});
```

**Fix Required:**
1. **Remove client direct insert** - Clients must NOT write to `orders` or `order_items` tables
2. **Use Edge Function only** - All order creation through `order_create` Edge Function with service role
3. **Server-side validation:**
   - Validate vendor exists and is active
   - Validate table belongs to vendor
   - Fetch authoritative prices from `menu_items`
   - Compute totals server-side
   - Insert as atomic transaction

#### **BLOCKER B: Order Items Can Be Manipulated**

**Current RLS Policy:**
```sql
CREATE POLICY "order_items_insert"
ON public.order_items FOR INSERT
WITH CHECK (exists (
  select 1 from public.orders o 
  where o.id = order_id 
  and o.client_auth_user_id = auth.uid()
));
```

**Vulnerability:**
If a client can create an order (via above vulnerability), they can then insert order items with:
- Manipulated `price_snapshot` values
- Invalid `menu_item_id` references

**Fix Required:**
Same as Blocker A - only Edge Function should insert order_items.

### ⚠️ **Policy Improvements Needed**

1. **Tables RLS is too restrictive**
   - Clients need to read tables by `public_code` for QR scanning
   - Current policy only allows vendor/admin access
   - **Fix:** Add public read policy for active tables (vendor-scoped by public_code)

2. **Order status transitions not enforced**
   - RLS allows any status update by vendor
   - Should enforce valid transitions: `received → served`, `received → cancelled`
   - **Fix:** Add trigger or Edge Function validation

---

## 3. Edge Functions Assessment

### Current State

**Existing Functions:**
1. ✅ `nearby_places_live` - Gemini-powered venue discovery (production-ready)
2. ⚠️ `business-logic` - Multi-action function with issues

### 🔴 **Critical Issues**

#### **BLOCKER C: Order Creation Function is Insecure**

**Current Implementation (`business-logic/create-order`):**
```typescript
case 'create-order': {
  const code = 'DIN-' + Math.random().toString(36).substr(2, 4).toUpperCase();
  const { data, error } = await supabaseClient // ⚠️ Uses client, not admin!
    .from('orders')
    .insert({ 
      ...payload,  // ⚠️ Trusts client payload!
      order_code: code, 
      status: 'RECEIVED', 
      payment_status: 'UNPAID'
    });
}
```

**Problems:**
1. Uses `supabaseClient` (subject to RLS) instead of `supabaseAdmin` (service role)
2. Does not validate vendor_id or table_id
3. Does not fetch prices from menu_items
4. Does not compute totals server-side
5. Trusts client-provided `total_amount`

**Fix Required:** Complete rewrite with:
- Service role client
- Vendor/table validation
- Price fetching from menu_items
- Server-side total computation
- Atomic transaction

#### **BLOCKER D: Vendor Onboarding Function References Wrong Schema**

**Current Implementation (`business-logic/claim-venue`):**
```typescript
case 'claim-venue': {
  const { data: venue, error } = await supabaseAdmin
    .from('venues')  // ⚠️ Table doesn't exist! Should be 'vendors'
    .insert({ ...payload, owner_id: user.id, status: 'active' });
}
```

**Problems:**
1. References `venues` table (doesn't exist)
2. Uses `owner_id` field (schema uses `vendor_users` relationship)
3. References `profiles` table (doesn't exist in schema)
4. References `audit_logs` table (doesn't exist in schema)

**Fix Required:**
- Use `vendors` table
- Create vendor record with `google_place_id`, `slug`, etc.
- Create `vendor_users` record with role='owner'
- Generate unique slug server-side

### ⚠️ **Missing Critical Functions**

**Required for MVP go-live:**

1. **`order_create`** ⚠️ **CRITICAL**
   - Input: `{ vendor_id, table_public_code, items: [{menu_item_id, qty}], notes? }`
   - Validates vendor active, table belongs to vendor, items available
   - Fetches prices, computes totals, inserts order + items atomically
   - Output: Order record with items

2. **`vendor_claim`** ⚠️ **CRITICAL**
   - Input: `{ placeId, slug?, revolut_link?, whatsapp?, ... }`
   - Creates vendor record + owner membership
   - Generates unique slug
   - Output: Vendor record

3. **`tables_generate`**
   - Input: `{ vendor_id, count | table_numbers[] }`
   - Generates secure `public_code` values
   - Creates table records
   - Output: Table records with public_code

4. **`order_update_status`**
   - Vendor-only
   - Validates status transitions (received → served/cancelled)
   - Output: Updated order

5. **`order_mark_paid`**
   - Vendor-only
   - Sets payment_status = 'paid'
   - Output: Updated order

6. **`reservation_create`** (optional - current RLS allows client insert)

7. **`reservation_decide`** (vendor accepts/declines)

---

## 4. Security Assessment

### 🔴 **Critical Vulnerabilities**

1. **Order Fraud Risk** (Blocker A) - See RLS section
2. **Price Manipulation** - Clients can set any total_amount
3. **Vendor Impersonation** - Clients can create orders for any vendor
4. **Admin Demo Fallback** - Email domain check in business-logic function

### ⚠️ **Security Improvements Needed**

1. **Remove admin demo fallback:**
```typescript
// REMOVE THIS:
const isDemoAdmin = user.email?.endsWith('@dinein.app');
if (!adminRecord && !isDemoAdmin) throw new Error('Forbidden');
```

2. **Add rate limiting** to public Edge Functions
3. **Add request validation** (JWT verification, input sanitization)
4. **Add CORS restrictions** (currently allows all origins)

### ✅ **Good Security Practices**

- Helper functions use `security definer` properly
- Admin access gated by `admin_users` table
- Vendor membership checks working

---

## 5. Storage Configuration

### 🔴 **Not Configured**

**Missing:**
- Storage buckets for menu uploads
- Storage policies for vendor-scoped access
- Image processing pipeline

**Required Setup:**
```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('menu-uploads', 'menu-uploads', false),
  ('menu-images', 'menu-images', true),
  ('assets', 'assets', true);

-- Storage policies (via Supabase dashboard or SQL)
-- vendors/{vendor_id}/menus/* - vendor members can upload
-- menu-images/* - public read after approval
```

---

## 6. Performance Assessment

### ⚠️ **Missing Indexes** (See Schema section)

**Impact:**
- Vendor dashboard queries will be slow (orders by status/date)
- Menu filtering by availability will be slow
- QR table lookups will be slow

**Priority:** Medium (will impact UX but not block go-live)

---

## 7. Data Flow Analysis

### Current Flow (Insecure)

```
Client → Edge Function (business-logic) → supabaseClient → RLS → orders table
  │
  └─> Falls back to direct insert if function fails
```

**Problems:**
- Client data trusted
- No server-side validation
- Fallback bypasses all security

### Required Flow (Secure)

```
Client → Edge Function (order_create) → supabaseAdmin (service role)
  │
  ├─> Validate vendor active
  ├─> Validate table belongs to vendor  
  ├─> Fetch menu items & prices
  ├─> Compute totals server-side
  └─> Insert order + items (transaction)
```

---

## 8. Go-Live Blockers Summary

### 🔴 **BLOCKER A: Order Creation Security** (P0 - CRITICAL)
**Status:** Must fix before any real users  
**Impact:** Financial fraud, data integrity violations  
**Effort:** ~4 hours  
**Fix:** Implement secure `order_create` Edge Function

### 🔴 **BLOCKER B: Vendor Onboarding Broken** (P0 - CRITICAL)
**Status:** Function will fail in production  
**Impact:** Vendors cannot onboard  
**Effort:** ~2 hours  
**Fix:** Rewrite `vendor_claim` function to match schema

### 🔴 **BLOCKER C: Missing Constraints** (P0 - CRITICAL)
**Status:** Data integrity at risk  
**Impact:** Invalid data (negative prices, duplicate order codes)  
**Effort:** ~30 minutes  
**Fix:** Add CHECK constraints and unique indexes

### 🔴 **BLOCKER D: RLS Allows Order Manipulation** (P0 - CRITICAL)
**Status:** Clients can forge orders  
**Impact:** Fraud, security breach  
**Effort:** ~1 hour  
**Fix:** Remove client insert policies, enforce Edge Function only

---

## 9. Implementation Plan

### Phase 1: Critical Security Fixes (Must Do - 1 day)

1. **Fix Order Creation** (4 hours)
   - Create `order_create` Edge Function with full validation
   - Remove client direct insert RLS policies
   - Update frontend to use Edge Function only

2. **Fix Vendor Onboarding** (2 hours)
   - Rewrite `vendor_claim` function to match schema
   - Use `vendors` and `vendor_users` tables correctly

3. **Add Database Constraints** (30 min)
   - Add CHECK constraints for prices, totals, table numbers
   - Add unique constraint on (vendor_id, order_code)

4. **Harden RLS** (1 hour)
   - Remove `orders_insert_client` policy
   - Remove `order_items_insert` policy
   - Add table read policy for QR scanning

### Phase 2: Missing Functions (Must Do - 4 hours)

5. **Implement `tables_generate`** (1 hour)
6. **Implement `order_update_status`** (1 hour)
7. **Implement `order_mark_paid`** (1 hour)
8. **Test all functions** (1 hour)

### Phase 3: Performance & Polish (Should Do - 2 hours)

9. **Add missing indexes** (30 min)
10. **Configure storage buckets** (1 hour)
11. **Remove admin demo fallback** (30 min)

### Phase 4: Monitoring & Hardening (Nice to Have - 4 hours)

12. **Add rate limiting**
13. **Add logging**
14. **Add error tracking**
15. **Performance testing**

---

## 10. Recommendations

### Immediate Actions (This Week)

1. ✅ **Fix order creation security** - Cannot go live without this
2. ✅ **Fix vendor onboarding** - Required for vendor signups
3. ✅ **Add database constraints** - Prevent invalid data
4. ✅ **Harden RLS policies** - Remove dangerous client writes

### Before Production Launch

1. ✅ **Complete Edge Function implementation**
2. ✅ **Add performance indexes**
3. ✅ **Configure storage buckets**
4. ✅ **Remove all demo/fallback code**
5. ✅ **Load testing** (especially order creation)

### Post-Launch Improvements

1. Rate limiting on public functions
2. Audit logging
3. Error monitoring (Sentry, etc.)
4. Performance monitoring
5. Automated backups verification

---

## 11. Risk Assessment

### High Risk (Address Immediately)
- ❌ Order fraud via price manipulation
- ❌ Vendor onboarding failures
- ❌ Data integrity violations

### Medium Risk (Address Before Launch)
- ⚠️ Performance issues (missing indexes)
- ⚠️ Storage not configured
- ⚠️ No rate limiting

### Low Risk (Can Address Post-Launch)
- ⚠️ No audit logging
- ⚠️ No error monitoring
- ⚠️ Limited observability

---

## Appendix: Schema Mismatches

### Frontend References `venues`, Schema Uses `vendors`

**Affected Files:**
- `apps/universal/services/mockDatabase.ts`
  - `getVenueById()` → should use `vendors`
  - `getVenueByOwner()` → should use `vendor_users` join
  - `createVenue()` → should use `vendor_claim` function
  - `updateVenue()` → should use `vendors` table

**Field Mapping:**
- Frontend: `venue.id` → Schema: `vendor.id`
- Frontend: `venue.ownerId` → Schema: `vendor_users.auth_user_id` (join)
- Frontend: `venue.revolutHandle` → Schema: `vendor.revolut_link`
- Frontend: `venue.whatsappNumber` → Schema: `vendor.whatsapp`
- Frontend: `venue.googleMapsUrl` → Schema: `vendor.google_place_id` (reference)

**Recommendation:** Update frontend to use `vendors` table structure.

---

**Report Generated:** 2025-01-16  
**Next Review:** After Phase 1 implementation

