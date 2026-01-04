import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface VendorClaimInput {
  google_place_id: string;
  slug?: string;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  hours_json?: any;
  photos_json?: any;
  website?: string;
  phone?: string;
  revolut_link?: string;
  whatsapp?: string;
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

    // Parse request body
    const body: VendorClaimInput = await req.json();

    // Validate required fields
    if (!body.google_place_id || !body.name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: google_place_id, name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========================================================================
    // STEP 1: Check if vendor already exists with this google_place_id
    // ========================================================================
    const { data: existingVendor } = await supabaseAdmin
      .from("vendors")
      .select("id, status")
      .eq("google_place_id", body.google_place_id)
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

    let slug = body.slug || generateSlug(body.name);
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
      google_place_id: body.google_place_id,
      slug: slug,
      name: body.name,
      address: body.address || null,
      lat: body.lat || null,
      lng: body.lng || null,
      hours_json: body.hours_json || null,
      photos_json: body.photos_json || null,
      website: body.website || null,
      phone: body.phone || null,
      revolut_link: body.revolut_link || null,
      whatsapp: body.whatsapp || null,
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

