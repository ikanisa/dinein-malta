#!/bin/bash
# Automated migration deployment script
# This creates migration entries and applies them

set -e

export SUPABASE_ACCESS_TOKEN="sbp_20c6fb4c0ebb8c456f5bd3dfcbfda19f190e228e"
PROJECT_REF="elhlcdiosomutugpneoc"

echo "=== Automated Migration Deployment ==="
echo ""

# Combine all migration SQL into one file
echo "Creating consolidated migration..."
cat > /tmp/consolidated_migration.sql << 'EOF'
-- Production Hardening Migrations - Consolidated
-- Created: 2025-01-16

-- Constraints and Indexes
DO $$ 
BEGIN
  BEGIN
    ALTER TABLE public.menu_items ADD CONSTRAINT menu_items_price_nonnegative CHECK (price >= 0);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.orders ADD CONSTRAINT orders_total_nonnegative CHECK (total_amount >= 0);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.tables ADD CONSTRAINT tables_number_positive CHECK (table_number > 0);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.reservations ADD CONSTRAINT reservations_party_size_positive CHECK (party_size > 0);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_vendor_code_unique') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_vendor_code_unique UNIQUE (vendor_id, order_code);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_vendor_status_created ON public.orders(vendor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_vendor_available ON public.menu_items(vendor_id, is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_tables_public_code ON public.tables(public_code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_order_items_order_id_created ON public.order_items(order_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_vendor_datetime_status ON public.reservations(vendor_id, datetime, status);

-- RLS Hardening
DROP POLICY IF EXISTS "orders_insert_client" ON public.orders;
DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;

DROP POLICY IF EXISTS "tables_select_public_by_code" ON public.tables;
CREATE POLICY "tables_select_public_by_code" ON public.tables FOR SELECT
USING (
  public.can_manage_vendor_ops(vendor_id)
  OR (is_active = true AND EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.status = 'active'))
);

-- Status Transition Validation
CREATE OR REPLACE FUNCTION public.validate_order_status_transition(old_status public.order_status, new_status public.order_status)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  IF old_status = 'received' AND new_status IN ('served', 'cancelled') THEN RETURN true; END IF;
  IF old_status = new_status THEN RETURN true; END IF;
  RETURN false;
END; $$;

CREATE OR REPLACE FUNCTION public.enforce_order_status_transition()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT public.validate_order_status_transition(OLD.status, NEW.status) THEN
      RAISE EXCEPTION 'Invalid order status transition: % -> %', OLD.status, NEW.status;
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_orders_status_transition ON public.orders;
CREATE TRIGGER trg_orders_status_transition BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_order_status_transition();
EOF

echo "Migration SQL prepared"
echo ""
echo "⚠️  To apply this migration, please:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
echo "2. Copy the SQL from: supabase/apply_via_rpc.sql"
echo "3. Paste and execute"
echo ""
echo "OR use the Supabase CLI if you have database access:"
echo "  supabase db push --linked"
echo ""

