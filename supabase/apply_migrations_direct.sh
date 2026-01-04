#!/bin/bash
# Script to apply migrations using Supabase Management API
# This uses the REST API to execute SQL via rpc function

SUPABASE_URL="https://elhlcdiosomutugpneoc.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsaGxjZGlvc29tdXR1Z3BuZW9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkwNTc1MywiZXhwIjoyMDc0NDgxNzUzfQ.INeWgLyQetYUZGQYiVx7GCB7fREKypaOfy-XEMhYi6A"
SQL_FILE="./APPLY_MIGRATIONS.sql"

echo "Reading SQL file: $SQL_FILE"
SQL_CONTENT=$(cat "$SQL_FILE")

# Escape SQL for JSON
SQL_ESCAPED=$(echo "$SQL_CONTENT" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')

echo "Executing SQL via Supabase REST API..."

# Use the Supabase REST API to execute SQL
# Note: Supabase REST API doesn't directly support arbitrary SQL execution
# We'll need to use psql or create a helper function in the database

# Actually, let's use the Supabase Management API's execute SQL endpoint if available
# Or we can use the REST API's query endpoint with a custom function

echo "⚠️  Supabase REST API doesn't support arbitrary SQL execution."
echo "Using alternative approach: Creating a temporary migration function..."

# Create a migration function that executes our SQL
MIGRATION_FUNCTION=$(cat <<'EOF'
CREATE OR REPLACE FUNCTION public.apply_production_migrations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Production Constraints and Indexes
  ALTER TABLE public.menu_items 
    ADD CONSTRAINT IF NOT EXISTS menu_items_price_nonnegative 
    CHECK (price >= 0);

  ALTER TABLE public.orders 
    ADD CONSTRAINT IF NOT EXISTS orders_total_nonnegative 
    CHECK (total_amount >= 0);

  ALTER TABLE public.tables 
    ADD CONSTRAINT IF NOT EXISTS tables_number_positive 
    CHECK (table_number > 0);

  ALTER TABLE public.reservations 
    ADD CONSTRAINT IF NOT EXISTS reservations_party_size_positive 
    CHECK (party_size > 0);

  -- Unique constraint (handle separately due to IF NOT EXISTS limitation)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_vendor_code_unique'
  ) THEN
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_vendor_code_unique 
    UNIQUE (vendor_id, order_code);
  END IF;

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_orders_vendor_status_created 
    ON public.orders(vendor_id, status, created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_menu_items_vendor_available 
    ON public.menu_items(vendor_id, is_available) 
    WHERE is_available = true;

  CREATE INDEX IF NOT EXISTS idx_tables_public_code 
    ON public.tables(public_code) 
    WHERE is_active = true;

  CREATE INDEX IF NOT EXISTS idx_order_items_order_id_created 
    ON public.order_items(order_id, created_at);

  CREATE INDEX IF NOT EXISTS idx_reservations_vendor_datetime_status 
    ON public.reservations(vendor_id, datetime, status);

  -- RLS Policies
  DROP POLICY IF EXISTS "orders_insert_client" ON public.orders;
  DROP POLICY IF EXISTS "order_items_insert" ON public.order_items;

  DROP POLICY IF EXISTS "tables_select_public_by_code" ON public.tables;
  CREATE POLICY "tables_select_public_by_code"
  ON public.tables FOR SELECT
  USING (
    public.can_manage_vendor_ops(vendor_id)
    OR
    (is_active = true AND EXISTS (
      SELECT 1 FROM public.vendors v 
      WHERE v.id = vendor_id AND v.status = 'active'
    ))
  );

  -- Status transition validation
  CREATE OR REPLACE FUNCTION public.validate_order_status_transition(
    old_status public.order_status,
    new_status public.order_status
  )
  RETURNS boolean
  LANGUAGE plpgsql
  IMMUTABLE
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

  CREATE OR REPLACE FUNCTION public.enforce_order_status_transition()
  RETURNS trigger
  LANGUAGE plpgsql
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

  DROP TRIGGER IF EXISTS trg_orders_status_transition ON public.orders;
  CREATE TRIGGER trg_orders_status_transition
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_order_status_transition();
END;
$$;
EOF
)

# Execute via REST API using rpc
echo "Creating migration function..."
RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"${MIGRATION_FUNCTION_ESCAPED}\"}")

echo "Attempting direct execution method..."

# Alternative: Use psql with connection string
# For now, let's output instructions
echo ""
echo "=========================================="
echo "To apply migrations, use one of these:"
echo "=========================================="
echo ""
echo "Option 1: Use Supabase Dashboard (Recommended)"
echo "  1. Go to: https://supabase.com/dashboard/project/elhlcdiosomutugpneoc/sql"
echo "  2. Copy contents of APPLY_MIGRATIONS.sql"
echo "  3. Paste and run"
echo ""
echo "Option 2: Use psql with connection string"
echo "  Get connection string from Dashboard > Settings > Database"
echo "  Then: psql \"<connection-string>\" -f APPLY_MIGRATIONS.sql"
echo ""

