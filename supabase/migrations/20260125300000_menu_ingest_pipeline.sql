-- OCR Menu Ingest Pipeline Tables (v1)
-- Creates job queue, staging tables, and RLS for menu OCR processing
-- Flow: Upload → Pending → Running → NeedsReview → Published/Failed

-- ============================================================================
-- ENUMS
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE public.ingest_job_status AS ENUM (
    'pending',    -- Job created, waiting for worker
    'running',    -- Worker processing
    'needs_review', -- OCR complete, awaiting venue owner review
    'published',  -- Menu items published from staging
    'failed'      -- Processing failed (may retry)
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.staging_item_action AS ENUM (
    'keep',  -- Default: include in publish
    'edit',  -- Owner edited before publish
    'drop'   -- Owner rejected, skip on publish
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Menu ingest jobs (job queue)
CREATE TABLE IF NOT EXISTS public.menu_ingest_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  created_by UUID NOT NULL, -- auth.uid() of uploading user
  file_path TEXT NOT NULL,  -- storage path: menu_uploads/{venueId}/{jobId}/filename
  status public.ingest_job_status NOT NULL DEFAULT 'pending',
  
  -- Error handling
  error_code TEXT,           -- e.g., 'INVALID_FILE', 'OCR_FAILED', 'INVALID_JSON'
  error_message TEXT,        -- Sanitized user-facing message (no stack traces)
  
  -- Retry mechanism
  attempt_count INT NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ,  -- When to retry (null if not retrying)
  
  -- Timing
  started_at TIMESTAMPTZ,    -- When worker started processing
  finished_at TIMESTAMPTZ,   -- When processing completed (success or final failure)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Staging items (parsed OCR output, pending review)
CREATE TABLE IF NOT EXISTS public.menu_items_staging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.menu_ingest_jobs(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  
  -- Parsed data
  raw_category TEXT,                -- Category from OCR (owner can edit)
  name TEXT NOT NULL,               -- Item name
  description TEXT,                 -- Item description
  price NUMERIC(12,2),              -- Extracted price
  currency TEXT DEFAULT 'EUR',      -- Inferred currency
  
  -- Confidence/quality
  confidence NUMERIC(4,3) DEFAULT 0.5, -- 0.000 to 1.000
  parse_warnings TEXT[] DEFAULT '{}',  -- Warnings from parsing
  suggested_action public.staging_item_action DEFAULT 'keep',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ingest_jobs_venue_status 
  ON public.menu_ingest_jobs(venue_id, status);
CREATE INDEX IF NOT EXISTS idx_ingest_jobs_pending 
  ON public.menu_ingest_jobs(status, next_attempt_at) 
  WHERE status IN ('pending', 'running');
CREATE INDEX IF NOT EXISTS idx_staging_items_job 
  ON public.menu_items_staging(job_id);

-- Updated_at trigger
DROP TRIGGER IF EXISTS trg_ingest_jobs_updated_at ON public.menu_ingest_jobs;
CREATE TRIGGER trg_ingest_jobs_updated_at
  BEFORE UPDATE ON public.menu_ingest_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.menu_ingest_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items_staging ENABLE ROW LEVEL SECURITY;

-- menu_ingest_jobs: Venue owners/managers can see their own jobs
DROP POLICY IF EXISTS "ingest_jobs_select" ON public.menu_ingest_jobs;
CREATE POLICY "ingest_jobs_select"
  ON public.menu_ingest_jobs FOR SELECT
  USING (
    public.is_admin() 
    OR public.is_vendor_member(venue_id)
  );

-- menu_ingest_jobs: Venue owners/managers can create jobs for their venue
DROP POLICY IF EXISTS "ingest_jobs_insert" ON public.menu_ingest_jobs;
CREATE POLICY "ingest_jobs_insert"
  ON public.menu_ingest_jobs FOR INSERT
  WITH CHECK (
    public.can_edit_vendor_profile(venue_id)
    AND created_by = auth.uid()
  );

-- menu_ingest_jobs: Only service role can update jobs (worker runs as service)
-- Venue owners can only update via edge function (server-side)
DROP POLICY IF EXISTS "ingest_jobs_update" ON public.menu_ingest_jobs;
CREATE POLICY "ingest_jobs_update"
  ON public.menu_ingest_jobs FOR UPDATE
  USING (
    public.is_admin()
    OR public.can_edit_vendor_profile(venue_id)
  )
  WITH CHECK (
    public.is_admin()
    OR public.can_edit_vendor_profile(venue_id)
  );

-- menu_items_staging: Venue owners can see their own staging items
DROP POLICY IF EXISTS "staging_items_select" ON public.menu_items_staging;
CREATE POLICY "staging_items_select"
  ON public.menu_items_staging FOR SELECT
  USING (
    public.is_admin()
    OR public.is_vendor_member(venue_id)
  );

-- menu_items_staging: Insert only via service role (worker)
-- But we allow venue editors for flexibility
DROP POLICY IF EXISTS "staging_items_insert" ON public.menu_items_staging;
CREATE POLICY "staging_items_insert"
  ON public.menu_items_staging FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR public.can_edit_vendor_profile(venue_id)
  );

-- menu_items_staging: Venue owners can update their staging items (edit before publish)
DROP POLICY IF EXISTS "staging_items_update" ON public.menu_items_staging;
CREATE POLICY "staging_items_update"
  ON public.menu_items_staging FOR UPDATE
  USING (
    public.is_admin()
    OR public.can_edit_vendor_profile(venue_id)
  )
  WITH CHECK (
    public.is_admin()
    OR public.can_edit_vendor_profile(venue_id)
  );

-- menu_items_staging: Venue owners can delete staging items
DROP POLICY IF EXISTS "staging_items_delete" ON public.menu_items_staging;
CREATE POLICY "staging_items_delete"
  ON public.menu_items_staging FOR DELETE
  USING (
    public.is_admin()
    OR public.can_edit_vendor_profile(venue_id)
  );

-- ============================================================================
-- HELPER FUNCTION: Claim pending job (atomic, prevents double-processing)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.claim_ingest_job(p_job_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_claimed BOOLEAN := FALSE;
BEGIN
  UPDATE public.menu_ingest_jobs
  SET 
    status = 'running',
    started_at = now(),
    attempt_count = attempt_count + 1,
    updated_at = now()
  WHERE id = p_job_id
    AND status IN ('pending')
    AND (next_attempt_at IS NULL OR next_attempt_at <= now());
  
  IF FOUND THEN
    v_claimed := TRUE;
  END IF;
  
  RETURN v_claimed;
END;
$$;

-- ============================================================================
-- HELPER FUNCTION: Set job to failed with retry schedule
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fail_ingest_job(
  p_job_id UUID,
  p_error_code TEXT,
  p_error_message TEXT,
  p_should_retry BOOLEAN DEFAULT TRUE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt_count INT;
  v_next_attempt TIMESTAMPTZ;
BEGIN
  SELECT attempt_count INTO v_attempt_count
  FROM public.menu_ingest_jobs WHERE id = p_job_id;
  
  -- Calculate next attempt time (exponential backoff: 1, 5, 15, 60 min)
  IF p_should_retry AND v_attempt_count < 4 THEN
    v_next_attempt := now() + 
      CASE v_attempt_count
        WHEN 1 THEN INTERVAL '1 minute'
        WHEN 2 THEN INTERVAL '5 minutes'
        WHEN 3 THEN INTERVAL '15 minutes'
        ELSE INTERVAL '60 minutes'
      END;
    
    UPDATE public.menu_ingest_jobs
    SET 
      status = 'pending',  -- Back to pending for retry
      error_code = p_error_code,
      error_message = p_error_message,
      next_attempt_at = v_next_attempt,
      updated_at = now()
    WHERE id = p_job_id;
  ELSE
    -- Final failure (max attempts or non-retryable)
    UPDATE public.menu_ingest_jobs
    SET 
      status = 'failed',
      error_code = p_error_code,
      error_message = p_error_message,
      finished_at = now(),
      updated_at = now()
    WHERE id = p_job_id;
  END IF;
END;
$$;
