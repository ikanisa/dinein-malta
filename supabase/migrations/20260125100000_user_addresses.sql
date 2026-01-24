-- User addresses for delivery/billing
-- Migration: 20260125100000_user_addresses.sql

CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    label TEXT NOT NULL DEFAULT 'Home',
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'MT',
    postal_code TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON public.user_addresses(user_id, is_default) WHERE is_default = true;

-- Updated_at trigger
DROP TRIGGER IF EXISTS trg_user_addresses_updated_at ON public.user_addresses;
CREATE TRIGGER trg_user_addresses_updated_at
BEFORE UPDATE ON public.user_addresses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- User can only see/manage their own addresses
DROP POLICY IF EXISTS "user_addresses_select_own" ON public.user_addresses;
CREATE POLICY "user_addresses_select_own"
ON public.user_addresses FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_addresses_insert_own" ON public.user_addresses;
CREATE POLICY "user_addresses_insert_own"
ON public.user_addresses FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_addresses_update_own" ON public.user_addresses;
CREATE POLICY "user_addresses_update_own"
ON public.user_addresses FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_addresses_delete_own" ON public.user_addresses;
CREATE POLICY "user_addresses_delete_own"
ON public.user_addresses FOR DELETE
USING (user_id = auth.uid());

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE public.user_addresses
        SET is_default = false
        WHERE user_id = NEW.user_id
          AND id != NEW.id
          AND is_default = true;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_single_default_address ON public.user_addresses;
CREATE TRIGGER trg_ensure_single_default_address
BEFORE INSERT OR UPDATE ON public.user_addresses
FOR EACH ROW EXECUTE FUNCTION public.ensure_single_default_address();
