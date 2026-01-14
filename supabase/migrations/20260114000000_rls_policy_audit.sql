-- ==========================================
-- RLS POLICY AUDIT AND HELPER FUNCTIONS
-- Migration: 20260114000000
-- ==========================================
-- This migration adds missing helper functions and ensures
-- anonymous users can properly access public vendor data.

-- ============================================================================
-- HELPER FUNCTIONS (ADDITIONS)
-- ============================================================================

-- Function to get user role (admin/vendor/client)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check if admin
  IF EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE auth_user_id = auth.uid()
    AND is_active = true
  ) THEN
    RETURN 'admin';
  END IF;

  -- Check if vendor member
  IF EXISTS (
    SELECT 1 FROM public.vendor_users
    WHERE auth_user_id = auth.uid()
    AND is_active = true
  ) THEN
    RETURN 'vendor';
  END IF;

  -- Default to client
  RETURN 'client';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to get vendor_id for current user (if vendor member)
CREATE OR REPLACE FUNCTION public.get_user_vendor_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT vendor_id
    FROM public.vendor_users
    WHERE auth_user_id = auth.uid()
    AND is_active = true
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Full-text search function for vendors
CREATE OR REPLACE FUNCTION public.search_vendors(search_query TEXT)
RETURNS SETOF vendors AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM vendors
  WHERE status = 'active'
    AND (
      name ILIKE '%' || search_query || '%'
      OR address ILIKE '%' || search_query || '%'
    )
  ORDER BY 
    CASE 
      WHEN name ILIKE search_query || '%' THEN 1
      WHEN name ILIKE '%' || search_query || '%' THEN 2
      ELSE 3
    END,
    name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- ENSURE ANONYMOUS ACCESS FOR PUBLIC DISCOVERY
-- ============================================================================

-- Fix vendors policy to allow anonymous users to see active vendors
-- The existing policy may require auth.uid() which excludes anonymous users
DROP POLICY IF EXISTS "vendors_anon_select_active" ON public.vendors;
CREATE POLICY "vendors_anon_select_active"
ON public.vendors FOR SELECT
USING (status = 'active');

-- Fix menu_items policy to allow anonymous users to see items for active vendors
DROP POLICY IF EXISTS "menu_items_anon_select_active" ON public.menu_items;
CREATE POLICY "menu_items_anon_select_active"
ON public.menu_items FOR SELECT
USING (
  is_available = true 
  AND EXISTS (
    SELECT 1 FROM public.vendors v 
    WHERE v.id = vendor_id 
    AND v.status = 'active'
  )
);

-- ============================================================================
-- GRANT EXECUTE ON HELPER FUNCTIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_vendor_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_vendors(TEXT) TO authenticated, anon;

-- ============================================================================
-- NOTES
-- ============================================================================
-- This migration is additive and safe to re-run.
-- It does not modify existing data, only adds new policies and functions.
-- 
-- The anonymous access policies work alongside existing authenticated policies:
-- - Anonymous users: Can only see active vendors and their available menu items
-- - Authenticated users: Full access per existing policies
-- - Vendor members: Can see/edit their own vendor data
-- - Admins: Full access to everything
