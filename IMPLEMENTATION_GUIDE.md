# Implementation Guide - Backend Production Hardening
## DineIn Malta - Supabase Integration

This guide provides step-by-step instructions for implementing the production-ready backend changes identified in the audit report.

---

## Prerequisites

1. ✅ Supabase project configured
2. ✅ Database schema migration applied (`20251216131852_dinein_v1_schema.sql`)
3. ✅ Supabase CLI installed (for local development)
4. ✅ Environment variables configured:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY` (for Gemini functions)

---

## Phase 1: Database Migrations (CRITICAL)

### Step 1.1: Apply Production Constraints and Indexes

**File:** `supabase/migrations/20250116000000_production_constraints_and_indexes.sql`

**What it does:**
- Adds CHECK constraints to prevent invalid data (negative prices, totals, etc.)
- Adds unique constraint on `(vendor_id, order_code)` to prevent collisions
- Adds performance indexes for vendor dashboards and menu queries

**How to apply:**
```bash
# If using Supabase CLI locally
supabase db push

# Or apply via Supabase Dashboard SQL Editor
# Copy/paste the migration file contents
```

**Verification:**
```sql
-- Check constraints exist
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
AND conname LIKE '%nonnegative%';

-- Check indexes exist
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'orders' 
AND indexname LIKE 'idx_orders_%';
```

### Step 1.2: Apply RLS Hardening

**File:** `supabase/migrations/20250116000001_harden_rls_policies.sql`

**What it does:**
- Removes dangerous client direct insert policies on `orders` and `order_items`
- Adds public read policy for tables (enables QR scanning)
- Adds trigger to enforce valid order status transitions
- Ensures only Edge Functions can create orders (server-side validation)

**How to apply:**
```bash
supabase db push
```

**Verification:**
```sql
-- Verify policies removed
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'orders' 
AND policyname LIKE '%insert%';
-- Should return no results for 'orders_insert_client'

-- Verify trigger exists
SELECT tgname 
FROM pg_trigger 
WHERE tgname = 'trg_orders_status_transition';
```

### Step 1.3: Storage Setup (Optional for MVP)

**File:** `supabase/migrations/20250116000002_storage_setup.sql`

**Note:** Storage buckets cannot be created via SQL migrations. You must:

1. **Create buckets via Dashboard:**
   - Go to Storage > Create Bucket
   - Create `menu-uploads` (private)
   - Create `menu-images` (public)
   - Create `assets` (public)

2. **Create storage policies via Dashboard:**
   - See comments in migration file for policy examples
   - Or use Supabase Management API

**For MVP:** Storage setup can be deferred if menu uploads are not yet needed.

---

## Phase 2: Edge Functions Deployment (CRITICAL)

### Step 2.1: Deploy Order Creation Function

**Function:** `supabase/functions/order_create/`

**What it does:**
- Secure order creation with server-side validation
- Validates vendor active, table belongs to vendor
- Fetches authoritative prices from menu_items
- Computes totals server-side
- Generates unique order codes
- Atomic insert of order + items

**How to deploy:**
```bash
# Deploy to production
supabase functions deploy order_create

# Or deploy via Supabase Dashboard
# Functions > Create Function > Upload files
```

**Configuration:**
- Ensure `verify_jwt = true` in function config
- Set environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

**Testing:**
```bash
# Test locally first
supabase functions serve order_create

# Test with curl
curl -X POST http://localhost:54321/functions/v1/order_create \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "vendor_id": "uuid-here",
    "table_public_code": "TBL-ABC123",
    "items": [{"menu_item_id": "uuid-here", "qty": 2}]
  }'
```

### Step 2.2: Deploy Vendor Claim Function

**Function:** `supabase/functions/vendor_claim/`

**What it does:**
- Secure vendor onboarding
- Creates vendor record + owner membership
- Generates unique slugs
- Prevents duplicate claims

**How to deploy:**
```bash
supabase functions deploy vendor_claim
```

**Testing:**
```bash
curl -X POST http://localhost:54321/functions/v1/vendor_claim \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "google_place_id": "ChIJ...",
    "name": "Test Restaurant",
    "address": "123 Main St"
  }'
```

### Step 2.3: Deploy Tables Generate Function

**Function:** `supabase/functions/tables_generate/`

**What it does:**
- Generates table records with secure public_code values
- Validates vendor membership
- Prevents duplicate table numbers

**How to deploy:**
```bash
supabase functions deploy tables_generate
```

### Step 2.4: Deploy Order Status Update Functions

**Functions:**
- `supabase/functions/order_update_status/` - Update order status (served/cancelled)
- `supabase/functions/order_mark_paid/` - Mark order as paid

**How to deploy:**
```bash
supabase functions deploy order_update_status
supabase functions deploy order_mark_paid
```

---

## Phase 3: Frontend Updates (CRITICAL)

### Step 3.1: Update Order Creation

**File:** `apps/universal/services/mockDatabase.ts`

**Current (INSECURE):**
```typescript
export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
  const { data, error } = await supabase.functions.invoke('business-logic', {
    body: { action: 'create-order', payload: orderData }
  });
  // ... fallback to direct insert (REMOVE THIS!)
}
```

**Update to (SECURE):**
```typescript
export const createOrder = async (orderData: {
  vendor_id: string;
  table_public_code: string;
  items: Array<{ menu_item_id: string; qty: number; modifiers_json?: any }>;
  notes?: string;
}): Promise<Order> => {
  const { data, error } = await supabase.functions.invoke('order_create', {
    body: orderData
  });

  if (error) {
    throw new Error(error.message || 'Failed to create order');
  }

  return mapOrder(data.order);
};
```

**Remove fallback code** that allows direct insert!

### Step 3.2: Update Vendor Onboarding

**File:** `apps/universal/services/mockDatabase.ts`

**Current:**
```typescript
export const createVenue = async (venue: Venue): Promise<Venue> => {
  const { data, error } = await supabase.functions.invoke('business-logic', {
    body: { action: 'claim-venue', payload: venue }
  });
  // ...
};
```

**Update to:**
```typescript
export const createVendor = async (vendorData: {
  google_place_id: string;
  name: string;
  address?: string;
  // ... other vendor fields
}): Promise<Vendor> => {
  const { data, error } = await supabase.functions.invoke('vendor_claim', {
    body: vendorData
  });

  if (error) {
    throw new Error(error.message || 'Failed to claim vendor');
  }

  return mapVendor(data.vendor);
};
```

### Step 3.3: Fix Schema Mismatches

**Issue:** Frontend uses `venues` table, but schema uses `vendors`.

**Options:**

**Option A (Recommended):** Update frontend to use `vendors` table
- Update all `from('venues')` to `from('vendors')`
- Update field mappings (see audit report appendix)
- Update `getVenueByOwner` to use `vendor_users` join

**Option B (Temporary):** Create view
```sql
CREATE VIEW venues AS 
SELECT 
  id,
  google_place_id as google_maps_url,
  name,
  address,
  revolut_link as revolut_handle,
  whatsapp,
  -- ... map other fields
FROM vendors;
```

**Recommendation:** Use Option A for cleaner architecture.

### Step 3.4: Update Order Status Updates

**File:** `apps/universal/services/mockDatabase.ts`

**Update:**
```typescript
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
  const { error } = await supabase.functions.invoke('order_update_status', {
    body: { order_id: orderId, status }
  });
  if (error) throw error;
};

export const updatePaymentStatus = async (orderId: string): Promise<void> => {
  const { error } = await supabase.functions.invoke('order_mark_paid', {
    body: { order_id: orderId }
  });
  if (error) throw error;
};
```

---

## Phase 4: Testing & Verification

### Step 4.1: Test Order Creation

1. **Create test vendor** (via vendor_claim function)
2. **Create test menu items**
3. **Create test tables** (via tables_generate function)
4. **Create order** (via order_create function)
   - Verify totals computed correctly
   - Verify order_code is unique
   - Verify order_items created with price snapshots

**Test Cases:**
- ✅ Valid order creation
- ✅ Invalid vendor_id (should fail)
- ✅ Invalid table_public_code (should fail)
- ✅ Unavailable menu item (should fail)
- ✅ Duplicate order code (should retry)

### Step 4.2: Test RLS Security

1. **Attempt direct order insert** (should fail):
```sql
-- As client user, this should fail
INSERT INTO orders (vendor_id, client_auth_user_id, order_code, total_amount)
VALUES ('vendor-id', auth.uid(), 'TEST-123', 10.00);
-- Should return: "new row violates row-level security policy"
```

2. **Verify Edge Function works** (should succeed)

### Step 4.3: Test Vendor Onboarding

1. **Claim vendor** (should create vendor + membership)
2. **Attempt duplicate claim** (should fail)
3. **Verify slug uniqueness**

### Step 4.4: Test Status Transitions

1. **Update order status** (received → served)
2. **Attempt invalid transition** (served → received, should fail)
3. **Mark order paid**

---

## Phase 5: Monitoring & Hardening (Post-Launch)

### Step 5.1: Remove Demo/Fallback Code

**Search for and remove:**
- Email domain admin checks (`@dinein.app`)
- Direct order insert fallbacks
- Mock data usage in production

### Step 5.2: Add Rate Limiting

Consider adding rate limiting to Edge Functions:
- Use Supabase Edge Function rate limiting
- Or implement custom rate limiting (IP-based)

### Step 5.3: Add Logging

Add structured logging to Edge Functions:
```typescript
console.log(JSON.stringify({
  event: 'order_created',
  order_id: order.id,
  vendor_id: order.vendor_id,
  total_amount: order.total_amount,
  timestamp: new Date().toISOString()
}));
```

### Step 5.4: Set Up Error Monitoring

- Configure Supabase Logs dashboard
- Set up alerts for function errors
- Monitor order creation success rate

---

## Rollback Plan

If issues arise after deployment:

1. **Rollback Edge Functions:**
   ```bash
   # Deploy previous version
   supabase functions deploy order_create --version previous
   ```

2. **Rollback Migrations:**
   ```sql
   -- Remove constraints (if causing issues)
   ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_total_nonnegative;
   -- Restore RLS policies (if needed)
   CREATE POLICY "orders_insert_client" ON orders FOR INSERT
   WITH CHECK (client_auth_user_id = auth.uid());
   ```

3. **Restore Frontend:**
   - Revert frontend changes via git

---

## Success Criteria

✅ **Phase 1 Complete When:**
- All migrations applied successfully
- Constraints and indexes verified
- RLS policies hardened

✅ **Phase 2 Complete When:**
- All Edge Functions deployed
- Functions tested and working
- No direct client inserts possible

✅ **Phase 3 Complete When:**
- Frontend updated to use new functions
- Schema mismatches resolved
- No fallback code remaining

✅ **Phase 4 Complete When:**
- All test cases passing
- Security verified (direct inserts fail)
- Order creation validated end-to-end

---

## Next Steps After Implementation

1. ✅ Load testing (especially order creation)
2. ✅ Security audit review
3. ✅ Performance monitoring
4. ✅ User acceptance testing
5. ✅ Go-live checklist completion

---

**Last Updated:** 2025-01-16  
**Status:** Ready for Implementation

