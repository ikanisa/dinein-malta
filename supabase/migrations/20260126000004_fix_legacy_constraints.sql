-- Migration: Fix legacy constraints and align profiles
-- Remove 'EUR only' constraints and update profiles schema to match requirements

-- 1. Remove currency constraints (allow RWF)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_currency_eur_chk;
ALTER TABLE public.menu_items DROP CONSTRAINT IF EXISTS menu_items_currency_eur_chk;

-- 2. Update profiles table to match requirements
-- Requirements: display_name, whatsapp, active_country, is_admin, is_disabled
-- Existing: name, role, favorites, notifications_enabled

-- Add missing columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_country VARCHAR(2) REFERENCES public.countries(code);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT false;

-- Migrate existing data (best effort)
UPDATE public.profiles SET display_name = name WHERE display_name IS NULL;

-- 3. Modify constraints/defaults
-- 'role' column is legacy, we use is_admin or venue ownership now.
-- 'favorites' is legacy jsonb, assuming we might move to favorites table later, but keep for now.

-- 4. Harden Admin RLS on profiles (Prevent user from setting is_admin)
-- The existing policy "profiles_update_own" allows users to update ALL columns.
-- We MUST restrict this.

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  -- User cannot change is_admin
  AND (is_admin = (SELECT is_admin FROM public.profiles WHERE id = auth.uid()))
  -- User cannot change is_disabled
  AND (is_disabled = (SELECT is_disabled FROM public.profiles WHERE id = auth.uid()))
);

-- Admin can see/edit all profiles
DROP POLICY IF EXISTS "profiles_read_admin" ON public.profiles;
CREATE POLICY "profiles_read_admin"
ON public.profiles FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin"
ON public.profiles FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

