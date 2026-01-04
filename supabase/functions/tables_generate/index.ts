import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface TablesGenerateInput {
  vendor_id: string;
  count?: number; // If provided, generates count tables starting from 1
  table_numbers?: number[]; // If provided, generates tables with these numbers
  start_number?: number; // If count provided, start from this number (default: 1)
}

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

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: TablesGenerateInput = await req.json();

    if (!body.vendor_id) {
      return new Response(
        JSON.stringify({ error: "Missing vendor_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is vendor member (using RLS check via user client)
    const { data: vendorCheck } = await supabaseUser
      .from("vendor_users")
      .select("role")
      .eq("vendor_id", body.vendor_id)
      .eq("auth_user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!vendorCheck) {
      // Also check if admin
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

    // Verify vendor exists
    const { data: vendor } = await supabaseAdmin
      .from("vendors")
      .select("id")
      .eq("id", body.vendor_id)
      .single();

    if (!vendor) {
      return new Response(
        JSON.stringify({ error: "Vendor not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate secure public_code
    const generatePublicCode = (): string => {
      const random = Math.random().toString(36).substring(2, 10).toUpperCase();
      return `TBL-${random}`;
    };

    // Determine table numbers to create
    let tableNumbers: number[] = [];
    if (body.table_numbers && body.table_numbers.length > 0) {
      tableNumbers = body.table_numbers;
    } else if (body.count && body.count > 0) {
      const start = body.start_number || 1;
      tableNumbers = Array.from({ length: body.count }, (_, i) => start + i);
    } else {
      return new Response(
        JSON.stringify({ error: "Must provide either count or table_numbers array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate table numbers are positive
    if (tableNumbers.some((n) => n <= 0)) {
      return new Response(
        JSON.stringify({ error: "Table numbers must be positive integers" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for existing table numbers to avoid conflicts
    const { data: existingTables } = await supabaseAdmin
      .from("tables")
      .select("table_number")
      .eq("vendor_id", body.vendor_id)
      .in("table_number", tableNumbers);

    if (existingTables && existingTables.length > 0) {
      const existingNumbers = existingTables.map((t) => t.table_number);
      return new Response(
        JSON.stringify({ 
          error: "Table numbers already exist", 
          existing: existingNumbers 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate table records
    const tablesToInsert = tableNumbers.map((tableNumber) => {
      let publicCode = generatePublicCode();
      // Ensure uniqueness (simple retry - in production might want more robust)
      const maxAttempts = 5;
      for (let i = 0; i < maxAttempts; i++) {
        publicCode = generatePublicCode();
        // Check if code exists (could optimize with batch check)
        // For now, rely on unique constraint
        break;
      }

      return {
        vendor_id: body.vendor_id,
        table_number: tableNumber,
        label: `Table ${tableNumber}`,
        public_code: publicCode,
        is_active: true,
      };
    });

    // Insert tables
    const { data: createdTables, error: insertError } = await supabaseAdmin
      .from("tables")
      .insert(tablesToInsert)
      .select();

    if (insertError || !createdTables) {
      console.error("Failed to create tables:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create tables", details: insertError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        tables: createdTables,
        count: createdTables.length,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Tables generate error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

