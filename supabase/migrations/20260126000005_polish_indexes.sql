-- Migration: Polish Indexes and Constraints
-- Finalizing performance indexes for foreign keys and common filters

-- 1. Vendors Country Filter
CREATE INDEX IF NOT EXISTS idx_vendors_country_status ON public.vendors(country, status);

-- 2. Menu Items Navigation
-- Used when fetching items for a category
CREATE INDEX IF NOT EXISTS idx_menu_items_category_sort ON public.menu_items(category_id, sort_order);

-- 3. Service Requests Sorting
-- Used for "Bell Calls" list in Venue Portal
DROP INDEX IF EXISTS idx_service_requests_venue_status; -- Dropping less specific one if it existed from previous mismatch
CREATE INDEX IF NOT EXISTS idx_service_requests_venue_status_created ON public.service_requests(venue_id, status, created_at DESC);

-- 4. Audit Logs Sorting
-- Ensure we can page through logs efficiently
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_actor ON public.audit_logs(created_at DESC, actor_auth_user_id);

-- 5. Uniqueness Constraints (Verification/Harden)
-- Ensure slugs are unique (already exists, but good to be explicit in comments or verification)
-- venues.slug is UNIQUE (checked in schema)
-- venue_claims (venue_id, user_id) is UNIQUE (checked in schema)

COMMENT ON INDEX public.idx_vendors_country_status IS 'Optimize filtering venues by country';
COMMENT ON INDEX public.idx_menu_items_category_sort IS 'Optimize menu rendering';
