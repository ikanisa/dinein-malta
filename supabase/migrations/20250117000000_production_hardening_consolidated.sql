-- Production Constraints and Indexes
-- Adds data integrity constraints and performance indexes for go-live

-- ============================================================================
-- DATA INTEGRITY CONSTRAINTS
-- ============================================================================

-- Ensure prices are non-negative
ALTER TABLE public.menu_items 
  ADD CONSTRAINT menu_items_price_nonnegative 
  CHECK (price >= 0);

-- Ensure order totals are non-negative
ALTER TABLE public.orders 
  ADD CONSTRAINT orders_total_nonnegative 
  CHECK (total_amount >= 0);

-- Ensure table numbers are positive
ALTER TABLE public.tables 
  ADD CONSTRAINT tables_number_positive 
  CHECK (table_number > 0);

-- Ensure party size is positive
ALTER TABLE public.reservations 
  ADD CONSTRAINT reservations_party_size_positive 
  CHECK (party_size > 0);

-- Ensure order codes are unique per vendor (prevents collisions)
ALTER TABLE public.orders 
  ADD CONSTRAINT orders_vendor_code_unique 
  UNIQUE (vendor_id, order_code);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Fast vendor dashboard queries: orders by status and creation date
-- Used for: Vendor dashboard order lists, filtering by status
CREATE INDEX IF NOT EXISTS idx_orders_vendor_status_created 
  ON public.orders(vendor_id, status, created_at DESC);

-- Fast available menu items lookup
-- Used for: Client menu display, filtering available items
CREATE INDEX IF NOT EXISTS idx_menu_items_vendor_available 
  ON public.menu_items(vendor_id, is_available) 
  WHERE is_available = true;

-- Fast table lookup by public_code (QR scanning)
-- Used for: Client QR code scanning to identify table
CREATE INDEX IF NOT EXISTS idx_tables_public_code 
  ON public.tables(public_code) 
  WHERE is_active = true;

-- Additional index for order items lookup (if not exists)
-- Used for: Order detail views
CREATE INDEX IF NOT EXISTS idx_order_items_order_id_created 
  ON public.order_items(order_id, created_at);

-- Index for reservations by vendor and datetime
-- Used for: Vendor reservation calendar views
CREATE INDEX IF NOT EXISTS idx_reservations_vendor_datetime_status 
  ON public.reservations(vendor_id, datetime, status);

-- Harden RLS Policies for Production Security
-- Removes dangerous client direct writes to orders/order_items
-- Clients must use Edge Functions for order creation (server-side validation)

-- ============================================================================
-- REMOVE DANGEROUS CLIENT INSERT POLICIES
-- ============================================================================

-- Remove client direct insert on orders
-- Orders must be created via Edge Function (order_create) only
DROP POLICY IF EXISTS "orders_insert_client" ON public.orders;

-- Remove client direct insert on order_items
-- Order items must be created via Edge Function only
DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;

-- ============================================================================
-- ADD PUBLIC TABLE READ POLICY FOR QR SCANNING
-- ============================================================================

-- Allow clients to read table info by public_code for QR scanning
-- This is safe because we only expose public_code, not sensitive vendor data
DROP POLICY IF EXISTS "tables_select_public_by_code" ON public.tables;
CREATE POLICY "tables_select_public_by_code"
ON public.tables FOR SELECT
USING (
  -- Allow vendor/admin to see all their tables
  public.can_manage_vendor_ops(vendor_id)
  OR
  -- Allow public to see active tables (for QR scanning)
  -- This enables clients to verify table belongs to vendor when placing order
  (is_active = true AND EXISTS (
    SELECT 1 FROM public.vendors v 
    WHERE v.id = vendor_id AND v.status = 'active'
  ))
);

-- ============================================================================
-- ENSURE ORDER STATUS TRANSITIONS ARE SAFE
-- ============================================================================

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
  -- received -> served
  -- received -> cancelled
  -- No other transitions allowed (prevents skipping steps)
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

-- ============================================================================
-- NOTE: Payment Status Updates
-- ============================================================================
-- Payment status can be updated from 'unpaid' to 'paid' by vendors
-- This is handled by RLS policy "orders_update_vendor" which allows
-- vendor members to update orders. The Edge Function order_mark_paid
-- will provide additional validation and logging.

