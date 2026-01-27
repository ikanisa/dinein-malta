-- Migration: 20260128000000_cleanup_unused_tables.sql
-- Removes unused/duplicate tables that violate scope or are redundant
-- Safe to apply: No app code references these tables

-- 1. Drop user_addresses (violates "no delivery" scope - never used)
DROP TABLE IF EXISTS public.user_addresses CASCADE;

-- 2. Drop venue_claims (duplicate of onboarding_requests - code uses only onboarding_requests)
DROP TABLE IF EXISTS public.venue_claims CASCADE;

-- Note: Policies are automatically dropped with CASCADE
-- The following are just for safety if tables were already dropped but policies remained:

-- Clean up any orphaned user_addresses policies (if table was partially cleaned up before)
DO $$ 
BEGIN
    -- These will no-op if already dropped
    EXECUTE 'DROP POLICY IF EXISTS "user_addresses_select_own" ON public.user_addresses';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "user_addresses_insert_own" ON public.user_addresses';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "user_addresses_update_own" ON public.user_addresses';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "user_addresses_delete_own" ON public.user_addresses';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Clean up any orphaned venue_claims policies
DO $$ 
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "venue_claims_insert_auth" ON public.venue_claims';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "venue_claims_select_own_or_admin" ON public.venue_claims';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "venue_claims_update_admin" ON public.venue_claims';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "venue_claims_delete_own_pending" ON public.venue_claims';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Verification: List remaining tables to confirm cleanup
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
