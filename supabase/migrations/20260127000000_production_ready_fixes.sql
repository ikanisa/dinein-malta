-- Migration: Production readiness fixes
-- 1) Allow anonymous orders by dropping NOT NULL on client_auth_user_id
-- 2) Normalize service requests table naming/columns

BEGIN;

-- 1) Allow anonymous orders
ALTER TABLE public.orders
  ALTER COLUMN client_auth_user_id DROP NOT NULL;

-- 2) Normalize service_requests table
DO $$
BEGIN
  IF to_regclass('public.service_requests') IS NULL THEN
    IF to_regclass('public.bell_requests') IS NOT NULL THEN
      ALTER TABLE public.bell_requests RENAME TO service_requests;
    ELSIF to_regclass('public.waiter_rings') IS NOT NULL THEN
      ALTER TABLE public.waiter_rings RENAME TO service_requests;
    END IF;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  table_no TEXT NOT NULL,
  reason TEXT CHECK (reason IN ('ready_to_order', 'need_help', 'check_please', 'other', NULL)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'service_requests'
      AND column_name = 'vendor_id'
  ) THEN
    ALTER TABLE public.service_requests RENAME COLUMN vendor_id TO venue_id;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'service_requests'
      AND column_name = 'table_number'
  ) THEN
    ALTER TABLE public.service_requests RENAME COLUMN table_number TO table_no;
  END IF;
END $$;

ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS reason TEXT CHECK (reason IN ('ready_to_order', 'need_help', 'check_please', 'other', NULL)),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved')),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS acknowledged_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'service_requests'
      AND column_name = 'table_no'
  ) THEN
    ALTER TABLE public.service_requests
      ALTER COLUMN table_no TYPE text USING table_no::text;
  ELSE
    ALTER TABLE public.service_requests
      ADD COLUMN table_no TEXT;
  END IF;

  UPDATE public.service_requests
    SET table_no = 'unknown'
    WHERE table_no IS NULL;

  ALTER TABLE public.service_requests
    ALTER COLUMN table_no SET NOT NULL;
END $$;

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_requests_insert_public" ON public.service_requests;
CREATE POLICY "service_requests_insert_public"
ON public.service_requests FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "service_requests_manage_owner" ON public.service_requests;
CREATE POLICY "service_requests_manage_owner"
ON public.service_requests FOR ALL
USING (public.can_manage_venue_ops(venue_id))
WITH CHECK (public.can_manage_venue_ops(venue_id));

DROP INDEX IF EXISTS idx_waiter_rings_vendor_status;
DROP INDEX IF EXISTS idx_waiter_rings_created_at;
DROP INDEX IF EXISTS idx_waiter_rings_vendor_pending;
CREATE INDEX IF NOT EXISTS idx_service_requests_venue_status_created
  ON public.service_requests(venue_id, status, created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'service_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;
  END IF;
END $$;

COMMIT;
