-- Verification Script for RLS policies, Schema Integrity, and Indexes
-- usage: supabase db execute --file supabase/tests/rls_check.sql

BEGIN;

-- Helper to assert
CREATE OR REPLACE FUNCTION assert(condition boolean, message text) RETURNS void AS $$
BEGIN
  IF NOT condition THEN
    RAISE EXCEPTION 'Assertion failed: %', message;
  END IF;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  v_count INT;
BEGIN
  -- 1. Check Seeding
  SELECT count(*) INTO v_count FROM public.countries;
  PERFORM assert(v_count >= 2, 'Should have at least 2 countries');
  
  -- 2. Check Table Structure & Constraints
  PERFORM assert(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'active_country'), 'profiles missing active_country');
  PERFORM assert(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_admin'), 'profiles missing is_admin');

  -- Verify Constraint Removal (orders currency)
  PERFORM assert(NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'orders' AND constraint_name = 'orders_currency_eur_chk'
  ), 'Legacy constraint orders_currency_eur_chk still exists');

  -- 3. Verify RLS Policies Exist
  PERFORM assert(EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'promotions' AND policyname = 'promotions_read_public'), 'Missing: promotions_read_public');
  PERFORM assert(EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'menus' AND policyname = 'menus_read_public'), 'Missing: menus_read_public');
  PERFORM assert(EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_own'), 'Missing: profiles_update_own');
  PERFORM assert(EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vendors' AND policyname = 'vendors_update_owner'), 'Missing: vendors_update_owner');
  PERFORM assert(EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'venue_claims' AND policyname = 'venue_claims_update_admin'), 'Missing: venue_claims_update_admin');

  -- 4. Verify Indexes (Polish)
  PERFORM assert(EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'vendors' AND indexname = 'idx_vendors_country_status'
  ), 'Missing index: idx_vendors_country_status');

  PERFORM assert(EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'menu_items' AND indexname = 'idx_menu_items_category_sort'
  ), 'Missing index: idx_menu_items_category_sort');

  PERFORM assert(EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'service_requests' AND indexname = 'idx_service_requests_venue_status_created'
  ), 'Missing index: idx_service_requests_venue_status_created');

  RAISE NOTICE 'Schema, Constraints, RLS, and Indexes Verified Successfully';
END $$;

ROLLBACK; -- Don't keep updates
