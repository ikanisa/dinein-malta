-- Migration: Refactor Vendors to Venues
-- Critical refactor to rename 'vendors' to 'venues' across the entire schema.
-- Includes:
-- 1. Rename tables: vendors->venues, vendor_users->venue_users
-- 2. Rename columns: vendor_id->venue_id in ALL tables
-- 3. Rename types: vendor_role->venue_role, vendor_status->venue_status
-- 4. Recreate functions with new names
-- 5. Update RLS policies

BEGIN;

-- 1. Rename Tables
ALTER TABLE IF EXISTS public.vendors RENAME TO venues;
ALTER TABLE IF EXISTS public.vendor_users RENAME TO venue_users;

-- 2. Rename Types
-- Postgres doesn't easily rename enum values, but we can rename the TYPE itself.
ALTER TYPE public.vendor_role RENAME TO venue_role;
ALTER TYPE public.vendor_status RENAME TO venue_status;

-- 3. Rename Columns (References)

-- venues (was vendors) table corrections if needed? 
-- (owner_id, country columns are fine. idx names might need fixing but functional is priority)

-- venue_users (was vendor_users)
ALTER TABLE public.venue_users RENAME COLUMN vendor_id TO venue_id;

-- menu_items
ALTER TABLE public.menu_items RENAME COLUMN vendor_id TO venue_id;

-- tables
ALTER TABLE public.tables RENAME COLUMN vendor_id TO venue_id;

-- orders
ALTER TABLE public.orders RENAME COLUMN vendor_id TO venue_id;


-- reservations
ALTER TABLE public.reservations RENAME COLUMN vendor_id TO venue_id;

-- waiter_rings (if exists)
ALTER TABLE IF EXISTS public.waiter_rings RENAME COLUMN vendor_id TO venue_id;

-- bell_requests (if exists)
ALTER TABLE IF EXISTS public.bell_requests RENAME COLUMN vendor_id TO venue_id;

-- old constraints might be named 'vendors_...' or 'vendor_...'. Renaming columns often preserves constraints but references change.
-- We should rename indexes for clarity if safe, but functional first.


-- 4. Drop Old Functions (Moved to end to ensure policies are dropped first)
-- (See below)

-- 5. Create New Functions (Updated for 'venues', 'venue_id', 'venue_users')

-- is_venue_member
CREATE OR REPLACE FUNCTION public.is_venue_member(p_venue_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.venue_users vu
    WHERE vu.venue_id = p_venue_id
      AND vu.auth_user_id = auth.uid()
      AND vu.is_active = true
  );
$$;

-- venue_role_for
CREATE OR REPLACE FUNCTION public.venue_role_for(p_venue_id uuid)
RETURNS public.venue_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT vu.role
  FROM public.venue_users vu
  WHERE vu.venue_id = p_venue_id
    AND vu.auth_user_id = auth.uid()
    AND vu.is_active = true
  LIMIT 1;
$$;

-- can_edit_venue (was can_edit_vendor_profile)
CREATE OR REPLACE FUNCTION public.can_edit_venue(p_venue_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin()
     OR public.venue_role_for(p_venue_id) IN ('owner', 'manager')
     -- Also allow if auth.uid() is the owner_id on the venue itself (direct ownership)
     OR EXISTS (SELECT 1 FROM public.venues v WHERE v.id = p_venue_id AND v.owner_id = auth.uid());
$$;

-- can_manage_venue_ops (was can_manage_vendor_ops)
CREATE OR REPLACE FUNCTION public.can_manage_venue_ops(p_venue_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin()
     OR public.is_venue_member(p_venue_id)
     OR EXISTS (SELECT 1 FROM public.venues v WHERE v.id = p_venue_id AND v.owner_id = auth.uid());
$$;

-- 6. Update RLS Policies (Drop old defined on old names, create new)
-- Note: existing policies on 'venues' (renamed from vendors) persist but might be broken if they call old functions.
-- We must drop and recreate them.

-- VENUES Table
DROP POLICY IF EXISTS "vendors_select" ON public.venues;
DROP POLICY IF EXISTS "vendors_update" ON public.venues;
DROP POLICY IF EXISTS "vendors_update_owner" ON public.venues;
DROP POLICY IF EXISTS "vendors_insert_admin_only" ON public.venues;
DROP POLICY IF EXISTS "vendors_delete_admin_only" ON public.venues;
DROP POLICY IF EXISTS "Enable read access for public" ON public.venues; 
DROP POLICY IF EXISTS "Enable update for owners based on owner_id" ON public.venues;

CREATE POLICY "venues_select_public" ON public.venues FOR SELECT
USING (status = 'active' OR public.is_admin() OR public.is_venue_member(id) OR owner_id = auth.uid());

CREATE POLICY "venues_update_owner" ON public.venues FOR UPDATE
USING (public.can_edit_venue(id))
WITH CHECK (public.can_edit_venue(id));

CREATE POLICY "venues_insert_admin" ON public.venues FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "venues_delete_admin" ON public.venues FOR DELETE
USING (public.is_admin());

-- VENUE_USERS Table
DROP POLICY IF EXISTS "vendor_users_select" ON public.venue_users;
DROP POLICY IF EXISTS "vendor_users_write" ON public.venue_users;

CREATE POLICY "venue_users_select" ON public.venue_users FOR SELECT
USING (public.is_admin() OR public.is_venue_member(venue_id) OR auth_user_id = auth.uid());

CREATE POLICY "venue_users_write" ON public.venue_users FOR ALL
USING (public.can_edit_venue(venue_id))
WITH CHECK (public.can_edit_venue(venue_id));

-- MENU_ITEMS Table
DROP POLICY IF EXISTS "menu_items_select" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items_write" ON public.menu_items;

CREATE POLICY "menu_items_select" ON public.menu_items FOR SELECT
USING (
  public.is_admin() 
  OR public.is_venue_member(venue_id)
  OR EXISTS (SELECT 1 FROM public.venues v WHERE v.id = venue_id AND v.status = 'active')
);

CREATE POLICY "menu_items_write" ON public.menu_items FOR ALL
USING (public.can_edit_venue(venue_id))
WITH CHECK (public.can_edit_venue(venue_id));


-- MENUS Table (Check existence first)
DO $$
BEGIN
  IF to_regclass('public.menus') IS NOT NULL THEN
    DROP POLICY IF EXISTS "menus_read_public" ON public.menus; 
    DROP POLICY IF EXISTS "menus_manage_owner" ON public.menus;
  END IF;
END $$;

-- Policies will be recreated in Normalize Menus migration if checking there, 
-- but Refactor script tries to recreate them below? 
-- Wait, Refactor script DOES recreate them: 
-- CREATE POLICY "menus_read_public" ...
-- This will FAIL if table doesn't exist.

-- IF table doesn't exist, we should NOT create policies either.
-- But Refactor usually assumes it DOES exist (i.e. we are refactoring an existing schema).
-- Since we moved Refactor BEFORE Normalize Menus, the Menus table doesn't exist.
-- So we should probably COMMENT OUT or REMOVE the policy creation for Menus in this Refactor script,
-- because Normalize Menus (`...04`) will create the table and its policies anyway!

-- Let's check `...04`:
-- It has: CREATE POLICY "menus_read_public" ...
-- So YES, `...04` creates them.
-- So `Refactor` does NOT need to create them if `Menus` doesn't exist yet.

-- If `Menus` DOES exist (from older migration), we want to update them.
-- So we should wrap Creation in `IF EXISTS` too.

-- But Standard SQL doesn't support `CREATE POLICY IF EXISTS` or `IF table exists`.
-- So we must use DO block for creation too.



-- Create Menus Policies (if table exists)
DO $$
BEGIN
  IF to_regclass('public.menus') IS NOT NULL THEN
    -- Recreate policies
    -- (We use dynamic SQL if we want to be safe against 'relation does not exist' at parse time, 
    -- but usually inside a DO block PL/PGSQL verifies at runtime? 
    -- Actually, if the table doesn't exist, 'CREATE POLICY ... ON public.menus' might fail parsing if not dynamic.
    -- Dynamic SQL 'EXECUTE format(...)' is safer.)
    
    EXECUTE 'CREATE POLICY "menus_read_public" ON public.menus FOR SELECT USING (is_active = true OR public.is_admin() OR public.is_venue_member(venue_id))';
    EXECUTE 'CREATE POLICY "menus_manage_owner" ON public.menus FOR ALL USING (public.can_edit_venue(venue_id))';
  END IF;
END $$;



-- MENU_CATEGORIES (linked to menu, indirectly venue)
DO $$
BEGIN
  IF to_regclass('public.menu_categories') IS NOT NULL AND to_regclass('public.menus') IS NOT NULL THEN
    DROP POLICY IF EXISTS "categories_read_public" ON public.menu_categories;
    DROP POLICY IF EXISTS "categories_manage_owner" ON public.menu_categories;

    EXECUTE 'CREATE POLICY "categories_read_public" ON public.menu_categories FOR SELECT USING (EXISTS (SELECT 1 FROM public.menus m WHERE m.id = menu_id AND (m.is_active = true OR public.is_admin() OR public.is_venue_member(m.venue_id))))';
    
    EXECUTE 'CREATE POLICY "categories_manage_owner" ON public.menu_categories FOR ALL USING (EXISTS (SELECT 1 FROM public.menus m WHERE m.id = menu_id AND (public.is_admin() OR public.can_edit_venue(m.venue_id))))';
  END IF;
END $$;

-- TABLES Table
DROP POLICY IF EXISTS "tables_select" ON public.tables;
DROP POLICY IF EXISTS "tables_write" ON public.tables;

CREATE POLICY "tables_select" ON public.tables FOR SELECT
USING (public.can_manage_venue_ops(venue_id));

CREATE POLICY "tables_write" ON public.tables FOR ALL
USING (public.can_edit_venue(venue_id))
WITH CHECK (public.can_edit_venue(venue_id));

-- ORDERS Table
DROP POLICY IF EXISTS "orders_select" ON public.orders;
DROP POLICY IF EXISTS "orders_update_vendor" ON public.orders;
-- 'orders_insert_client' stays same (uses client_auth_user_id)

CREATE POLICY "orders_select" ON public.orders FOR SELECT
USING (public.is_admin() OR public.is_venue_member(venue_id) OR client_auth_user_id = auth.uid());

CREATE POLICY "orders_update_venue" ON public.orders FOR UPDATE
USING (public.can_manage_venue_ops(venue_id))
WITH CHECK (public.can_manage_venue_ops(venue_id));

-- ORDER_ITEMS (uses order_id, indirectly venue)
DROP POLICY IF EXISTS "order_items_select" ON public.order_items;

CREATE POLICY "order_items_select" ON public.order_items FOR SELECT
USING (
  public.is_admin()
  OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND public.is_venue_member(o.venue_id))
  OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.client_auth_user_id = auth.uid())
);


-- SERVICE_REQUESTS (Bell Calls)
DO $$
BEGIN
  IF to_regclass('public.service_requests') IS NOT NULL THEN
    DROP POLICY IF EXISTS "service_requests_manage_owner" ON public.service_requests;
    
    EXECUTE 'CREATE POLICY "service_requests_manage_owner" ON public.service_requests FOR ALL USING (public.can_manage_venue_ops(venue_id)) WITH CHECK (public.can_manage_venue_ops(venue_id))';
  END IF;
END $$;

-- PROMOTIONS
DO $$
BEGIN
  IF to_regclass('public.promotions') IS NOT NULL THEN
    DROP POLICY IF EXISTS "promotions_manage_owner_admin" ON public.promotions;
    
    EXECUTE 'CREATE POLICY "promotions_manage_owner_admin" ON public.promotions FOR ALL USING (public.can_manage_venue_ops(venue_id))';
  END IF;
END $$;



-- Additional Policy Drops for tables missed in main block but dependent on functions
DO $$
BEGIN

  IF to_regclass('public.reservations') IS NOT NULL THEN
    DROP POLICY IF EXISTS "reservations_select" ON public.reservations;
    DROP POLICY IF EXISTS "reservations_update_vendor" ON public.reservations;
  END IF;

  IF to_regclass('public.tables') IS NOT NULL THEN
    DROP POLICY IF EXISTS "tables_select_public_by_code" ON public.tables;
  END IF;

  IF to_regclass('public.waiter_rings') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Vendors can view their rings" ON public.waiter_rings;
    DROP POLICY IF EXISTS "Vendors can update their rings" ON public.waiter_rings;
  END IF;


  IF to_regclass('public.menu_ingest_jobs') IS NOT NULL THEN
    DROP POLICY IF EXISTS "ingest_jobs_select" ON public.menu_ingest_jobs;
    DROP POLICY IF EXISTS "ingest_jobs_insert" ON public.menu_ingest_jobs;
    DROP POLICY IF EXISTS "ingest_jobs_update" ON public.menu_ingest_jobs;
  END IF;

  IF to_regclass('public.menu_items_staging') IS NOT NULL THEN
    DROP POLICY IF EXISTS "staging_items_select" ON public.menu_items_staging;
    DROP POLICY IF EXISTS "staging_items_insert" ON public.menu_items_staging;
    DROP POLICY IF EXISTS "staging_items_update" ON public.menu_items_staging;
    DROP POLICY IF EXISTS "staging_items_delete" ON public.menu_items_staging;
  END IF;

  -- storage.objects usually exists, but policy check is safe
  -- We can't easily check 'storage.objects', assume it exists or wrap in exception block
  BEGIN
    DROP POLICY IF EXISTS "menu_uploads_select" ON storage.objects;
    DROP POLICY IF EXISTS "menu_uploads_insert" ON storage.objects;
    DROP POLICY IF EXISTS "menu_uploads_delete" ON storage.objects;
  EXCEPTION WHEN undefined_table THEN
    NULL; -- Ignore
  END;
END $$;

-- 4. Drop Old Functions (Now safe to drop)
DROP FUNCTION IF EXISTS public.is_vendor_member(uuid);
DROP FUNCTION IF EXISTS public.vendor_role_for(uuid);
DROP FUNCTION IF EXISTS public.can_edit_vendor_profile(uuid);
DROP FUNCTION IF EXISTS public.can_manage_vendor_ops(uuid);

COMMIT;
