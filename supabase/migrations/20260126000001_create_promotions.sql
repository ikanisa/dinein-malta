-- Migration: Create promotions table
-- Marketing promotions for venues

CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  active_from TIMESTAMPTZ,
  active_to TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_promotions_updated_at ON public.promotions;
CREATE TRIGGER trg_promotions_updated_at
BEFORE UPDATE ON public.promotions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promotions_venue_active ON public.promotions(venue_id) WHERE is_active = true;

-- RLS
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- 1. Select: Public can read active promotions
DROP POLICY IF EXISTS "promotions_read_public" ON public.promotions;
CREATE POLICY "promotions_read_public"
ON public.promotions FOR SELECT
USING (is_active = true);

-- 2. All: Venue Owner/Manager or Admin
DROP POLICY IF EXISTS "promotions_manage_owner_admin" ON public.promotions;
CREATE POLICY "promotions_manage_owner_admin"
ON public.promotions FOR ALL
USING (
  public.is_admin() 
  OR public.can_manage_vendor_ops(venue_id)
  OR (EXISTs (SELECT 1 FROM public.vendors v WHERE v.id = venue_id AND v.owner_id = auth.uid()))
)
WITH CHECK (
  public.is_admin() 
  OR public.can_manage_vendor_ops(venue_id)
  OR (EXISTs (SELECT 1 FROM public.vendors v WHERE v.id = venue_id AND v.owner_id = auth.uid()))
);

COMMENT ON TABLE public.promotions IS 'Marketing promotions for venues';
