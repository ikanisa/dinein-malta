-- Migration: Polish Indexes and Constraints
-- Finalizing performance indexes for foreign keys and common filters


-- 1. Venues Country Filter
CREATE INDEX IF NOT EXISTS idx_venues_country_status ON public.venues(country, status);

-- 2. Menu Items Navigation
-- Used when fetching items for a category
CREATE INDEX IF NOT EXISTS idx_menu_items_category_sort ON public.menu_items(category_id, sort_order);

-- 3. Service Requests Sorting
-- Used for "Bell Calls" list in Venue Portal

DO $$
DECLARE
  t_name text;
BEGIN
  IF to_regclass('public.service_requests') IS NOT NULL THEN
    t_name := 'service_requests';
  ELSIF to_regclass('public.waiter_rings') IS NOT NULL THEN
    t_name := 'waiter_rings';
  ELSIF to_regclass('public.bell_requests') IS NOT NULL THEN
    t_name := 'bell_requests';
  END IF;

  IF t_name IS NOT NULL THEN
    -- Patch: Ensure column is renamed to venue_id (Fix for skipped Refactor changes)
    -- We try to rename vendor_id -> venue_id if vendor_id exists
    BEGIN
      EXECUTE format('ALTER TABLE public.%I RENAME COLUMN vendor_id TO venue_id', t_name);
    EXCEPTION WHEN OTHERS THEN
      -- Ignore if column doesn't exist or already renamed
      NULL;
    END;

    EXECUTE format('DROP INDEX IF EXISTS idx_%I_venue_status', t_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_venue_status_created ON public.%I(venue_id, status, created_at DESC)', t_name, t_name);
  END IF;
END $$;

-- 4. Audit Logs Sorting
-- Ensure we can page through logs efficiently
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_actor ON public.audit_logs(created_at DESC, actor_auth_user_id);

-- 5. Uniqueness Constraints (Verification/Harden)
-- Ensure slugs are unique (already exists, but good to be explicit in comments or verification)
-- venues.slug is UNIQUE (checked in schema)
-- venue_claims (venue_id, user_id) is UNIQUE (checked in schema)

COMMENT ON INDEX public.idx_venues_country_status IS 'Optimize filtering venues by country';
COMMENT ON INDEX public.idx_menu_items_category_sort IS 'Optimize menu rendering';
