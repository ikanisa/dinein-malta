-- Production Constraints and Indexes
-- Adds data integrity constraints and performance indexes for go-live

-- ============================================================================
-- DATA INTEGRITY CONSTRAINTS
-- ============================================================================

-- Ensure prices are non-negative
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'menu_items_price_nonnegative'
  ) THEN
    ALTER TABLE public.menu_items 
      ADD CONSTRAINT menu_items_price_nonnegative 
      CHECK (price >= 0);
  END IF;
END $$;

-- Ensure order totals are non-negative
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_total_nonnegative'
  ) THEN
    ALTER TABLE public.orders 
      ADD CONSTRAINT orders_total_nonnegative 
      CHECK (total_amount >= 0);
  END IF;
END $$;

-- Ensure table numbers are positive
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tables_number_positive'
  ) THEN
    ALTER TABLE public.tables 
      ADD CONSTRAINT tables_number_positive 
      CHECK (table_number > 0);
  END IF;
END $$;

-- Ensure party size is positive
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reservations_party_size_positive'
  ) THEN
    ALTER TABLE public.reservations 
      ADD CONSTRAINT reservations_party_size_positive 
      CHECK (party_size > 0);
  END IF;
END $$;

-- Ensure order codes are unique per vendor (prevents collisions)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_vendor_code_unique'
  ) THEN
    ALTER TABLE public.orders 
      ADD CONSTRAINT orders_vendor_code_unique 
      UNIQUE (vendor_id, order_code);
  END IF;
END $$;

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

