-- ============================================================================
-- Production Hardening Migrations
-- Apply this file via Supabase Dashboard > SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. PRODUCTION CONSTRAINTS AND INDEXES
-- ============================================================================

-- Ensure prices are non-negative
ALTER TABLE public.menu_items 
  ADD CONSTRAINT IF NOT EXISTS menu_items_price_nonnegative 
  CHECK (price >= 0);

-- Ensure order totals are non-negative
ALTER TABLE public.orders 
  ADD CONSTRAINT IF NOT EXISTS orders_total_nonnegative 
  CHECK (total_amount >= 0);

-- Ensure table numbers are positive
ALTER TABLE public.tables 
  ADD CONSTRAINT IF NOT EXISTS tables_number_positive 
  CHECK (table_number > 0);

-- Ensure party size is positive
ALTER TABLE public.reservations 
  ADD CONSTRAINT IF NOT EXISTS reservations_party_size_positive 
  CHECK (party_size > 0);

-- Ensure order codes are unique per vendor (prevents collisions)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'orders_vendor_code_unique'
  ) THEN
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_vendor_code_unique 
    UNIQUE (vendor_id, order_code);
  END IF;
END $$;

-- Fast vendor dashboard queries: orders by status and creation date
CREATE INDEX IF NOT EXISTS idx_orders_vendor_status_created 
  ON public.orders(vendor_id, status, created_at DESC);

-- Fast available menu items lookup
CREATE INDEX IF NOT EXISTS idx_menu_items_vendor_available 
  ON public.menu_items(vendor_id, is_available) 
  WHERE is_available = true;

-- Fast table lookup by public_code (QR scanning)
CREATE INDEX IF NOT EXISTS idx_tables_public_code 
  ON public.tables(public_code) 
  WHERE is_active = true;

-- Additional index for order items lookup
CREATE INDEX IF NOT EXISTS idx_order_items_order_id_created 
  ON public.order_items(order_id, created_at);

-- Index for reservations by vendor and datetime
CREATE INDEX IF NOT EXISTS idx_reservations_vendor_datetime_status 
  ON public.reservations(vendor_id, datetime, status);

-- ============================================================================
-- 2. RLS HARDENING
-- ============================================================================

-- Remove client direct insert on orders
DROP POLICY IF EXISTS "orders_insert_client" ON public.orders;

-- Remove client direct insert on order_items
DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;

-- Add public table read policy for QR scanning
DROP POLICY IF EXISTS "tables_select_public_by_code" ON public.tables;
CREATE POLICY "tables_select_public_by_code"
ON public.tables FOR SELECT
USING (
  -- Allow vendor/admin to see all their tables
  public.can_manage_vendor_ops(vendor_id)
  OR
  -- Allow public to see active tables (for QR scanning)
  (is_active = true AND EXISTS (
    SELECT 1 FROM public.vendors v 
    WHERE v.id = vendor_id AND v.status = 'active'
  ))
);

-- Create function to validate order status transitions
CREATE OR REPLACE FUNCTION public.validate_order_status_transition(
  old_status public.order_status,
  new_status public.order_status
)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Only allow valid transitions
  IF old_status = 'received' AND new_status IN ('served', 'cancelled') THEN
    RETURN true;
  END IF;
  
  -- Same status is allowed (for other field updates)
  IF old_status = new_status THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Add trigger to enforce status transitions
CREATE OR REPLACE FUNCTION public.enforce_order_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- If status is being changed, validate transition
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT public.validate_order_status_transition(OLD.status, NEW.status) THEN
      RAISE EXCEPTION 'Invalid order status transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_status_transition ON public.orders;
CREATE TRIGGER trg_orders_status_transition
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_order_status_transition();

