-- Migration: Create waiter_rings table for "Ring for Waiter" feature
-- This allows customers to call waiters to their table with realtime notifications

-- Create waiter_rings table
CREATE TABLE IF NOT EXISTS public.waiter_rings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL,
    reason TEXT CHECK (reason IN ('ready_to_order', 'need_help', 'check_please', 'other', NULL)),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ
);

-- Add comment for documentation
COMMENT ON TABLE public.waiter_rings IS 'Stores customer requests to call a waiter to their table';
COMMENT ON COLUMN public.waiter_rings.reason IS 'Optional reason: ready_to_order, need_help, check_please, other';
COMMENT ON COLUMN public.waiter_rings.status IS 'Ring status: pending (new), acknowledged (seen), resolved (handled)';

-- Indexes for fast vendor lookups
CREATE INDEX IF NOT EXISTS idx_waiter_rings_vendor_status 
    ON public.waiter_rings(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_waiter_rings_created_at 
    ON public.waiter_rings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waiter_rings_vendor_pending 
    ON public.waiter_rings(vendor_id) 
    WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.waiter_rings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Anyone can ring a waiter (anonymous customers)
DROP POLICY IF EXISTS "Anyone can ring a waiter" ON public.waiter_rings;
CREATE POLICY "Anyone can ring a waiter"
    ON public.waiter_rings 
    FOR INSERT
    WITH CHECK (true);

-- 2. Vendors can view their own rings (using existing helper function)
DROP POLICY IF EXISTS "Vendors can view their rings" ON public.waiter_rings;
CREATE POLICY "Vendors can view their rings"
    ON public.waiter_rings 
    FOR SELECT
    USING (public.can_manage_vendor_ops(vendor_id));

-- 3. Vendors can update their own rings (acknowledge/resolve)
DROP POLICY IF EXISTS "Vendors can update their rings" ON public.waiter_rings;
CREATE POLICY "Vendors can update their rings"
    ON public.waiter_rings 
    FOR UPDATE
    USING (public.can_manage_vendor_ops(vendor_id));

-- Enable Realtime for this table (vendors subscribe to their rings)
ALTER PUBLICATION supabase_realtime ADD TABLE public.waiter_rings;
