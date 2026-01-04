# Deployment Checklist
## Backend Production Hardening - Go-Live Steps

This checklist ensures all critical fixes are deployed before going live.

---

## ✅ Phase 1: Database Migrations (MUST DO FIRST)

### Step 1.1: Apply Production Constraints and Indexes
- [ ] **File:** `supabase/migrations/20250116000000_production_constraints_and_indexes.sql`
- [ ] Apply via Supabase Dashboard SQL Editor OR `supabase db push`
- [ ] Verify constraints created:
  ```sql
  SELECT conname FROM pg_constraint WHERE conrelid = 'orders'::regclass;
  ```
- [ ] Verify indexes created:
  ```sql
  SELECT indexname FROM pg_indexes WHERE tablename = 'orders';
  ```

### Step 1.2: Apply RLS Hardening
- [ ] **File:** `supabase/migrations/20250116000001_harden_rls_policies.sql`
- [ ] Apply migration
- [ ] Verify dangerous policies removed:
  ```sql
  SELECT policyname FROM pg_policies WHERE tablename = 'orders' AND policyname LIKE '%insert%';
  -- Should return no 'orders_insert_client' policy
  ```
- [ ] Verify status transition trigger exists:
  ```sql
  SELECT tgname FROM pg_trigger WHERE tgname = 'trg_orders_status_transition';
  ```

### Step 1.3: Storage Setup (Optional for MVP)
- [ ] Create `menu-uploads` bucket (private)
- [ ] Create `menu-images` bucket (public)
- [ ] Create `assets` bucket (public)
- [ ] Configure storage policies (see migration file comments)

---

## ✅ Phase 2: Edge Functions Deployment

### Step 2.1: Deploy order_create
- [ ] **Function:** `supabase/functions/order_create/`
- [ ] Deploy: `supabase functions deploy order_create` OR via Dashboard
- [ ] Verify function exists in Dashboard
- [ ] Test with curl (see Implementation Guide)
- [ ] **CRITICAL:** Verify function uses service role (bypasses RLS)

### Step 2.2: Deploy vendor_claim
- [ ] **Function:** `supabase/functions/vendor_claim/`
- [ ] Deploy function
- [ ] Test vendor onboarding flow
- [ ] Verify vendor + vendor_users membership created

### Step 2.3: Deploy tables_generate
- [ ] **Function:** `supabase/functions/tables_generate/`
- [ ] Deploy function
- [ ] Test table creation
- [ ] Verify public_code generated correctly

### Step 2.4: Deploy order_update_status
- [ ] **Function:** `supabase/functions/order_update_status/`
- [ ] Deploy function
- [ ] Test status transitions

### Step 2.5: Deploy order_mark_paid
- [ ] **Function:** `supabase/functions/order_mark_paid/`
- [ ] Deploy function
- [ ] Test payment confirmation

### Step 2.6: Verify Function Configuration
- [ ] All functions have `verify_jwt = true` (or appropriate auth)
- [ ] Environment variables set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- [ ] Functions accessible via Supabase Dashboard

---

## ✅ Phase 3: Frontend Updates

### Step 3.1: Code Changes Applied
- [x] `createOrder()` updated to use `order_create` Edge Function
- [x] `createVendor()` updated to use `vendor_claim` Edge Function  
- [x] `updateOrderStatus()` updated to use `order_update_status` Edge Function
- [x] `updatePaymentStatus()` updated to use `order_mark_paid` Edge Function
- [x] `createTablesBatch()` updated to use `tables_generate` Edge Function
- [x] Schema mappings updated (`venues` → `vendors`)

### Step 3.2: Remove Dangerous Code
- [ ] **CRITICAL:** Remove any fallback code that allows direct order inserts
- [ ] Search codebase for `.from('orders').insert`
- [ ] Remove demo/admin email domain checks
- [ ] Remove any offline fallback patterns

### Step 3.3: Test Frontend Integration
- [ ] Test order creation flow end-to-end
- [ ] Test vendor onboarding
- [ ] Test table generation
- [ ] Test order status updates
- [ ] Test payment confirmation

---

## ✅ Phase 4: Security Verification

### Step 4.1: Verify RLS Blocks Direct Inserts
- [ ] Attempt direct order insert (should fail):
  ```sql
  -- As client user, run:
  INSERT INTO orders (vendor_id, client_auth_user_id, order_code, total_amount)
  VALUES ('test-id', auth.uid(), 'TEST-123', 10.00);
  -- Should return: "new row violates row-level security policy"
  ```

### Step 4.2: Verify Edge Functions Work
- [ ] Create order via Edge Function (should succeed)
- [ ] Verify totals computed correctly
- [ ] Verify order_code is unique
- [ ] Verify price snapshots saved

### Step 4.3: Test Security Boundaries
- [ ] Try to create order with invalid vendor_id (should fail)
- [ ] Try to create order with invalid table_public_code (should fail)
- [ ] Try to create order with unavailable menu item (should fail)
- [ ] Try invalid status transition (should fail)

---

## ✅ Phase 5: Data Integrity Testing

### Step 5.1: Test Constraints
- [ ] Try to insert negative price (should fail)
- [ ] Try to insert negative total (should fail)
- [ ] Try to insert duplicate order code (should fail)
- [ ] Try to insert zero/negative table number (should fail)

### Step 5.2: Test Status Transitions
- [ ] Update order from 'received' → 'served' (should succeed)
- [ ] Update order from 'received' → 'cancelled' (should succeed)
- [ ] Try 'served' → 'received' (should fail)
- [ ] Try 'received' → 'received' (should succeed - no-op)

---

## ✅ Phase 6: Performance Verification

### Step 6.1: Verify Indexes
- [ ] Check index usage in query plans
- [ ] Test vendor dashboard queries (should be fast)
- [ ] Test menu filtering (should be fast)
- [ ] Test QR table lookup (should be fast)

### Step 6.2: Load Testing (Optional)
- [ ] Test order creation under load
- [ ] Monitor function execution times
- [ ] Check for query timeouts

---

## ✅ Phase 7: Monitoring Setup

### Step 7.1: Logging
- [ ] Review Supabase function logs
- [ ] Set up error alerts
- [ ] Monitor order creation success rate

### Step 7.2: Observability
- [ ] Dashboard for order creation metrics
- [ ] Dashboard for function errors
- [ ] Alert on high error rates

---

## ✅ Phase 8: Documentation

### Step 8.1: Update Documentation
- [ ] Update API documentation
- [ ] Document Edge Function endpoints
- [ ] Document data flow changes
- [ ] Update deployment procedures

### Step 8.2: Team Communication
- [ ] Notify team of changes
- [ ] Update runbooks
- [ ] Document rollback procedures

---

## 🚨 Rollback Plan (If Issues Arise)

### Immediate Rollback
1. **Revert Edge Functions:**
   ```bash
   # Deploy previous versions or disable functions
   ```

2. **Restore RLS Policies:**
   ```sql
   -- Only if absolutely necessary
   CREATE POLICY "orders_insert_client" ON orders FOR INSERT
   WITH CHECK (client_auth_user_id = auth.uid());
   ```

3. **Revert Frontend:**
   ```bash
   git revert <commit-hash>
   ```

### Partial Rollback
- Keep migrations (they're safe)
- Rollback specific Edge Functions if issues found
- Keep frontend changes but add temporary fallback

---

## ✅ Go-Live Criteria

Before going live, verify:

- [ ] All Phase 1 migrations applied successfully
- [ ] All Phase 2 Edge Functions deployed and tested
- [ ] Phase 3 frontend code deployed
- [ ] Phase 4 security verification passed
- [ ] Phase 5 data integrity tests passed
- [ ] No critical errors in logs
- [ ] Order creation flow tested end-to-end
- [ ] Vendor onboarding tested
- [ ] Rollback plan documented and tested

---

## 📝 Notes

- **Order Creation:** Most critical security fix - must work correctly
- **Schema Mismatch:** Frontend uses `venues`, schema uses `vendors` - mappings handle this
- **Menu Items:** Stored in `menu_items` table, not in `vendors` table
- **Table Codes:** Clients must use `table_public_code` (from QR scan), not `table_number`

---

**Last Updated:** 2025-01-16  
**Status:** Ready for deployment

