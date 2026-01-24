-- Migration: Bar Onboarding Schema
-- Creates tables and RLS policies for self-service bar onboarding

-- ============================================================================
-- TABLE: onboarding_requests
-- Tracks pending bar onboarding submissions awaiting admin approval
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.onboarding_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL, -- auth.uid() of submitter
    email TEXT NOT NULL,
    whatsapp TEXT,
    revolut_link TEXT,
    momo_code TEXT,
    menu_items_json JSONB, -- Proposed menu additions/changes
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by UUID, -- Admin who reviewed
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_onboarding_requests_status 
    ON public.onboarding_requests(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_requests_vendor 
    ON public.onboarding_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_requests_submitted_by 
    ON public.onboarding_requests(submitted_by);

-- Updated_at trigger
DROP TRIGGER IF EXISTS trg_onboarding_requests_updated_at ON public.onboarding_requests;
CREATE TRIGGER trg_onboarding_requests_updated_at
BEFORE UPDATE ON public.onboarding_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.onboarding_requests ENABLE ROW LEVEL SECURITY;

-- Submitter can read their own requests
DROP POLICY IF EXISTS "onboarding_requests_select_own" ON public.onboarding_requests;
CREATE POLICY "onboarding_requests_select_own"
ON public.onboarding_requests FOR SELECT
USING (submitted_by = auth.uid() OR public.is_admin());

-- Only allow insert from authenticated users
DROP POLICY IF EXISTS "onboarding_requests_insert_auth" ON public.onboarding_requests;
CREATE POLICY "onboarding_requests_insert_auth"
ON public.onboarding_requests FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND submitted_by = auth.uid());

-- Only admin can update (approve/reject)
DROP POLICY IF EXISTS "onboarding_requests_update_admin" ON public.onboarding_requests;
CREATE POLICY "onboarding_requests_update_admin"
ON public.onboarding_requests FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Only admin can delete
DROP POLICY IF EXISTS "onboarding_requests_delete_admin" ON public.onboarding_requests;
CREATE POLICY "onboarding_requests_delete_admin"
ON public.onboarding_requests FOR DELETE
USING (public.is_admin());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.onboarding_requests IS 
    'Self-service bar onboarding requests pending admin approval';
COMMENT ON COLUMN public.onboarding_requests.vendor_id IS 
    'Reference to the bar being claimed';
COMMENT ON COLUMN public.onboarding_requests.submitted_by IS 
    'Auth user ID who submitted this onboarding request';
COMMENT ON COLUMN public.onboarding_requests.menu_items_json IS 
    'JSON array of proposed menu items to add';
COMMENT ON COLUMN public.onboarding_requests.status IS 
    'pending = awaiting review, approved = live, rejected = declined';
