-- Migration: Audit Correlation IDs and Tenant Context
-- Adds correlation tracking and tenant isolation to agent_actions

-- =============================================================================
-- ADD CORRELATION ID + TENANT COLUMNS TO agent_actions
-- =============================================================================

-- Correlation ID for tracing requests across tool calls
ALTER TABLE public.agent_actions 
ADD COLUMN IF NOT EXISTS correlation_id TEXT;

-- Tenant context for multi-tenant isolation
ALTER TABLE public.agent_actions 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'dinein';

-- Venue ID for venue-scoped operations
ALTER TABLE public.agent_actions 
ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES public.venues(id);

-- User ID for user attribution
ALTER TABLE public.agent_actions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Agent type for analytics
ALTER TABLE public.agent_actions 
ADD COLUMN IF NOT EXISTS agent_type TEXT;

-- =============================================================================
-- INDEXES FOR EFFICIENT QUERYING
-- =============================================================================

-- Correlation ID index for tracing
CREATE INDEX IF NOT EXISTS idx_agent_actions_correlation 
ON public.agent_actions(correlation_id);

-- Tenant ID index for multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_agent_actions_tenant 
ON public.agent_actions(tenant_id);

-- Venue ID index for venue-scoped queries
CREATE INDEX IF NOT EXISTS idx_agent_actions_venue 
ON public.agent_actions(venue_id);

-- User ID index for user-specific queries
CREATE INDEX IF NOT EXISTS idx_agent_actions_user 
ON public.agent_actions(user_id);

-- Agent type index for analytics
CREATE INDEX IF NOT EXISTS idx_agent_actions_agent_type 
ON public.agent_actions(agent_type);

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_agent_actions_venue_type_created 
ON public.agent_actions(venue_id, action_type, created_at DESC);

-- =============================================================================
-- UPDATE agent_sessions WITH TENANT CONTEXT
-- =============================================================================

-- Add tenant_id to agent_sessions
ALTER TABLE public.agent_sessions 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'dinein';

-- Add correlation_id to agent_sessions (links to first action)
ALTER TABLE public.agent_sessions 
ADD COLUMN IF NOT EXISTS correlation_id TEXT;

CREATE INDEX IF NOT EXISTS idx_agent_sessions_tenant 
ON public.agent_sessions(tenant_id);

CREATE INDEX IF NOT EXISTS idx_agent_sessions_correlation 
ON public.agent_sessions(correlation_id);

-- =============================================================================
-- AUDIT LOG VIEW FOR ADMIN DASHBOARD
-- =============================================================================

CREATE OR REPLACE VIEW public.agent_audit_log AS
SELECT 
    aa.id,
    aa.correlation_id,
    aa.tenant_id,
    aa.venue_id,
    v.name AS venue_name,
    aa.user_id,
    aa.agent_type,
    aa.action_type,
    aa.action_data,
    aa.success,
    aa.error_message,
    aa.input_tokens,
    aa.output_tokens,
    aa.cost_estimate,
    aa.created_at
FROM public.agent_actions aa
LEFT JOIN public.venues v ON aa.venue_id = v.id
ORDER BY aa.created_at DESC;

-- Grant access to the view
GRANT SELECT ON public.agent_audit_log TO authenticated;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON COLUMN public.agent_actions.correlation_id IS 'Unique ID for tracing a request across multiple tool calls';
COMMENT ON COLUMN public.agent_actions.tenant_id IS 'Platform tenant ID for multi-tenant isolation';
COMMENT ON COLUMN public.agent_actions.venue_id IS 'Venue scope for operations';
COMMENT ON COLUMN public.agent_actions.agent_type IS 'Type of agent that performed this action';
COMMENT ON VIEW public.agent_audit_log IS 'Admin view of agent actions with venue names';
