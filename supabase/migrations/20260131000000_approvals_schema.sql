-- Migration: Approval Workflows Schema
-- Creates tables for menu/promo drafts and approval requests

-- =============================================================================
-- MENU ITEM DRAFTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.menu_item_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.menu_categories(id),
    
    -- Item details
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    
    -- Draft metadata
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'published')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Approval tracking
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Link to published item (if published)
    published_item_id UUID REFERENCES public.menu_items(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_menu_drafts_venue ON public.menu_item_drafts(venue_id);
CREATE INDEX IF NOT EXISTS idx_menu_drafts_status ON public.menu_item_drafts(status);
CREATE INDEX IF NOT EXISTS idx_menu_drafts_created_by ON public.menu_item_drafts(created_by);

-- RLS
ALTER TABLE public.menu_item_drafts ENABLE ROW LEVEL SECURITY;

-- Venue owners can manage their drafts
CREATE POLICY "menu_drafts_owner_all" ON public.menu_item_drafts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.venues v
            WHERE v.id = menu_item_drafts.venue_id
            AND v.owner_id = auth.uid()
        )
    );

-- Admins can view/approve all drafts
CREATE POLICY "menu_drafts_admin_all" ON public.menu_item_drafts
    FOR ALL USING (public.is_admin());

-- =============================================================================
-- PROMO DRAFTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.promo_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    
    -- Promo details
    title TEXT NOT NULL,
    description TEXT,
    discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100),
    discount_amount DECIMAL(10,2) CHECK (discount_amount >= 0),
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    
    -- Draft metadata
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'published', 'paused')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Approval tracking
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Link to published promo (if published)
    published_promo_id UUID REFERENCES public.promotions(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promo_drafts_venue ON public.promo_drafts(venue_id);
CREATE INDEX IF NOT EXISTS idx_promo_drafts_status ON public.promo_drafts(status);
CREATE INDEX IF NOT EXISTS idx_promo_drafts_created_by ON public.promo_drafts(created_by);

-- RLS
ALTER TABLE public.promo_drafts ENABLE ROW LEVEL SECURITY;

-- Venue owners can manage their drafts
CREATE POLICY "promo_drafts_owner_all" ON public.promo_drafts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.venues v
            WHERE v.id = promo_drafts.venue_id
            AND v.owner_id = auth.uid()
        )
    );

-- Admins can view/approve all drafts
CREATE POLICY "promo_drafts_admin_all" ON public.promo_drafts
    FOR ALL USING (public.is_admin());

-- =============================================================================
-- APPROVAL REQUESTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Request type and entity
    request_type TEXT NOT NULL CHECK (request_type IN (
        'menu_publish', 'promo_publish', 'promo_pause',
        'venue_claim', 'access_grant', 'access_revoke',
        'refund'
    )),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Venue context (for venue-scoped requests)
    venue_id UUID REFERENCES public.venues(id),
    
    -- Request metadata
    requested_by UUID REFERENCES auth.users(id),
    notes TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'expired')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    
    -- Resolution
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON public.approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_type ON public.approval_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_approval_requests_venue ON public.approval_requests(venue_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by ON public.approval_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_approval_requests_pending ON public.approval_requests(status) WHERE status = 'pending';

-- RLS
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "approval_requests_own_select" ON public.approval_requests
    FOR SELECT USING (requested_by = auth.uid());

-- Users can cancel their own pending requests
CREATE POLICY "approval_requests_own_cancel" ON public.approval_requests
    FOR UPDATE USING (
        requested_by = auth.uid() 
        AND status = 'pending'
    )
    WITH CHECK (status = 'cancelled');

-- Admins can view and resolve all requests
CREATE POLICY "approval_requests_admin_all" ON public.approval_requests
    FOR ALL USING (public.is_admin());

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to check if is_admin function exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
        CREATE OR REPLACE FUNCTION public.is_admin()
        RETURNS BOOLEAN AS $func$
        BEGIN
            RETURN EXISTS (
                SELECT 1 FROM auth.users u
                WHERE u.id = auth.uid()
                AND u.raw_user_meta_data->>'role' = 'admin'
            );
        END;
        $func$ LANGUAGE plpgsql SECURITY DEFINER;
    END IF;
END $$;

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS menu_drafts_updated_at ON public.menu_item_drafts;
CREATE TRIGGER menu_drafts_updated_at
    BEFORE UPDATE ON public.menu_item_drafts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS promo_drafts_updated_at ON public.promo_drafts;
CREATE TRIGGER promo_drafts_updated_at
    BEFORE UPDATE ON public.promo_drafts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS approval_requests_updated_at ON public.approval_requests;
CREATE TRIGGER approval_requests_updated_at
    BEFORE UPDATE ON public.approval_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================================
-- ADMIN DASHBOARD VIEW
-- =============================================================================

CREATE OR REPLACE VIEW public.pending_approvals AS
SELECT 
    ar.id,
    ar.request_type,
    ar.entity_type,
    ar.entity_id,
    ar.venue_id,
    v.name AS venue_name,
    ar.requested_by,
    u.email AS requester_email,
    ar.notes,
    ar.priority,
    ar.status,
    ar.created_at,
    ar.expires_at,
    CASE 
        WHEN ar.request_type = 'menu_publish' THEN (
            SELECT jsonb_build_object('name', md.name, 'price', md.price)
            FROM public.menu_item_drafts md WHERE md.id = ar.entity_id
        )
        WHEN ar.request_type IN ('promo_publish', 'promo_pause') THEN (
            SELECT jsonb_build_object('title', pd.title, 'discount_percent', pd.discount_percent)
            FROM public.promo_drafts pd WHERE pd.id = ar.entity_id
        )
        ELSE NULL
    END AS entity_preview
FROM public.approval_requests ar
LEFT JOIN public.venues v ON ar.venue_id = v.id
LEFT JOIN auth.users u ON ar.requested_by = u.id
WHERE ar.status = 'pending'
ORDER BY 
    CASE ar.priority 
        WHEN 'urgent' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'normal' THEN 3 
        ELSE 4 
    END,
    ar.created_at;

GRANT SELECT ON public.pending_approvals TO authenticated;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.menu_item_drafts IS 'Draft menu items pending approval before publishing';
COMMENT ON TABLE public.promo_drafts IS 'Draft promotions pending approval before publishing';
COMMENT ON TABLE public.approval_requests IS 'Centralized approval workflow for menu, promos, claims, and access';
COMMENT ON VIEW public.pending_approvals IS 'Admin dashboard view of pending approval requests with entity previews';
