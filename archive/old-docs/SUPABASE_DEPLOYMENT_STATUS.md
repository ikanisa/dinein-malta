# Supabase Deployment Status

## ✅ Edge Functions - All Deployed Successfully

All Edge Functions have been successfully deployed to Supabase:

1. ✅ **gemini-features** - Latest with Gemini 3.0 + 2.5-Pro fallback
2. ✅ **order_create** - Secure order creation
3. ✅ **order_update_status** - Order status updates
4. ✅ **order_mark_paid** - Payment status updates
5. ✅ **vendor_claim** - Vendor onboarding
6. ✅ **tables_generate** - Table QR code generation
7. ✅ **nearby_places_live** - Venue discovery

---

## ⚠️ Database Migrations - Sync Issue

The `supabase db push` command failed due to migration history sync issues. The remote database has migration versions that don't exist locally.

### Pending Migrations

These migrations may need to be applied manually via the Supabase Dashboard:

1. **20250118000000_fix_vendors_rls_anonymous.sql** (CRITICAL - Fixes RLS for vendors table)
2. **20250116000005_create_venue_images_storage.sql** (Storage bucket setup)
3. **20250116000004_create_audit_logs_table.sql** (Audit logging)
4. **20250116000003_create_profiles_table.sql** (User profiles)
5. **20250116000001_harden_rls_policies.sql** (RLS hardening)
6. **20250116000000_production_constraints_and_indexes.sql** (Data integrity)

---

## How to Apply Migrations Manually

### Option 1: Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/elhlcdiosomutugpneoc/sql)
2. Open the SQL Editor
3. Copy the content of each migration file (in order)
4. Execute them one by one

**Priority Order:**
1. First: `20250118000000_fix_vendors_rls_anonymous.sql` (CRITICAL - fixes app error)
2. Then: Apply others in chronological order

### Option 2: Repair Migration History (Advanced)

```bash
# This will sync local with remote
supabase db pull

# Then try push again
supabase db push
```

---

## Critical Migration: RLS Fix

**File**: `supabase/migrations/20250118000000_fix_vendors_rls_anonymous.sql`

This migration is **CRITICAL** - it fixes the RLS policy for the `vendors` table to allow anonymous users to read active vendors. Without this, the universal app will show database errors when trying to load venues.

**Apply this first** if you haven't already.

---

## Status Summary

✅ **Edge Functions**: All deployed and working  
⚠️ **Database Migrations**: Need manual application via Dashboard  
✅ **Cloud Run Apps**: All 3 apps deployed and live  

---

## Next Steps

1. ✅ Edge Functions are live
2. ⚠️ Apply critical RLS fix migration (`20250118000000_fix_vendors_rls_anonymous.sql`)
3. ⚠️ Apply other pending migrations as needed
4. ✅ Test the deployed apps

