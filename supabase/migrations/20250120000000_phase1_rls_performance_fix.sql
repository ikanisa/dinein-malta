-- Phase 1: Fix RLS Performance Issues
-- Wraps auth.uid() calls in SELECT subqueries to prevent re-evaluation per row
-- This significantly improves query performance at scale

-- Fix profiles table policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = id);

-- Fix vendor_users policies
DROP POLICY IF EXISTS "vendor_users_select" ON public.vendor_users;
CREATE POLICY "vendor_users_select"
  ON public.vendor_users FOR SELECT
  USING (
    public.is_admin() 
    OR public.is_vendor_member(vendor_id) 
    OR (SELECT auth.uid()) = auth_user_id
  );

-- Fix orders policies
DROP POLICY IF EXISTS "orders_select" ON public.orders;
CREATE POLICY "orders_select"
  ON public.orders FOR SELECT
  USING (
    public.is_admin() 
    OR public.is_vendor_member(vendor_id) 
    OR client_auth_user_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "orders_insert_client" ON public.orders;
CREATE POLICY "orders_insert_client"
  ON public.orders FOR INSERT
  WITH CHECK (client_auth_user_id = (SELECT auth.uid()));

-- Fix order_items policies
DROP POLICY IF EXISTS "order_items_select" ON public.order_items;
CREATE POLICY "order_items_select"
  ON public.order_items FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_id 
      AND public.is_vendor_member(o.vendor_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_id 
      AND o.client_auth_user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;
CREATE POLICY "order_items_insert"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o 
      WHERE o.id = order_id 
      AND o.client_auth_user_id = (SELECT auth.uid())
    )
  );

-- Fix reservations policies
DROP POLICY IF EXISTS "reservations_select" ON public.reservations;
CREATE POLICY "reservations_select"
  ON public.reservations FOR SELECT
  USING (
    public.is_admin() 
    OR public.is_vendor_member(vendor_id) 
    OR client_auth_user_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "reservations_insert_client" ON public.reservations;
CREATE POLICY "reservations_insert_client"
  ON public.reservations FOR INSERT
  WITH CHECK (client_auth_user_id = (SELECT auth.uid()));

-- Note: Helper functions (is_admin, is_vendor_member, etc.) already use auth.uid()
-- inside their bodies, which is fine since they're security definer functions.
-- The optimization is needed in RLS policies where auth.uid() is called directly.

