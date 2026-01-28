-- Migration: Channel Sessions and Interactions for Multi-Channel Gateway
-- This supports WhatsApp, Telegram, Slack, and other external messaging channels

-- =============================================================================
-- CHANNEL SESSIONS TABLE
-- Tracks conversation state for external channel users
-- =============================================================================
CREATE TABLE IF NOT EXISTS channel_sessions (
    id TEXT PRIMARY KEY, -- Format: {channel}_{sender_id}
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'telegram', 'slack', 'webhook')),
    sender_id TEXT NOT NULL,
    venue_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    agent_type TEXT NOT NULL DEFAULT 'guest' CHECK (agent_type IN ('guest', 'bar_manager')),
    message_history JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for quick session lookup
CREATE INDEX IF NOT EXISTS idx_channel_sessions_channel_sender 
    ON channel_sessions(channel, sender_id);

-- Index for venue-based queries
CREATE INDEX IF NOT EXISTS idx_channel_sessions_venue 
    ON channel_sessions(venue_id) WHERE venue_id IS NOT NULL;

-- =============================================================================
-- CHANNEL INTERACTIONS TABLE
-- Audit log of all channel conversations
-- =============================================================================
CREATE TABLE IF NOT EXISTS channel_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL REFERENCES channel_sessions(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    venue_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    user_message TEXT NOT NULL,
    assistant_response TEXT NOT NULL,
    tool_calls JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for session history
CREATE INDEX IF NOT EXISTS idx_channel_interactions_session 
    ON channel_interactions(session_id, created_at DESC);

-- Index for venue analytics
CREATE INDEX IF NOT EXISTS idx_channel_interactions_venue 
    ON channel_interactions(venue_id, created_at DESC) WHERE venue_id IS NOT NULL;

-- Index for channel analytics
CREATE INDEX IF NOT EXISTS idx_channel_interactions_channel 
    ON channel_interactions(channel, created_at DESC);

-- =============================================================================
-- RLS POLICIES
-- Service role only - these tables are accessed from edge functions
-- =============================================================================
ALTER TABLE channel_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_interactions ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "service_role_channel_sessions" ON channel_sessions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_role_channel_interactions" ON channel_interactions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Venue owners can view interactions for their venue
CREATE POLICY "venue_owner_view_interactions" ON channel_interactions
    FOR SELECT
    TO authenticated
    USING (
        venue_id IN (
            SELECT id FROM vendors 
            WHERE contact_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- =============================================================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- =============================================================================
CREATE OR REPLACE FUNCTION update_channel_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_channel_sessions_timestamp
    BEFORE UPDATE ON channel_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_channel_session_timestamp();

-- =============================================================================
-- SESSION CLEANUP (optional scheduled job)
-- Clean up sessions older than 7 days
-- =============================================================================
-- To be run via pg_cron or scheduled function:
-- DELETE FROM channel_sessions WHERE updated_at < now() - INTERVAL '7 days';
