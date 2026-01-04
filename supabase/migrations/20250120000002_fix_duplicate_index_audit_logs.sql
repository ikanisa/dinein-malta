-- Fix duplicate index in audit_logs table
-- Drops idx_audit_logs_created (duplicate of idx_audit_logs_created_at)
-- Both indexes are on the same column (created_at), so we only need one

DROP INDEX IF EXISTS public.idx_audit_logs_created;

-- Keep idx_audit_logs_created_at as it's more descriptive and consistent
-- with naming convention (idx_<table>_<column>_at)
-- Note: COMMENT ON INDEX doesn't support IF EXISTS, so we use DO block
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname = 'idx_audit_logs_created_at'
  ) THEN
    COMMENT ON INDEX public.idx_audit_logs_created_at IS 'Index on audit_logs.created_at for efficient time-based queries. Replaces duplicate idx_audit_logs_created.';
  END IF;
END $$;

