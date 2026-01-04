# 🔧 Apply RLS Policy Fix

## What This Fixes

This migration fixes the `getAllVenues` error in the Universal app by ensuring anonymous users (clients) can read active vendors from the database.

## The Problem

The current RLS policy on the `vendors` table allows reading active vendors, but the GRANT statements might be missing, preventing anonymous users from accessing the data.

## The Solution

This migration:
1. Updates the `vendors_select` policy to explicitly allow anonymous users to read active vendors
2. Grants SELECT permissions to `anon` and `authenticated` roles
3. Maintains security by only allowing read access to active vendors for anonymous users

---

## How to Apply

### Step 1: Go to Supabase SQL Editor

Open: https://supabase.com/dashboard/project/elhlcdiosomutugpneoc/sql/new

### Step 2: Copy and Paste This SQL

```sql
-- Fix RLS Policy for vendors table to allow anonymous users to read active vendors
-- This fixes the getAllVenues error in the universal app

-- Drop existing policy
DROP POLICY IF EXISTS "vendors_select" ON public.vendors;

-- Create updated policy that explicitly allows:
-- 1. Anonymous/public users to read active vendors (for client app)
-- 2. Admins to read all vendors
-- 3. Vendor members to read their own vendor (even if not active)
CREATE POLICY "vendors_select"
ON public.vendors FOR SELECT
USING (
  -- Allow anyone (including anonymous) to see active vendors
  status = 'active'
  OR
  -- Allow admins to see all vendors
  public.is_admin()
  OR
  -- Allow vendor members to see their vendor (even if not active)
  public.is_vendor_member(id)
);

-- Grant SELECT to anon and authenticated roles (if not already granted)
GRANT SELECT ON public.vendors TO anon;
GRANT SELECT ON public.vendors TO authenticated;
```

### Step 3: Click "Run"

You should see: `Success. No rows returned`

---

## After Applying

1. ✅ The `getAllVenues` error should be resolved
2. ✅ The Universal app should be able to fetch venues (when data exists)
3. ⚠️ Note: If the `vendors` table is empty, you won't see venues yet, but the error will be gone

---

## Test the Fix

1. Visit: https://dinein-universal-423260854848.europe-west1.run.app
2. Open browser console (F12)
3. Check if `DB Error [getAllVenues]` is gone
4. If you see empty results, that's normal - the table is just empty (we'll add data later)

---

## Next Steps

After this fix:
1. ✅ Apps will be functional (no errors)
2. ⏳ Add test data via:
   - Admin panel (once authenticated)
   - Manual SQL inserts
   - Or enable scraper later

