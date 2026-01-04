# Database Migration Instructions

## ✅ Edge Functions Deployed Successfully!

All 5 Edge Functions have been deployed to your Supabase project:
- ✅ `order_create`
- ✅ `vendor_claim`
- ✅ `tables_generate`
- ✅ `order_update_status`
- ✅ `order_mark_paid`

## ⚠️ Database Migrations Need to be Applied

Due to migration history mismatch, please apply the migrations manually via Supabase Dashboard:

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/elhlcdiosomutugpneoc
2. Navigate to **SQL Editor**

### Step 2: Apply Migrations
1. Open the file: `supabase/APPLY_MIGRATIONS.sql`
2. Copy the entire contents
3. Paste into SQL Editor
4. Click **Run** or press Cmd/Ctrl+Enter

### What the Migration Does:
1. **Adds Data Integrity Constraints:**
   - Prevents negative prices
   - Prevents negative order totals
   - Ensures unique order codes per vendor
   - Validates table numbers and party sizes

2. **Adds Performance Indexes:**
   - Faster vendor dashboard queries
   - Faster menu filtering
   - Faster QR code table lookups

3. **Hardens Security (RLS):**
   - Removes dangerous client direct insert policies
   - Adds public table read policy for QR scanning
   - Adds order status transition validation trigger

### Step 3: Verify Migrations Applied

Run these queries in SQL Editor to verify:

```sql
-- Check constraints exist
SELECT conname 
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
AND conname LIKE '%nonnegative%';

-- Check indexes exist
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'orders' 
AND indexname LIKE 'idx_orders_%';

-- Verify dangerous policy removed
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'orders' 
AND policyname LIKE '%insert%';
-- Should NOT return 'orders_insert_client'

-- Verify trigger exists
SELECT tgname 
FROM pg_trigger 
WHERE tgname = 'trg_orders_status_transition';
```

---

## 🚀 Next Steps After Migrations Applied

1. ✅ Test order creation (should use Edge Function)
2. ✅ Test vendor onboarding
3. ✅ Verify direct order inserts are blocked
4. ✅ Test order status updates

---

**Note:** If you encounter any errors applying the migrations, they are likely due to constraints/indexes already existing. The migration uses `IF NOT EXISTS` clauses where possible, but some constraints may need to be dropped first if they conflict.

