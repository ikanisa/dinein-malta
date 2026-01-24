-- ==========================================
-- MIGRATION: Fix Function Search Path Security
-- ==========================================
-- Updates functions to use explicit search_path for security.
-- This prevents search_path manipulation attacks.
--
-- ROLLBACK PROCEDURE:
-- Recreate functions without the SET search_path clause

-- ============================================================================
-- 1. FIX search_nearby_venues FUNCTION
-- ============================================================================
-- This function had a mutable search_path security warning.

CREATE OR REPLACE FUNCTION public.search_nearby_venues(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision DEFAULT 5.0,
  country_filter text DEFAULT NULL,
  limit_count integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  address text,
  lat double precision,
  lng double precision,
  status text,
  country text,
  rating numeric,
  review_count integer,
  distance_km double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.name,
    v.slug,
    v.address,
    v.lat,
    v.lng,
    v.status,
    v.country,
    v.rating,
    v.review_count,
    (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(v.lat)) *
        cos(radians(v.lng) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(v.lat))
      )
    ) AS distance_km
  FROM public.vendors v
  WHERE v.status = 'active'
    AND v.lat IS NOT NULL 
    AND v.lng IS NOT NULL
    AND (country_filter IS NULL OR v.country = country_filter)
    AND (
      6371 * acos(
        cos(radians(user_lat)) * cos(radians(v.lat)) *
        cos(radians(v.lng) - radians(user_lng)) +
        sin(radians(user_lat)) * sin(radians(v.lat))
      )
    ) <= radius_km
  ORDER BY distance_km ASC
  LIMIT limit_count;
END;
$$;

-- Grant execute to appropriate roles
GRANT EXECUTE ON FUNCTION public.search_nearby_venues TO anon, authenticated;

-- ============================================================================
-- 2. VERIFY ALL HELPER FUNCTIONS HAVE SECURE search_path
-- ============================================================================
-- These functions should already be secure but we ensure consistency.

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
CREATE OR REPLACE FUNCTION public.is_vendor_member(check_vendor_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.vendor_users
    WHERE vendor_id = check_vendor_id
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

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  func_config text;
BEGIN
  -- Check search_nearby_venues has search_path set
  SELECT proconfig::text INTO func_config
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'search_nearby_venues';
  
  IF func_config IS NULL OR func_config NOT LIKE '%search_path%' THEN
    RAISE WARNING 'search_nearby_venues may not have search_path configured correctly';
  END IF;
  
  RAISE NOTICE 'Function security fixes applied successfully';
END $$;
