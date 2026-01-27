import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
    handleCors,
    jsonResponse,
    errorResponse,
    createAdminClient,
    checkRateLimit,
    createLogger,
    getOrCreateRequestId,
    createAuditLogger,
    AuditAction,
    EntityType,
    RateLimitConfig,
} from "../_lib/mod.ts";

// --- Input Validation Schema ---
const onboardingSchema = z.object({
    venue_id: z.string().uuid(),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    whatsapp: z.string().optional().nullable(),
    revolut_link: z.string().url().optional().nullable(),
    momo_code: z.string().optional().nullable(),
    menu_items: z.array(z.object({
        name: z.string().min(1),
        description: z.string().optional().nullable(),
        price: z.number().positive(),
        category: z.string().optional().nullable(),
    })).optional().nullable(),
});

type OnboardingInput = z.infer<typeof onboardingSchema>;

const RATE_LIMIT: RateLimitConfig = {
    maxRequests: 5,
    window: "1 hour",
    endpoint: "bar_onboarding_submit",
};

Deno.serve(async (req) => {
    const startTime = Date.now();
    const requestId = getOrCreateRequestId(req);
    const logger = createLogger({ requestId, action: "bar_onboarding_submit" });

    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    if (req.method !== "POST") {
        return errorResponse("Method not allowed", 405);
    }

    try {
        logger.requestStart(req.method, "/bar_onboarding_submit");

        const supabaseAdmin = createAdminClient();

        // Parse + validate input
        const body = await req.json();
        const parsed = onboardingSchema.safeParse(body);
        if (!parsed.success) {
            logger.warn("Validation failed", { errors: parsed.error.issues });
            return errorResponse("Invalid request data", 400, parsed.error.issues);
        }

        const input: OnboardingInput = parsed.data;
        logger.info("Processing onboarding submission", { vendorId: input.venue_id, email: input.email });

        // Rate limiting based on IP
        const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const rateLimitResult = await checkRateLimit(
            supabaseAdmin,
            `ip:${clientIp}`,
            RATE_LIMIT,
            logger
        );
        if (rateLimitResult instanceof Response) return rateLimitResult;

        // ========================================================================
        // STEP 1: Verify vendor exists
        // ========================================================================
        const { data: vendor, error: vendorError } = await supabaseAdmin
            .from("venues")
            .select("id, name, country, status")
            .eq("id", input.venue_id)
            .single();

        if (vendorError || !vendor) {
            logger.warn("Vendor not found", { vendorId: input.venue_id });
            return errorResponse("Bar not found", 404);
        }

        // ========================================================================
        // STEP 2: Check for existing pending request
        // ========================================================================
        const { data: existingRequest } = await supabaseAdmin
            .from("onboarding_requests")
            .select("id, status")
            .eq("venue_id", input.venue_id)
            .eq("status", "pending")
            .maybeSingle();

        if (existingRequest) {
            logger.warn("Pending request already exists", { vendorId: input.venue_id });
            return errorResponse("A pending onboarding request already exists for this bar", 409);
        }

        // ========================================================================
        // STEP 3: Check if vendor already has an active owner
        // ========================================================================
        const { data: existingOwner } = await supabaseAdmin
            .from("venue_users")
            .select("id")
            .eq("venue_id", input.venue_id)
            .eq("role", "owner")
            .eq("is_active", true)
            .maybeSingle();

        if (existingOwner) {
            logger.warn("Vendor already has active owner", { vendorId: input.venue_id });
            return errorResponse("This bar already has an owner", 409);
        }

        // ========================================================================
        // STEP 4: Create Supabase auth user
        // ========================================================================
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: input.email,
            password: input.password,
            email_confirm: true, // Auto-confirm for onboarding
            user_metadata: {
                venue_id: input.venue_id,
                vendor_name: vendor.name,
                role: "vendor",
            },
        });

        if (authError || !authData.user) {
            logger.error("Failed to create auth user", { error: authError?.message });
            if (authError?.message?.includes("already registered")) {
                return errorResponse("Email already in use", 409);
            }
            return errorResponse("Failed to create account", 500, authError?.message);
        }

        const userId = authData.user.id;
        logger.info("Created auth user", { userId, email: input.email });

        // ========================================================================
        // STEP 5: Create venue_users record (inactive until approved)
        // ========================================================================
        const { error: vendorUserError } = await supabaseAdmin
            .from("venue_users")
            .insert({
                venue_id: input.venue_id,
                auth_user_id: userId,
                role: "owner",
                is_active: false, // Pending approval
            });

        if (vendorUserError) {
            logger.error("Failed to create vendor user", { error: vendorUserError.message });
            // Cleanup: delete the auth user
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return errorResponse("Failed to link account to bar", 500, vendorUserError.message);
        }

        // ========================================================================
        // STEP 6: Create onboarding request
        // ========================================================================
        const { data: request, error: requestError } = await supabaseAdmin
            .from("onboarding_requests")
            .insert({
                venue_id: input.venue_id,
                submitted_by: userId,
                email: input.email,
                whatsapp: input.whatsapp || null,
                revolut_link: input.revolut_link || null,
                momo_code: input.momo_code || null,
                menu_items_json: input.menu_items || null,
                status: "pending",
            })
            .select()
            .single();

        if (requestError || !request) {
            logger.error("Failed to create onboarding request", { error: requestError?.message });
            // Cleanup
            await supabaseAdmin.from("venue_users").delete().eq("auth_user_id", userId);
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return errorResponse("Failed to submit onboarding request", 500, requestError?.message);
        }

        // ========================================================================
        // STEP 7: Write audit log
        // ========================================================================
        const audit = createAuditLogger(supabaseAdmin, userId, requestId, logger);
        await audit.log(AuditAction.CREATE, EntityType.VENDOR, input.venue_id, {
            action: "onboarding_submit",
            requestId: request.id,
            email: input.email,
            vendorName: vendor.name,
        });

        // ========================================================================
        // STEP 8: Return success
        // ========================================================================
        const durationMs = Date.now() - startTime;
        logger.requestEnd(201, durationMs);

        return jsonResponse({
            success: true,
            requestId,
            message: "Onboarding request submitted successfully. Awaiting admin approval.",
            onboardingRequest: {
                id: request.id,
                venue_id: request.venue_id,
                status: request.status,
                created_at: request.created_at,
            },
        }, 201);
    } catch (error) {
        const durationMs = Date.now() - startTime;
        logger.error("Onboarding submission error", { error: String(error), durationMs });
        return errorResponse("Internal server error", 500, String(error));
    }
});
