import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface OrderItemInput {
  menu_item_id: string;
  qty: number;
  modifiers_json?: any;
}

interface CreateOrderInput {
  vendor_id: string;
  table_public_code: string;
  items: OrderItemInput[];
  notes?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Initialize service role client (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Initialize user client for auth verification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: CreateOrderInput = await req.json();

    // Validate input
    if (!body.vendor_id || !body.table_public_code || !body.items || body.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: vendor_id, table_public_code, items" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========================================================================
    // STEP 1: Validate vendor exists and is active
    // ========================================================================
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .select("id, status")
      .eq("id", body.vendor_id)
      .single();

    if (vendorError || !vendor) {
      return new Response(
        JSON.stringify({ error: "Vendor not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (vendor.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Vendor is not active" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========================================================================
    // STEP 2: Validate table belongs to vendor and is active
    // ========================================================================
    const { data: table, error: tableError } = await supabaseAdmin
      .from("tables")
      .select("id, vendor_id, table_number, label")
      .eq("public_code", body.table_public_code)
      .eq("vendor_id", body.vendor_id)
      .eq("is_active", true)
      .single();

    if (tableError || !table) {
      return new Response(
        JSON.stringify({ error: "Table not found or inactive" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========================================================================
    // STEP 3: Fetch menu items and validate availability
    // ========================================================================
    const menuItemIds = body.items.map((item) => item.menu_item_id);
    const { data: menuItems, error: menuItemsError } = await supabaseAdmin
      .from("menu_items")
      .select("id, name, price, is_available, vendor_id")
      .in("id", menuItemIds)
      .eq("vendor_id", body.vendor_id);

    if (menuItemsError || !menuItems || menuItems.length === 0) {
      return new Response(
        JSON.stringify({ error: "Menu items not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate all items belong to vendor and are available
    const menuItemsMap = new Map(menuItems.map((item) => [item.id, item]));
    for (const inputItem of body.items) {
      const menuItem = menuItemsMap.get(inputItem.menu_item_id);
      if (!menuItem) {
        return new Response(
          JSON.stringify({ error: `Menu item ${inputItem.menu_item_id} not found` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!menuItem.is_available) {
        return new Response(
          JSON.stringify({ error: `Menu item ${menuItem.name} is not available` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (inputItem.qty <= 0) {
        return new Response(
          JSON.stringify({ error: `Invalid quantity for ${menuItem.name}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ========================================================================
    // STEP 4: Compute total amount server-side
    // ========================================================================
    let totalAmount = 0;
    const orderItemsData = body.items.map((inputItem) => {
      const menuItem = menuItemsMap.get(inputItem.menu_item_id)!;
      const itemTotal = Number(menuItem.price) * inputItem.qty;
      totalAmount += itemTotal;

      return {
        name_snapshot: menuItem.name,
        price_snapshot: menuItem.price,
        qty: inputItem.qty,
        modifiers_json: inputItem.modifiers_json || null,
      };
    });

    // Round to 2 decimal places
    totalAmount = Math.round(totalAmount * 100) / 100;

    // ========================================================================
    // STEP 5: Generate unique order code
    // ========================================================================
    const generateOrderCode = () => {
      const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `DIN-${timestamp}-${random}`;
    };

    let orderCode = generateOrderCode();
    let attempts = 0;
    let codeExists = true;

    // Ensure unique order code (retry if collision)
    while (codeExists && attempts < 10) {
      const { data: existing } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("vendor_id", body.vendor_id)
        .eq("order_code", orderCode)
        .single();

      if (!existing) {
        codeExists = false;
      } else {
        orderCode = generateOrderCode();
        attempts++;
      }
    }

    if (codeExists) {
      return new Response(
        JSON.stringify({ error: "Failed to generate unique order code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========================================================================
    // STEP 6: Insert order and order items in transaction
    // ========================================================================
    // Note: Supabase doesn't support explicit transactions in Edge Functions,
    // but we use a single insert for order, then insert items.
    // If items insert fails, we'd need cleanup logic (or use a stored procedure).

    // Insert order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        vendor_id: body.vendor_id,
        table_id: table.id,
        client_auth_user_id: user.id,
        order_code: orderCode,
        status: "received",
        payment_status: "unpaid",
        total_amount: totalAmount,
        currency: "EUR",
        notes: body.notes || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Failed to create order", details: orderError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert order items
    const orderItemsToInsert = orderItemsData.map((item) => ({
      order_id: order.id,
      ...item,
    }));

    const { data: insertedItems, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsToInsert)
      .select();

    if (itemsError || !insertedItems) {
      // If items insert fails, we should ideally rollback the order
      // For now, log error and return failure
      console.error("Failed to insert order items:", itemsError);
      // Attempt cleanup
      await supabaseAdmin.from("orders").delete().eq("id", order.id);

      return new Response(
        JSON.stringify({ error: "Failed to create order items", details: itemsError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========================================================================
    // STEP 7: Return created order with items
    // ========================================================================
    return new Response(
      JSON.stringify({
        success: true,
        order: {
          ...order,
          items: insertedItems,
        },
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

