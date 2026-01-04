-- Phase 1: Fix Function Security (search_path mutable)
-- Ensures all functions have SET search_path = public to prevent SQL injection
-- Note: Base schema functions already have this, but we ensure consistency

-- Fix set_updated_at function (if missing search_path)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix validate_order_status_transition (if it exists without search_path)
CREATE OR REPLACE FUNCTION public.validate_order_status_transition(
  old_status public.order_status,
  new_status public.order_status
)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  IF old_status = 'received' AND new_status IN ('served', 'cancelled') THEN
    RETURN true;
  END IF;
  IF old_status = new_status THEN
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

-- Fix enforce_order_status_transition (if it exists without search_path)
CREATE OR REPLACE FUNCTION public.enforce_order_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT public.validate_order_status_transition(OLD.status, NEW.status) THEN
      RAISE EXCEPTION 'Invalid order status transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Note: Helper functions (is_admin, is_vendor_member, etc.) already have
-- SET search_path = public in the base schema, so they're secure.
-- This migration ensures consistency for any functions that might have been
-- created without explicit search_path settings.

