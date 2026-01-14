-- ==========================================
-- FIX RATE LIMIT FOR ANONYMOUS USERS
-- Migration: 20260114200000
-- ==========================================
-- This migration fixes the type mismatch where api_rate_limits.user_id
-- is UUID but anonymous users pass IP addresses as strings.
--
-- ROLLBACK PROCEDURE:
-- DELETE FROM public.api_rate_limits WHERE user_id !~ '^[0-9a-f-]{36}$';
-- ALTER TABLE public.api_rate_limits ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
-- Re-run the previous check_rate_limit function with uuid parameter

-- ============================================================================
-- 1. DROP EXISTING POLICIES BEFORE ALTERING COLUMN TYPE
-- ============================================================================
-- Policies depend on user_id column, must drop them first

DROP POLICY IF EXISTS "api_rate_limits_select_own" ON public.api_rate_limits;
DROP POLICY IF EXISTS "api_rate_limits_modify_own" ON public.api_rate_limits;
DROP POLICY IF EXISTS "api_rate_limits_admin_all" ON public.api_rate_limits;

-- ============================================================================
-- 2. CHANGE user_id COLUMN TO TEXT
-- ============================================================================

-- First drop the foreign key constraint
ALTER TABLE public.api_rate_limits DROP CONSTRAINT IF EXISTS api_rate_limits_user_id_fkey;

-- Change column type from UUID to TEXT
ALTER TABLE public.api_rate_limits ALTER COLUMN user_id TYPE text USING user_id::text;

-- ============================================================================
-- 3. UPDATE check_rate_limit FUNCTION TO ACCEPT TEXT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id text,
  p_endpoint text,
  p_limit int,
  p_window interval default interval '1 hour'
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
  v_window_start timestamptz;
BEGIN
  SELECT request_count, window_start
    INTO v_count, v_window_start
  FROM public.api_rate_limits
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint;

  IF v_count IS NULL OR v_window_start < now() - p_window THEN
    INSERT INTO public.api_rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, now())
    ON CONFLICT (user_id, endpoint)
    DO UPDATE SET request_count = 1, window_start = now();
    RETURN true;
  END IF;

  IF v_count < p_limit THEN
    UPDATE public.api_rate_limits
    SET request_count = request_count + 1
    WHERE user_id = p_user_id
      AND endpoint = p_endpoint;
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- ============================================================================
-- 3. UPDATE GRANTS (need to drop old signatures first)
-- ============================================================================

-- Revoke old uuid-based function grants (may fail if doesn't exist - OK)
DO $$ 
BEGIN
  REVOKE EXECUTE ON FUNCTION public.check_rate_limit(uuid, text, int, interval) FROM authenticated;
EXCEPTION WHEN undefined_function THEN
  NULL; -- Function with uuid signature doesn't exist anymore, that's fine
END $$;

-- Grant execute to authenticated users (text version)
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, int, interval) TO authenticated;

-- Grant execute to anon role for anonymous rate limiting
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, int, interval) TO anon;

-- ============================================================================
-- 4. UPDATE RLS POLICIES FOR TEXT-BASED user_id
-- ============================================================================

-- Drop and recreate policies to handle text-based user_id
DROP POLICY IF EXISTS "api_rate_limits_select_own" ON public.api_rate_limits;
CREATE POLICY "api_rate_limits_select_own"
ON public.api_rate_limits FOR SELECT
USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "api_rate_limits_modify_own" ON public.api_rate_limits;
CREATE POLICY "api_rate_limits_modify_own"
ON public.api_rate_limits FOR ALL
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- Recreate admin policy (was dropped at start)
DROP POLICY IF EXISTS "api_rate_limits_admin_all" ON public.api_rate_limits;
CREATE POLICY "api_rate_limits_admin_all"
ON public.api_rate_limits FOR SELECT
USING (public.is_admin());

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
-- After this migration:
-- - user_id accepts both UUIDs (as text) and IP addresses
-- - Anonymous users can be rate limited by IP
-- - Authenticated users continue to be rate limited by user ID
-- - RLS policies still work (comparing text to text)
