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

