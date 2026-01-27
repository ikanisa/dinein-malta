-- Migration: Harden RLS and Indexes
-- Ensure performance and security for new and existing tables

-- 1. Indexes for performance and foreign keys (if missing)
CREATE INDEX IF NOT EXISTS idx_orders_venue_created ON public.orders(venue_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_created ON public.orders(client_auth_user_id, created_at DESC);

/*
DO $$
DECLARE
  t_name text;
BEGIN
  -- Determine table name
  IF to_regclass('public.service_requests') IS NOT NULL THEN
    t_name := 'service_requests';
  ELSIF to_regclass('public.waiter_rings') IS NOT NULL THEN
    t_name := 'waiter_rings';
  ELSIF to_regclass('public.bell_requests') IS NOT NULL THEN
    t_name := 'bell_requests';
  END IF;

  IF t_name IS NOT NULL THEN
    -- 1. Index
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_venue_status ON public.%I(venue_id, status)', t_name, t_name);

    -- 2. RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t_name);

    -- Public Insert
    EXECUTE format('DROP POLICY IF EXISTS "%s_insert_public" ON public.%I', t_name, t_name);
    EXECUTE format('CREATE POLICY "%s_insert_public" ON public.%I FOR INSERT WITH CHECK (true)', t_name, t_name);

    -- Owner Read/Update
    EXECUTE format('DROP POLICY IF EXISTS "%s_manage_owner" ON public.%I', t_name, t_name);
    EXECUTE format('CREATE POLICY "%s_manage_owner" ON public.%I FOR ALL USING (public.is_admin() OR public.can_manage_venue_ops(venue_id) OR (EXISTS (SELECT 1 FROM public.venues v WHERE v.id = venue_id AND v.owner_id = auth.uid()))) WITH CHECK (public.is_admin() OR public.can_manage_venue_ops(venue_id) OR (EXISTS (SELECT 1 FROM public.venues v WHERE v.id = venue_id AND v.owner_id = auth.uid())))', t_name, t_name);
  END IF;
END $$;
*/

-- 3. Harden Vendors Update (Owner only update own venue)
-- The "Enable update for owners based on owner_id" policy was added in 20260125000000_add_owner_id.sql
-- We verify it covers all stats.
-- We ensure Owners CANNOT change "country" or "owner_id" via a trigger or column grant, but RLS CHECK is hard for columns.
-- For now, we trust the API layer not to expose those fields to update, OR simple RLS check.
-- RLS check is safer:
DROP POLICY IF EXISTS "vendors_update_owner" ON public.venues;
CREATE POLICY "vendors_update_owner"
ON public.venues FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (
  auth.uid() = owner_id 
  -- Cannot change owner_id (it must match existing, which matches auth.uid)
  -- Cannot change country (requires looking up old record, which WITH CHECK can't easily do without complexity)
  -- For now, just owner link.
);

