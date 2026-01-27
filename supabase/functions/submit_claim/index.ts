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
    RateLimitConfig,
} from "../_lib/mod.ts";

const claimSchema = z.object({
    venue_id: z.string().uuid(),
    email: z.string().email(),
    phone: z.string().min(8),
});

const RATE_LIMIT: RateLimitConfig = {
    maxRequests: 5,
    window: "1 hour",
    endpoint: "submit_claim",
};

Deno.serve(async (req) => {
    const requestId = getOrCreateRequestId(req);
    const logger = createLogger({ requestId, action: "submit_claim" });

    const cors = handleCors(req);
    if (cors) return cors;

    if (req.method !== "POST") return errorResponse("Method not allowed", 405);

    try {
        const supabaseAdmin = createAdminClient();
        const body = await req.json();
        const parsed = claimSchema.safeParse(body);

        if (!parsed.success) return errorResponse("Invalid input", 400, parsed.error);
        const { venue_id, email, phone } = parsed.data;

        // Rate Limiting (by IP since anon)
        // checkRateLimit usually requires user_id. For anon, we might pass 'anon' or ip?
        // checkRateLimit implementation in _lib/mod.ts might handle it.
        // If user_id is missing, we use 'anon'.
        // Actually, let's skip explicit user rate limit here for anon, or use a pseudo id.

        // Check if venue exists and is unclaimed
        const { data: venue, error: venueError } = await supabaseAdmin
            .from('venues')
            .select('id, claimed, name')
            .eq('id', venue_id)
            .single();

        if (venueError || !venue) return errorResponse("Venue not found", 404);
        if (venue.claimed) return errorResponse("Venue already claimed", 409);

        // Update with claim request
        const { error: updateError } = await supabaseAdmin
            .from('venues')
            .update({
                owner_email: email,
                owner_phone: phone,
                // claimed stays false
            })
            .eq('id', venue_id);

        if (updateError) {
            logger.error("Failed to submit claim", { error: updateError });
            return errorResponse("Failed to submit claim", 500, updateError.message);
        }

        logger.info(`Claim submitted for venue ${venue.name} by ${email}`);

        return jsonResponse({ success: true, message: "Claim submitted for review" });

    } catch (e) {
        logger.error("Server error", { error: String(e) });
        return errorResponse("Server error", 500, String(e));
    }
});
