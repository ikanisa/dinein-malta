import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const tablesGenerateSchema = z.object({
  vendor_id: z.string().uuid(),
  count: z.number().int().positive().optional(),
  table_numbers: z.array(z.number().int().positive()).optional(),
  start_number: z.number().int().positive().optional(),
}).refine((data) => {
  return (data.count && data.count > 0) || (data.table_numbers && data.table_numbers.length > 0);
}, { message: "Must provide either count or table_numbers array" });

type TablesGenerateInput = z.infer<typeof tablesGenerateSchema>;

const RATE_LIMIT = {
  maxRequests: 20,
  window: "1 hour",
  endpoint: "tables_generate",
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

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const parsed = tablesGenerateSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request data", details: parsed.error.issues }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const input: TablesGenerateInput = parsed.data;

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

    // Verify user is vendor member (using RLS check via user client)
    const { data: vendorCheck } = await supabaseUser
      .from("vendor_users")
      .select("role")
      .eq("vendor_id", input.vendor_id)
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
      .eq("id", input.vendor_id)
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
    if (input.table_numbers && input.table_numbers.length > 0) {
      tableNumbers = input.table_numbers;
    } else if (input.count && input.count > 0) {
      const start = input.start_number || 1;
      tableNumbers = Array.from({ length: input.count }, (_, i) => start + i);
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
      .eq("vendor_id", input.vendor_id)
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
        vendor_id: input.vendor_id,
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
