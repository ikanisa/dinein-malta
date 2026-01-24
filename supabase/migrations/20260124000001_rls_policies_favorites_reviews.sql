-- ==========================================
-- MIGRATION: RLS Policies for favorites & reviews
-- ==========================================
-- Creates proper RLS policies for the newly protected tables.
--
-- ROLLBACK PROCEDURE:
-- DROP POLICY IF EXISTS "favorites_select_own" ON public.favorites;
-- DROP POLICY IF EXISTS "favorites_insert_own" ON public.favorites;
-- DROP POLICY IF EXISTS "favorites_delete_own" ON public.favorites;
-- DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
-- DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;
-- DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
-- DROP POLICY IF EXISTS "reviews_delete_admin_or_own" ON public.reviews;

-- ============================================================================
-- 1. FAVORITES TABLE POLICIES
-- ============================================================================
-- Users can only see, add, and remove their own favorites.

-- SELECT: Users see only their own favorites
DROP POLICY IF EXISTS "favorites_select_own" ON public.favorites;
CREATE POLICY "favorites_select_own"
ON public.favorites FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- INSERT: Users can only add favorites for themselves
DROP POLICY IF EXISTS "favorites_insert_own" ON public.favorites;
CREATE POLICY "favorites_insert_own"
ON public.favorites FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- DELETE: Users can only remove their own favorites
DROP POLICY IF EXISTS "favorites_delete_own" ON public.favorites;
CREATE POLICY "favorites_delete_own"
ON public.favorites FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Admin can manage all favorites
DROP POLICY IF EXISTS "favorites_admin_all" ON public.favorites;
CREATE POLICY "favorites_admin_all"
ON public.favorites FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================================
-- 2. REVIEWS TABLE POLICIES
-- ============================================================================
-- Reviews are publicly readable (helps with venue discovery).
-- Only authenticated users can post reviews.
-- Users can only edit/delete their own reviews (or admin).

-- SELECT: Anyone can read reviews (including anonymous)
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
CREATE POLICY "reviews_select_public"
ON public.reviews FOR SELECT
USING (true);

-- INSERT: Only authenticated users can post reviews
DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;
CREATE POLICY "reviews_insert_authenticated"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- UPDATE: Users can only update their own reviews
DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
CREATE POLICY "reviews_update_own"
ON public.reviews FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Users can delete their own reviews, or admin can delete any
DROP POLICY IF EXISTS "reviews_delete_admin_or_own" ON public.reviews;
CREATE POLICY "reviews_delete_admin_or_own"
ON public.reviews FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() 
  OR public.is_admin()
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  policy_count integer;
BEGIN
  -- Check favorites policies
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE schemaname = 'public' AND tablename = 'favorites';
  
  IF policy_count < 3 THEN
    RAISE EXCEPTION 'Expected at least 3 policies on favorites, got %', policy_count;
  END IF;
  
  -- Check reviews policies
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE schemaname = 'public' AND tablename = 'reviews';
  
  IF policy_count < 4 THEN
    RAISE EXCEPTION 'Expected at least 4 policies on reviews, got %', policy_count;
  END IF;
  
  RAISE NOTICE 'RLS policies created successfully';
END $$;
