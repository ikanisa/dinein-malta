-- Migration: Create venue_claims table
-- Tracks user requests to claim ownership of venues

CREATE TYPE public.claim_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS public.venue_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.claim_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id), -- Admin who reviewed it
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Prevent multiple pending claims for same venue by same user
  CONSTRAINT one_pending_claim_per_user UNIQUE (venue_id, user_id)
  -- ideally filtered index where status='pending' but unique constraint is safer for now
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_venue_claims_updated_at ON public.venue_claims;
CREATE TRIGGER trg_venue_claims_updated_at
BEFORE UPDATE ON public.venue_claims
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_venue_claims_venue ON public.venue_claims(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_claims_user ON public.venue_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_claims_status ON public.venue_claims(status);

-- RLS
ALTER TABLE public.venue_claims ENABLE ROW LEVEL SECURITY;

-- 1. Insert: Authenticated users can create a claim
DROP POLICY IF EXISTS "venue_claims_insert_auth" ON public.venue_claims;
CREATE POLICY "venue_claims_insert_auth"
ON public.venue_claims FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. Select: Admin or Own claim
DROP POLICY IF EXISTS "venue_claims_select_own_or_admin" ON public.venue_claims;
CREATE POLICY "venue_claims_select_own_or_admin"
ON public.venue_claims FOR SELECT
USING (
  public.is_admin() 
  OR auth.uid() = user_id
);

-- 3. Update: Admin only (approve/reject)
DROP POLICY IF EXISTS "venue_claims_update_admin" ON public.venue_claims;
CREATE POLICY "venue_claims_update_admin"
ON public.venue_claims FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. Delete: Admin or Own pending claim (cancel)
DROP POLICY IF EXISTS "venue_claims_delete_own_pending" ON public.venue_claims;
CREATE POLICY "venue_claims_delete_own_pending"
ON public.venue_claims FOR DELETE
USING (
  public.is_admin() 
  OR (auth.uid() = user_id AND status = 'pending')
);

COMMENT ON TABLE public.venue_claims IS 'User claims for venue ownership';
