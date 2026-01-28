-- Migration: Rollout Infrastructure (WF-NEXT-14)
-- Feature flags, rollout modes, kill switches, KPIs, and cohorts for safe AI rollout

BEGIN;

-- =============================================================================
-- 1. FEATURE FLAGS
-- =============================================================================

-- Feature flag definitions
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_key TEXT NOT NULL UNIQUE,
    default_enabled BOOLEAN NOT NULL DEFAULT false,
    scope TEXT[] NOT NULL DEFAULT ARRAY['global']::TEXT[], -- 'tenant', 'venue', 'cohort'
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default feature flags
INSERT INTO public.feature_flags (flag_key, default_enabled, scope, description) VALUES
    ('ui_plan_enabled', false, ARRAY['tenant', 'venue', 'cohort'], 'Enable AI-powered UIPlan generation'),
    ('waiter_enabled', false, ARRAY['tenant', 'venue', 'cohort'], 'Enable AI Waiter chat assistant'),
    ('cart_enabled', false, ARRAY['tenant', 'venue', 'cohort'], 'Enable AI cart management'),
    ('pricing_quote_enabled', false, ARRAY['tenant', 'venue', 'cohort'], 'Enable AI pricing quotes'),
    ('order_submit_enabled', false, ARRAY['tenant', 'venue', 'cohort'], 'Enable AI order submission'),
    ('realtime_enabled', false, ARRAY['tenant', 'venue'], 'Enable realtime order/status updates'),
    ('research_enabled', false, ARRAY['tenant'], 'Enable research intel agent')
ON CONFLICT (flag_key) DO NOTHING;

-- Feature flag overrides (per tenant/venue/cohort)
CREATE TABLE IF NOT EXISTS public.feature_flag_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_key TEXT NOT NULL REFERENCES public.feature_flags(flag_key) ON DELETE CASCADE,
    scope_type TEXT NOT NULL CHECK (scope_type IN ('tenant', 'venue', 'cohort')),
    scope_id UUID NOT NULL, -- tenant_id, venue_id, or cohort_id
    enabled BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(flag_key, scope_type, scope_id)
);

CREATE INDEX IF NOT EXISTS idx_flag_overrides_scope ON public.feature_flag_overrides(scope_type, scope_id);

-- =============================================================================
-- 2. ROLLOUT MODES
-- =============================================================================

-- Rollout mode per venue
CREATE TABLE IF NOT EXISTS public.rollout_modes (
    venue_id UUID PRIMARY KEY REFERENCES public.venues(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('off', 'shadow_ui', 'assisted', 'full')) DEFAULT 'off',
    enabled_flags JSONB DEFAULT '{}'::jsonb, -- Override flags specific to this venue
    transition_history JSONB DEFAULT '[]'::jsonb, -- Array of {from, to, at, by}
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Default all venues to 'off' mode
INSERT INTO public.rollout_modes (venue_id, mode)
SELECT id, 'off' FROM public.venues
ON CONFLICT (venue_id) DO NOTHING;

-- =============================================================================
-- 3. KILL SWITCHES
-- =============================================================================

-- Kill switches for emergency shutdown
CREATE TABLE IF NOT EXISTS public.kill_switches (
    id TEXT PRIMARY KEY, -- e.g., 'disable_all_ai'
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    scope TEXT NOT NULL DEFAULT 'global', -- 'global', 'venue:{uuid}', 'tenant:{uuid}'
    activated_at TIMESTAMPTZ,
    activated_by UUID REFERENCES auth.users(id),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default kill switches
INSERT INTO public.kill_switches (id, description, is_active) VALUES
    ('disable_all_ai', 'Shuts off all /ai/* endpoints, returns static fallback UI', false),
    ('disable_order_submit', 'Blocks order.submit globally or per venue (PRECONDITION_FAILED)', false),
    ('disable_service_calls', 'Blocks service.call_staff and request_bill', false),
    ('reduce_ai_rate_limits', 'Lower rate thresholds for suspicious sessions', false),
    ('force_readonly_ui', 'Revert to Shadow UI (RM-1) behavior for a venue', false)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 4. ROLLOUT COHORTS
-- =============================================================================

-- Cohort definitions for staged rollout
CREATE TABLE IF NOT EXISTS public.rollout_cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    phase TEXT CHECK (phase IN ('pilot', 'expansion_1', 'expansion_2', 'general')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Venue-to-cohort assignments
CREATE TABLE IF NOT EXISTS public.venue_cohort_assignments (
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES public.rollout_cohorts(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (venue_id, cohort_id)
);

-- Seed pilot cohort
INSERT INTO public.rollout_cohorts (name, description, phase) VALUES
    ('pilot_kigali', 'Initial pilot venues in Kigali', 'pilot'),
    ('pilot_malta', 'Initial pilot venues in Malta', 'pilot')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 5. KPI SNAPSHOTS
-- =============================================================================

-- KPI tracking for rollout decisions
CREATE TABLE IF NOT EXISTS public.kpi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
    snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    period_minutes INT NOT NULL DEFAULT 60, -- How long this snapshot covers
    sample_size INT DEFAULT 0, -- Number of events aggregated
    
    -- Reliability KPIs
    uiplan_valid_rate NUMERIC(5,4), -- 0.0000 to 1.0000
    agent_latency_p95_ms INT,
    tool_error_rate NUMERIC(5,4),
    realtime_delivery_rate NUMERIC(5,4),
    
    -- Security KPIs
    tenant_mismatch_count INT DEFAULT 0,
    forbidden_tool_attempts INT DEFAULT 0,
    approval_bypass_attempts INT DEFAULT 0,
    
    -- Business KPIs
    home_to_venue_ctr NUMERIC(5,4),
    menu_to_cart_rate NUMERIC(5,4),
    checkout_to_submit_rate NUMERIC(5,4),
    avg_order_value NUMERIC(10,2),
    service_call_sla_seconds INT,
    
    -- UX Quality KPIs
    bounce_rate NUMERIC(5,4),
    user_reported_issues INT DEFAULT 0,
    allergy_warning_compliance NUMERIC(5,4)
);

CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_venue_time ON public.kpi_snapshots(venue_id, snapshot_at DESC);


-- =============================================================================
-- 6. ROLLOUT GATES (Transition Validation)
-- =============================================================================

-- Gate evaluation history
CREATE TABLE IF NOT EXISTS public.rollout_gate_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    from_mode TEXT NOT NULL,
    to_mode TEXT NOT NULL,
    gate_id TEXT NOT NULL, -- e.g., 'gate_RM1_to_RM2'
    passed BOOLEAN NOT NULL,
    blockers JSONB DEFAULT '[]'::jsonb, -- Array of blocker strings
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    evaluated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_gate_evals_venue ON public.rollout_gate_evaluations(venue_id, evaluated_at DESC);

-- =============================================================================
-- 7. RLS POLICIES
-- =============================================================================

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flag_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rollout_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kill_switches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rollout_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_cohort_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rollout_gate_evaluations ENABLE ROW LEVEL SECURITY;

-- Public read for feature flags (apps need to check flags)
CREATE POLICY "public_read_feature_flags" ON public.feature_flags 
    FOR SELECT USING (true);

-- Service role full access for all rollout tables
CREATE POLICY "service_role_feature_flags" ON public.feature_flags 
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_flag_overrides" ON public.feature_flag_overrides 
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_rollout_modes" ON public.rollout_modes 
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_kill_switches" ON public.kill_switches 
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_cohorts" ON public.rollout_cohorts 
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_venue_cohorts" ON public.venue_cohort_assignments 
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_kpi_snapshots" ON public.kpi_snapshots 
    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_gate_evals" ON public.rollout_gate_evaluations 
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Admin read access (for dashboard)
-- Assumes admins have a role set; adjust as needed
CREATE POLICY "admin_read_rollout_modes" ON public.rollout_modes 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "admin_read_kill_switches" ON public.kill_switches 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "admin_read_kpi_snapshots" ON public.kpi_snapshots 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

COMMIT;
