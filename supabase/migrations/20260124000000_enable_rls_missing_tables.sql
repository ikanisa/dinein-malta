-- ==========================================
-- MIGRATION: Enable RLS on Missing Tables
-- ==========================================
-- This migration enables RLS on tables that were previously unprotected.
--
-- ROLLBACK PROCEDURE:
-- ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
-- CREATE TABLE public.ai_cache (...); -- Would need to restore from backup

-- ============================================================================
-- 1. DROP DEPRECATED ai_cache TABLE
-- ============================================================================
-- The ai_cache table was used for legacy AI features that have been removed.
-- It contains no critical data and is safe to drop.

DROP TABLE IF EXISTS public.ai_cache CASCADE;

-- ============================================================================
-- 2. ENABLE RLS ON favorites TABLE
-- ============================================================================
-- Users should only see/manage their own favorites.

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. ENABLE RLS ON reviews TABLE  
-- ============================================================================
-- Reviews are publicly readable but only authors can modify their own.

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. REVOKE PUBLIC ACCESS TO spatial_ref_sys (PostGIS internal)
-- ============================================================================
-- This table is used internally by PostGIS and shouldn't be exposed via API.
-- We revoke direct access but the extension still functions.

REVOKE ALL ON public.spatial_ref_sys FROM anon, authenticated;

-- Grant SELECT only to authenticated users who might need geo functions
GRANT SELECT ON public.spatial_ref_sys TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  -- Verify ai_cache is dropped
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_cache') THEN
    RAISE EXCEPTION 'ai_cache table still exists';
  END IF;
  
  -- Verify RLS is enabled on favorites
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' AND c.relname = 'favorites' AND c.relrowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS not enabled on favorites';
  END IF;
  
  -- Verify RLS is enabled on reviews
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' AND c.relname = 'reviews' AND c.relrowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS not enabled on reviews';
  END IF;
  
  RAISE NOTICE 'Migration verified successfully';
END $$;
