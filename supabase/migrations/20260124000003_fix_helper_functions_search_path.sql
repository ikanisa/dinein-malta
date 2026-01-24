-- ==========================================
-- MIGRATION: Fix Helper Function Search Path Security
-- ==========================================
-- Updates core helper functions to use explicit search_path for security.
-- This prevents search_path manipulation attacks.

-- Recreate is_admin with explicit search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE auth_user_id = auth.uid()
    AND is_active = true
  );
END;
$$;

-- Recreate is_vendor_member with explicit search_path
CREATE OR REPLACE FUNCTION public.is_vendor_member(p_vendor_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.vendor_users
    WHERE vendor_id = p_vendor_id
    AND auth_user_id = auth.uid()
    AND is_active = true
  );
END;
$$;

-- Recreate get_user_role with explicit search_path
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if admin
  IF EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE auth_user_id = auth.uid() AND is_active = true
  ) THEN
    RETURN 'admin';
  END IF;
  
  -- Check if vendor
  IF EXISTS (
    SELECT 1 FROM public.vendor_users 
    WHERE auth_user_id = auth.uid() AND is_active = true
  ) THEN
    RETURN 'vendor';
  END IF;
  
  -- Default to client
  RETURN 'client';
END;
$$;

-- VERIFICATION
DO $$
BEGIN
  RAISE NOTICE 'Helper function security fixes applied successfully';
END $$;
