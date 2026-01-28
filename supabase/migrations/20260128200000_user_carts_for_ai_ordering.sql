-- User Carts for AI-Assisted Ordering (Moltbot Phase 1)
-- Ephemeral carts cleared after order placement

-- =============================================================================
-- USER CARTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Owner (anonymous or authenticated)
    user_id UUID, -- Nullable for anonymous users
    
    -- Venue context (cart is per-venue)
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    
    -- Cart items (JSONB array)
    -- Format: [{ item_id, name, quantity, unit_price, notes, add_ons }]
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Totals (cached for performance)
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'EUR',
    
    -- Table context (optional)
    table_no TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one cart per user per venue
    CONSTRAINT unique_user_venue_cart UNIQUE (user_id, venue_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_user_carts_user_id ON public.user_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_carts_venue_id ON public.user_carts(venue_id);
CREATE INDEX IF NOT EXISTS idx_user_carts_updated ON public.user_carts(updated_at DESC);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Updated at trigger
DROP TRIGGER IF EXISTS trg_user_carts_updated_at ON public.user_carts;
CREATE TRIGGER trg_user_carts_updated_at
BEFORE UPDATE ON public.user_carts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.user_carts ENABLE ROW LEVEL SECURITY;

-- Users can view their own carts
DROP POLICY IF EXISTS "user_carts_select_own" ON public.user_carts;
CREATE POLICY "user_carts_select_own"
ON public.user_carts FOR SELECT
USING (
    user_id = auth.uid() 
    OR user_id IS NULL  -- Anonymous carts during session
);

-- Users can insert carts for themselves
DROP POLICY IF EXISTS "user_carts_insert" ON public.user_carts;
CREATE POLICY "user_carts_insert"
ON public.user_carts FOR INSERT
WITH CHECK (
    user_id = auth.uid() 
    OR user_id IS NULL
);

-- Users can update their own carts
DROP POLICY IF EXISTS "user_carts_update" ON public.user_carts;
CREATE POLICY "user_carts_update"
ON public.user_carts FOR UPDATE
USING (user_id = auth.uid() OR user_id IS NULL)
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Users can delete their own carts
DROP POLICY IF EXISTS "user_carts_delete" ON public.user_carts;
CREATE POLICY "user_carts_delete"
ON public.user_carts FOR DELETE
USING (user_id = auth.uid() OR user_id IS NULL);

-- Service role can manage all carts (for edge functions)
DROP POLICY IF EXISTS "user_carts_service_all" ON public.user_carts;
CREATE POLICY "user_carts_service_all"
ON public.user_carts FOR ALL
USING (auth.role() = 'service_role');

-- =============================================================================
-- CLEANUP FUNCTION
-- =============================================================================

-- Function to clean up stale carts (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_stale_carts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.user_carts
    WHERE updated_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.user_carts IS 'Ephemeral shopping carts for AI-assisted ordering';
COMMENT ON COLUMN public.user_carts.items IS 'JSONB array of cart items with item_id, name, quantity, unit_price, notes, add_ons';
COMMENT ON FUNCTION public.cleanup_stale_carts IS 'Removes carts not updated in 24 hours - call via cron';
