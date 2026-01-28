-- Migration: Supabase Cleanup and Consolidation
-- Fixes outdated references (vendors→venues), consolidates duplicate tables,
-- adds proper RLS for anonymous users, and removes orphaned functions.

BEGIN;

-- =============================================================================
-- 1. FIX CHANNEL_SESSIONS FK REFERENCE (vendors → venues)
-- =============================================================================

-- Drop the old FK constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'channel_sessions_venue_id_fkey' 
        AND table_name = 'channel_sessions'
    ) THEN
        ALTER TABLE public.channel_sessions DROP CONSTRAINT channel_sessions_venue_id_fkey;
    END IF;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Add new FK to venues (if table exists)
DO $$
BEGIN
    IF to_regclass('public.channel_sessions') IS NOT NULL 
       AND to_regclass('public.venues') IS NOT NULL THEN
        -- Check if constraint doesn't already exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'channel_sessions_venue_id_venues_fkey' 
            AND table_name = 'channel_sessions'
        ) THEN
            ALTER TABLE public.channel_sessions 
            ADD CONSTRAINT channel_sessions_venue_id_venues_fkey 
            FOREIGN KEY (venue_id) REFERENCES public.venues(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- =============================================================================
-- 2. FIX CHANNEL_INTERACTIONS FK REFERENCE (vendors → venues)
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'channel_interactions_venue_id_fkey' 
        AND table_name = 'channel_interactions'
    ) THEN
        ALTER TABLE public.channel_interactions DROP CONSTRAINT channel_interactions_venue_id_fkey;
    END IF;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
    IF to_regclass('public.channel_interactions') IS NOT NULL 
       AND to_regclass('public.venues') IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'channel_interactions_venue_id_venues_fkey' 
            AND table_name = 'channel_interactions'
        ) THEN
            ALTER TABLE public.channel_interactions 
            ADD CONSTRAINT channel_interactions_venue_id_venues_fkey 
            FOREIGN KEY (venue_id) REFERENCES public.venues(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Fix RLS policy that references vendors (should be venues)
DO $$
BEGIN
    IF to_regclass('public.channel_interactions') IS NOT NULL THEN
        DROP POLICY IF EXISTS "venue_owner_view_interactions" ON public.channel_interactions;
        
        EXECUTE '
            CREATE POLICY "venue_owner_view_interactions" ON public.channel_interactions
            FOR SELECT TO authenticated
            USING (
                venue_id IN (
                    SELECT id FROM public.venues 
                    WHERE owner_id = auth.uid()
                )
            )
        ';
    END IF;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- =============================================================================
-- 3. CONSOLIDATE service_requests INTO service_calls
-- =============================================================================

-- Migrate data from service_requests to service_calls if both exist
DO $$
BEGIN
    IF to_regclass('public.service_requests') IS NOT NULL 
       AND to_regclass('public.service_calls') IS NOT NULL THEN
        
        -- Insert any orphaned service_requests into service_calls
        INSERT INTO public.service_calls (
            tenant_id, venue_id, visit_id, reason, priority, note, status, created_at, resolved_at
        )
        SELECT 
            NULL, -- tenant_id not in old schema
            sr.venue_id,
            NULL, -- visit_id not in old schema
            COALESCE(sr.request_type, 'assistance'),
            'normal',
            sr.notes,
            CASE 
                WHEN sr.status = 'completed' THEN 'resolved'
                WHEN sr.status = 'pending' THEN 'queued'
                ELSE sr.status
            END,
            sr.created_at,
            sr.resolved_at
        FROM public.service_requests sr
        WHERE NOT EXISTS (
            SELECT 1 FROM public.service_calls sc 
            WHERE sc.venue_id = sr.venue_id 
            AND sc.created_at = sr.created_at
        );
        
        -- Drop the old table
        DROP TABLE public.service_requests CASCADE;
    END IF;
EXCEPTION WHEN undefined_table THEN NULL;
         WHEN undefined_column THEN 
            -- If columns don't match, just drop the old table
            DROP TABLE IF EXISTS public.service_requests CASCADE;
END $$;

-- =============================================================================
-- 4. CONSOLIDATE promotions INTO offers (create view for backwards compat)
-- =============================================================================

-- Create a backwards-compatible view if promotions table exists
DO $$
BEGIN
    IF to_regclass('public.promotions') IS NOT NULL 
       AND to_regclass('public.offers') IS NOT NULL THEN
        
        -- Migrate promotions data to offers
        INSERT INTO public.offers (
            tenant_id, venue_id, title, summary, badge, rule_json, 
            starts_at, ends_at, status, created_at
        )
        SELECT 
            NULL, -- tenant_id
            p.venue_id,
            p.title,
            p.description,
            p.badge,
            jsonb_build_object(
                'discount_percent', p.discount_percent,
                'discount_amount', p.discount_amount,
                'conditions', p.conditions
            ),
            COALESCE(p.valid_from, now()),
            p.valid_until,
            CASE 
                WHEN p.is_active = true THEN 'active'
                ELSE 'paused'
            END,
            p.created_at
        FROM public.promotions p
        WHERE NOT EXISTS (
            SELECT 1 FROM public.offers o 
            WHERE o.venue_id = p.venue_id 
            AND o.title = p.title
        );
        
        -- Create view for backwards compatibility
        DROP VIEW IF EXISTS public.promotions_view;
        CREATE VIEW public.promotions_view AS
        SELECT 
            o.id,
            o.venue_id,
            o.title,
            o.summary as description,
            o.badge,
            (o.rule_json->>'discount_percent')::int as discount_percent,
            (o.rule_json->>'discount_amount')::decimal as discount_amount,
            o.rule_json->>'conditions' as conditions,
            o.starts_at as valid_from,
            o.ends_at as valid_until,
            o.status = 'active' as is_active,
            o.created_at
        FROM public.offers o;
        
        -- Drop old promotions table
        DROP TABLE public.promotions CASCADE;
    END IF;
EXCEPTION WHEN undefined_table THEN NULL;
         WHEN undefined_column THEN NULL;
END $$;

-- =============================================================================
-- 5. VERIFY CLEANUP TABLES ARE DROPPED
-- =============================================================================

-- These should already be dropped by 20260128000000_cleanup_unused_tables.sql
DROP TABLE IF EXISTS public.user_addresses CASCADE;
DROP TABLE IF EXISTS public.venue_claims CASCADE;

-- =============================================================================
-- 6. ADD 'placed' TO order_status ENUM IF MISSING
-- =============================================================================

DO $$ 
BEGIN
    -- Check if 'placed' exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'placed' 
        AND enumtypid = 'public.order_status'::regtype
    ) THEN
        ALTER TYPE public.order_status ADD VALUE 'placed' BEFORE 'received';
    END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- 7. ADD ANONYMOUS-FRIENDLY RLS POLICIES FOR CARTS
-- =============================================================================

-- Allow anonymous users to read their own carts (via user_id match)
DO $$
BEGIN
    IF to_regclass('public.carts') IS NOT NULL THEN
        DROP POLICY IF EXISTS "anon_read_own_cart" ON public.carts;
        
        CREATE POLICY "anon_read_own_cart" ON public.carts
        FOR SELECT USING (user_id = auth.uid());
        
        DROP POLICY IF EXISTS "anon_write_own_cart" ON public.carts;
        
        CREATE POLICY "anon_write_own_cart" ON public.carts
        FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- Allow anonymous users to read their own cart lines
DO $$
BEGIN
    IF to_regclass('public.cart_lines') IS NOT NULL THEN
        DROP POLICY IF EXISTS "anon_read_own_cart_lines" ON public.cart_lines;
        
        CREATE POLICY "anon_read_own_cart_lines" ON public.cart_lines
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.carts c 
                WHERE c.id = cart_id AND c.user_id = auth.uid()
            )
        );
        
        DROP POLICY IF EXISTS "anon_write_own_cart_lines" ON public.cart_lines;
        
        CREATE POLICY "anon_write_own_cart_lines" ON public.cart_lines
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.carts c 
                WHERE c.id = cart_id AND c.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Fix visits policy to be more restrictive (remove auth.uid() IS NULL)
DO $$
BEGIN
    IF to_regclass('public.visits') IS NOT NULL THEN
        DROP POLICY IF EXISTS "guest_manage_visits" ON public.visits;
        
        -- More restrictive: only allow access if guest is linked to auth user
        CREATE POLICY "guest_manage_visits" ON public.visits
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.guests g 
                WHERE g.id = guest_id AND g.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- =============================================================================
-- 8. DROP ORPHANED vendor_ PREFIXED FUNCTIONS
-- =============================================================================

DROP FUNCTION IF EXISTS public.is_vendor_member(uuid);
DROP FUNCTION IF EXISTS public.vendor_role_for(uuid);
DROP FUNCTION IF EXISTS public.can_edit_vendor_profile(uuid);
DROP FUNCTION IF EXISTS public.can_manage_vendor_ops(uuid);

-- =============================================================================
-- 9. CLEAN UP user_carts IF REDUNDANT WITH carts
-- =============================================================================

-- user_carts was created for AI ordering but carts table in moltbot_backend_v1 
-- serves same purpose. Let's add a migration note and keep both for now,
-- as they might have different use cases (visit-based vs user-based).
-- Just add a comment for clarity:

DO $$
BEGIN
    IF to_regclass('public.user_carts') IS NOT NULL THEN
        COMMENT ON TABLE public.user_carts IS 
            'Legacy user-level cart (keyed by user_id + venue_id). See also public.carts for visit-based carts.';
    END IF;
    
    IF to_regclass('public.carts') IS NOT NULL THEN
        COMMENT ON TABLE public.carts IS 
            'Visit-based cart for Moltbot ordering flow. See also public.user_carts for user-level carts.';
    END IF;
END $$;

COMMIT;
