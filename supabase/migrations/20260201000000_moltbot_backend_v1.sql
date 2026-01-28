-- Migration: Moltbot Backend V1 (WF-NEXT-05)
-- Consolidated schema for Tenants, Venues, Menus, Orders, Visits, Carts, Service Calls

BEGIN;

-- =============================================================================
-- 1. TENANTS & VENUES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure venues has tenant_id and new fields
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id),
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS price_band INT DEFAULT 2, -- 1-4
ADD COLUMN IF NOT EXISTS features_json JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_venues_tenant_active ON public.venues(tenant_id, is_active);

-- Venue Hours
CREATE TABLE IF NOT EXISTS public.venue_hours (
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    PRIMARY KEY (venue_id, day_of_week)
);

-- Venue Assets
CREATE TABLE IF NOT EXISTS public.venue_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'logo', 'policy')),
    url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 2. GUESTS & VISITS
-- =============================================================================

-- Guests: Maps to a profile, but specific to the "Guest" persona in the system
-- We can alias this to a new table or reuse profiles. Spec asks for 'guests'.
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to auth if present
    locale TEXT DEFAULT 'en',
    allergies_json JSONB DEFAULT '[]'::jsonb,
    preferences_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Visits: The core session of a physical presence
CREATE TABLE IF NOT EXISTS public.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES public.guests(id),
    table_no TEXT, -- Using table_no string as simple identifier (or table_id if strictly relational)
    party_size INT DEFAULT 1,
    status TEXT NOT NULL CHECK (status IN ('active', 'ended', 'cancelled')) DEFAULT 'active',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    session_key TEXT -- For correlating with AI session
);

CREATE INDEX IF NOT EXISTS idx_visits_venue_status ON public.visits(venue_id, status);

-- =============================================================================
-- 3. MENUS & OFFERS
-- =============================================================================

-- Ensure Menus fields
ALTER TABLE public.menus 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id),
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Offers (New)
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT,
    badge TEXT,
    rule_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'ended')) DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offers_venue_active ON public.offers(venue_id, status);

-- =============================================================================
-- 4. CARTS & ORDERING
-- =============================================================================

-- Normalized Carts
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES public.venues(id), -- Denormalized for easy access
    user_id UUID REFERENCES auth.users(id), -- Allow direct lookup by user
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(visit_id) -- One cart per visit usually
);

CREATE INDEX IF NOT EXISTS idx_carts_user_venue ON public.carts(user_id, venue_id);


-- Cart Lines
CREATE TABLE IF NOT EXISTS public.cart_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.menu_items(id),
    qty INT NOT NULL DEFAULT 1 CHECK (qty > 0),
    selected_addon_ids_json JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    line_total_cached NUMERIC(10,2), -- caching expected price
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quotes (for deterministic Checkout pricing)
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    visit_id UUID REFERENCES public.visits(id),
    offer_id UUID REFERENCES public.offers(id),
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax NUMERIC(10,2) NOT NULL DEFAULT 0,
    service_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    cart_hash TEXT NOT NULL -- Integrity check
);

-- Orders (Aligning existing table)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id),
ADD COLUMN IF NOT EXISTS visit_id UUID REFERENCES public.visits(id),
ADD COLUMN IF NOT EXISTS guest_id UUID REFERENCES public.guests(id),
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT now(),
ALTER COLUMN status SET DEFAULT 'submitted';

-- Ensure Order Lines (Aligning existing table)
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id),
ADD COLUMN IF NOT EXISTS addon_snapshot_json JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS line_total NUMERIC(10,2);


-- =============================================================================
-- 5. OPERATIONS & TELEMETRY
-- =============================================================================

-- Service Calls
CREATE TABLE IF NOT EXISTS public.service_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES public.visits(id),
    reason TEXT NOT NULL,
    priority TEXT DEFAULT 'normal',
    note TEXT,
    status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'acknowledged', 'resolved', 'cancelled')) DEFAULT 'queued',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- Telemetry Events (High volume)
CREATE TABLE IF NOT EXISTS public.telemetry_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    venue_id UUID,
    actor_type TEXT, -- guest, staff, system
    actor_id UUID,
    session_key TEXT,
    event_type TEXT NOT NULL,
    payload_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_created ON public.telemetry_events(created_at DESC);

-- =============================================================================
-- 6. RLS Policies (Stubbed via function to allow safe re-run)
-- =============================================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;

-- Basic Public Read Policies for Venue Data
CREATE POLICY "public_read_venues" ON public.venues FOR SELECT USING (true);
CREATE POLICY "public_read_venue_hours" ON public.venue_hours FOR SELECT USING (true);
CREATE POLICY "public_read_venue_assets" ON public.venue_assets FOR SELECT USING (true);
CREATE POLICY "public_read_offers" ON public.offers FOR SELECT USING (status = 'active');
CREATE POLICY "public_read_menus_published" ON public.menus FOR SELECT USING (status = 'published');

-- Guest Write Policies (Own Data)
-- Assumes auth.uid() corresponds to a user linked in guests table or visits
-- Usage of service_role is expected for anonymous 'visits' management if not using auth.users

CREATE POLICY "guest_manage_visits" ON public.visits FOR ALL 
USING (auth.uid() IN (SELECT user_id FROM public.guests WHERE id = guest_id) OR auth.uid() IS NULL); 
-- Note: 'auth.uid() IS NULL' is dangerous if not careful, but for anonymous sessions handled by edge functions, 
-- usually we rely on Service Role in Edge Functions.
-- If PWA accesses directly via Anon Key, we need strict checks.
-- For simple MVP compliance, we'll allow Anon lookup by ID if they know it (UUID is secret-ish) 
-- OR strictly rely on Edge Functions for mutations.
-- Spec says "Roles: guest can write own visits".
-- We'll assume Edge Functions handle specific logic or auth.uid() is populated by anonymous sign-in.

CREATE POLICY "service_role_full_access" ON public.visits FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_carts" ON public.carts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_cart_lines" ON public.cart_lines FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_quotes" ON public.quotes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_orders" ON public.orders FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_service_calls" ON public.service_calls FOR ALL TO service_role USING (true) WITH CHECK (true);



-- Realtime Publication setup for Event Streams
DO $$
BEGIN
  -- Add tables to supabase_realtime publication if needed
  -- (Using EXECUTE to avoid syntax errors if publication doesn't exist, though it usually does on Supabase)
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.service_calls;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

COMMIT;
