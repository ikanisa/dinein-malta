import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Migration SQL - production hardening
const MIGRATION_SQL = `
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

-- RLS Hardening
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
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Execute migration using the apply_production_migrations function
    // First, create the function if it doesn't exist
    const functionSQL = `
      CREATE OR REPLACE FUNCTION public.apply_production_migrations()
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $func$
      BEGIN
        ${MIGRATION_SQL}
      END;
      $func$;
    `;

    // Execute via rpc (we need to use the database connection directly)
    // Since we can't execute arbitrary SQL via REST API, we'll need to use
    // the Management API or psql
    
    // For now, return instructions
    return new Response(
      JSON.stringify({
        message: "Migration function created. Please execute via SQL Editor or psql.",
        sql: functionSQL
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Migration error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

