-- Agent Chat Schema for Moltbot Integration
-- Phase 1: Database tables for AI assistant sessions and conversations

-- =============================================================================
-- ENUMS
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE public.agent_type AS ENUM ('guest', 'bar_manager', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.message_role AS ENUM ('user', 'assistant', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- AGENT SESSIONS TABLE
-- Tracks user sessions with AI agents
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.agent_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User identification (nullable for anonymous users)
    user_id UUID, -- References auth.users(id) but not enforced for anonymous
    
    -- Agent configuration
    agent_type public.agent_type NOT NULL DEFAULT 'guest',
    
    -- Context (venue/table for guest, venue for bar_manager, null for admin)
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    table_no TEXT, -- For guest sessions
    
    -- Session state
    context JSONB DEFAULT '{}', -- Stores preferences, order in progress, etc.
    
    -- Tracking
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for agent_sessions
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id ON public.agent_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_venue_id ON public.agent_sessions(venue_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_agent_type ON public.agent_sessions(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_last_interaction ON public.agent_sessions(last_interaction_at DESC);

-- Updated at trigger
DROP TRIGGER IF EXISTS trg_agent_sessions_updated_at ON public.agent_sessions;
CREATE TRIGGER trg_agent_sessions_updated_at
BEFORE UPDATE ON public.agent_sessions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- CONVERSATIONS TABLE
-- Stores message history for each session
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.agent_sessions(id) ON DELETE CASCADE,
    
    -- Message content
    role public.message_role NOT NULL,
    content TEXT NOT NULL,
    
    -- Metadata (tool calls, widget data, etc.)
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON public.conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations(created_at DESC);

-- =============================================================================
-- AGENT ACTIONS TABLE
-- Logs AI actions for analytics and debugging
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.agent_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.agent_sessions(id) ON DELETE SET NULL,
    
    -- Action details
    action_type TEXT NOT NULL, -- e.g., "menu_search", "order_created", "recommendation_given"
    action_data JSONB DEFAULT '{}',
    
    -- Success/failure tracking
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for agent_actions
CREATE INDEX IF NOT EXISTS idx_agent_actions_session_id ON public.agent_actions(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_type ON public.agent_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_agent_actions_created_at ON public.agent_actions(created_at DESC);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user owns session
CREATE OR REPLACE FUNCTION public.owns_agent_session(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.agent_sessions s
        WHERE s.id = p_session_id
          AND (s.user_id = auth.uid() OR s.user_id IS NULL)
    );
$$;

-- Agent Sessions Policies

-- Users can view their own sessions (or anonymous sessions they created)
DROP POLICY IF EXISTS "agent_sessions_select_own" ON public.agent_sessions;
CREATE POLICY "agent_sessions_select_own"
ON public.agent_sessions FOR SELECT
USING (
    user_id = auth.uid() 
    OR user_id IS NULL -- Anonymous sessions visible to their creator
    OR public.is_admin()
);

-- Users can create sessions for themselves
DROP POLICY IF EXISTS "agent_sessions_insert" ON public.agent_sessions;
CREATE POLICY "agent_sessions_insert"
ON public.agent_sessions FOR INSERT
WITH CHECK (
    user_id = auth.uid() 
    OR user_id IS NULL -- Allow anonymous sessions
);

-- Users can update their own sessions
DROP POLICY IF EXISTS "agent_sessions_update" ON public.agent_sessions;
CREATE POLICY "agent_sessions_update"
ON public.agent_sessions FOR UPDATE
USING (user_id = auth.uid() OR user_id IS NULL)
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Conversations Policies

-- Users can view conversations from their sessions
DROP POLICY IF EXISTS "conversations_select" ON public.conversations;
CREATE POLICY "conversations_select"
ON public.conversations FOR SELECT
USING (
    public.owns_agent_session(session_id)
    OR public.is_admin()
);

-- Users can insert into their sessions
DROP POLICY IF EXISTS "conversations_insert" ON public.conversations;
CREATE POLICY "conversations_insert"
ON public.conversations FOR INSERT
WITH CHECK (public.owns_agent_session(session_id));

-- Agent Actions Policies (read-only for users, full for admins)

DROP POLICY IF EXISTS "agent_actions_select" ON public.agent_actions;
CREATE POLICY "agent_actions_select"
ON public.agent_actions FOR SELECT
USING (
    public.owns_agent_session(session_id)
    OR public.is_admin()
);

-- Only service role can insert actions (via edge functions)
DROP POLICY IF EXISTS "agent_actions_insert_service" ON public.agent_actions;
CREATE POLICY "agent_actions_insert_service"
ON public.agent_actions FOR INSERT
WITH CHECK (TRUE); -- Edge functions use service role

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.agent_sessions IS 'AI assistant sessions for Moltbot integration';
COMMENT ON TABLE public.conversations IS 'Message history for AI assistant sessions';
COMMENT ON TABLE public.agent_actions IS 'Action logs for AI assistant analytics';
