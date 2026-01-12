import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const vendorClaimSchema = z.object({
  google_place_id: z.string().min(1),
  slug: z.string().min(1).optional().nullable(),
  name: z.string().min(1),
  address: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  hours_json: z.unknown().optional().nullable(),
  photos_json: z.unknown().optional().nullable(),
  website: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  revolut_link: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
});

type VendorClaimInput = z.infer<typeof vendorClaimSchema>;

const RATE_LIMIT = {
  maxRequests: 10,
  window: "1 hour",
  endpoint: "vendor_claim",
};

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
    // Initialize service role client
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
        JSON.stringify({ error: "Unauthorized - must be signed in" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin (REQUIRED for vendor creation)
    const { data: adminCheck } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!adminCheck) {
      return new Response(
        JSON.stringify({ error: "Forbidden - admin access required to create vendors" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse + validate request body
    const body = await req.json();
    const parsed = vendorClaimSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request data", details: parsed.error.issues }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const input: VendorClaimInput = parsed.data;

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

    // ========================================================================
    // STEP 1: Check if vendor already exists with this google_place_id
    // ========================================================================
    const { data: existingVendor } = await supabaseAdmin
      .from("vendors")
      .select("id, status")
      .eq("google_place_id", input.google_place_id)
      .single();

    if (existingVendor) {
      // Check if user is already a member
      const { data: existingMember } = await supabaseAdmin
        .from("vendor_users")
        .select("id, role")
        .eq("vendor_id", existingVendor.id)
        .eq("auth_user_id", user.id)
        .single();

      if (existingMember) {
        return new Response(
          JSON.stringify({ 
            error: "Vendor already claimed",
            vendor_id: existingVendor.id,
            message: "You are already a member of this vendor"
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            error: "Vendor already exists",
            vendor_id: existingVendor.id,
            message: "This venue has already been claimed by another user"
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ========================================================================
    // STEP 2: Generate unique slug
    // ========================================================================
    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with hyphens
        .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
    };

    let slug = input.slug || generateSlug(input.name);
    let slugAttempts = 0;
    let slugExists = true;

    // Ensure unique slug (retry if collision)
    while (slugExists && slugAttempts < 10) {
      const { data: existing } = await supabaseAdmin
        .from("vendors")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!existing) {
        slugExists = false;
      } else {
        slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
        slugAttempts++;
      }
    }

    if (slugExists) {
      return new Response(
        JSON.stringify({ error: "Failed to generate unique slug" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========================================================================
    // STEP 3: Create vendor record
    // ========================================================================
    const vendorData = {
      google_place_id: input.google_place_id,
      slug: slug,
      name: input.name,
      address: input.address || null,
      lat: input.lat || null,
      lng: input.lng || null,
      hours_json: input.hours_json || null,
      photos_json: input.photos_json || null,
      website: input.website || null,
      phone: input.phone || null,
      revolut_link: input.revolut_link || null,
      whatsapp: input.whatsapp || null,
      status: "pending", // Requires admin approval
      country: "MT",
    };

    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .insert(vendorData)
      .select()
      .single();

    if (vendorError || !vendor) {
      console.error("Failed to create vendor:", vendorError);
      return new Response(
        JSON.stringify({ error: "Failed to create vendor", details: vendorError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========================================================================
    // STEP 4: Create vendor_users membership with owner role
    // ========================================================================
    const { data: vendorUser, error: vendorUserError } = await supabaseAdmin
      .from("vendor_users")
      .insert({
        vendor_id: vendor.id,
        auth_user_id: user.id,
        role: "owner",
        is_active: true,
      })
      .select()
      .single();

    if (vendorUserError || !vendorUser) {
      // If membership creation fails, cleanup vendor
      console.error("Failed to create vendor membership:", vendorUserError);
      await supabaseAdmin.from("vendors").delete().eq("id", vendor.id);

      return new Response(
        JSON.stringify({ error: "Failed to create vendor membership", details: vendorUserError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========================================================================
    // STEP 5: Return created vendor with membership
    // ========================================================================
    return new Response(
      JSON.stringify({
        success: true,
        vendor: {
          ...vendor,
          membership: vendorUser,
        },
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Vendor claim error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
