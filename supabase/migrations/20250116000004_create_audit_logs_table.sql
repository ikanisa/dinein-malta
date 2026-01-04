-- Migration: Create audit_logs table for admin audit trail
-- This table stores all administrative actions for audit and compliance

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_auth_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_auth_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admin users can read audit logs
DROP POLICY IF EXISTS "audit_logs_admin_select" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_select"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

-- Service role can insert (from Edge Functions) - RLS is bypassed by service role anyway
-- This policy exists for clarity but service role bypasses RLS
DROP POLICY IF EXISTS "audit_logs_service_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_service_insert"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.audit_logs TO authenticated;
-- Service role has full access (bypasses RLS)

COMMENT ON TABLE public.audit_logs IS 'Audit trail of all administrative and system actions for compliance and debugging';
COMMENT ON COLUMN public.audit_logs.actor_auth_user_id IS 'The authenticated user who performed the action';
COMMENT ON COLUMN public.audit_logs.action IS 'Action type (e.g., VENUE_CLAIM, VENDOR_SUSPEND, ORDER_CREATE)';
COMMENT ON COLUMN public.audit_logs.entity_type IS 'Type of entity affected (e.g., venue, order, vendor)';
COMMENT ON COLUMN public.audit_logs.entity_id IS 'ID of the affected entity';
COMMENT ON COLUMN public.audit_logs.metadata_json IS 'Additional context about the action';

