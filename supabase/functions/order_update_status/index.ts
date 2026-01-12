import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const orderUpdateSchema = z.object({
  order_id: z.string().uuid(),
  status: z.enum(["served", "cancelled"]),
});

type OrderUpdateStatusInput = z.infer<typeof orderUpdateSchema>;

const RATE_LIMIT = {
  maxRequests: 60,
  window: "1 hour",
  endpoint: "order_update_status",
};

Deno.serve(async (req) => {
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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

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

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const parsed = orderUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request data", details: parsed.error.issues }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const input: OrderUpdateStatusInput = parsed.data;

    const { data: allowed, error: rateLimitError } = await supabaseAdmin.rpc("check_rate_limit", {
      p_user_id: user.id,
      p_endpoint: RATE_LIMIT.endpoint,
      p_limit: RATE_LIMIT.maxRequests,
      p_window: RATE_LIMIT.window,
    });

    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
      return new Response(
        JSON.stringify({ error: "Rate limit check failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch order to verify vendor membership
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, vendor_id, status")
      .eq("id", input.order_id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is vendor member or admin
    const { data: vendorMember } = await supabaseUser
      .from("vendor_users")
      .select("id")
      .eq("vendor_id", order.vendor_id)
      .eq("auth_user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!vendorMember) {
      // Check if admin
      const { data: adminCheck } = await supabaseAdmin
        .from("admin_users")
        .select("id")
        .eq("auth_user_id", user.id)
        .eq("is_active", true)
        .single();

      if (!adminCheck) {
        return new Response(
          JSON.stringify({ error: "Forbidden - not a vendor member or admin" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate status transition (database trigger will also enforce, but check here for better error)
    if (order.status !== "received") {
      return new Response(
        JSON.stringify({ 
          error: `Invalid status transition. Order is currently '${order.status}', can only transition from 'received'` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ status: input.status })
      .eq("id", input.order_id)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      console.error("Failed to update order status:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update order status", details: updateError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: updatedOrder,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Order status update error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
