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

// --- Input Validation Schema ---
const searchSchema = z.object({
    query: z.string().min(1).max(100),
    country: z.string().length(2).optional(), // ISO country code
    limit: z.number().int().min(1).max(50).optional().default(20),
});

type SearchInput = z.infer<typeof searchSchema>;

const RATE_LIMIT: RateLimitConfig = {
    maxRequests: 30,
    window: "1 minute",
    endpoint: "bar_search",
};

Deno.serve(async (req) => {
    const startTime = Date.now();
    const requestId = getOrCreateRequestId(req);
    const logger = createLogger({ requestId, action: "bar_search" });

    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    if (req.method !== "POST") {
        return errorResponse("Method not allowed", 405);
    }

    try {
        logger.requestStart(req.method, "/bar_search");

        const supabaseAdmin = createAdminClient();

        // Parse + validate input
        const body = await req.json();
        const parsed = searchSchema.safeParse(body);
        if (!parsed.success) {
            logger.warn("Validation failed", { errors: parsed.error.issues });
            return errorResponse("Invalid request data", 400, parsed.error.issues);
        }

        const input: SearchInput = parsed.data;
        logger.info("Searching bars", { query: input.query, country: input.country });

        // Rate limiting based on IP (anonymous allowed)
        const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const rateLimitResult = await checkRateLimit(
            supabaseAdmin,
            `ip:${clientIp}`,
            RATE_LIMIT,
            logger
        );
        if (rateLimitResult instanceof Response) return rateLimitResult;

        // ========================================================================
        // Search vendors table
        // ========================================================================
        let query = supabaseAdmin
            .from("vendors")
            .select("id, name, address, country, slug, status, lat, lng, photos_json")
            .or(`name.ilike.%${input.query}%,address.ilike.%${input.query}%`)
            .order("name", { ascending: true })
            .limit(input.limit || 20);

        // Filter by country if provided
        if (input.country) {
            query = query.eq("country", input.country.toUpperCase());
        }

        const { data: vendors, error: queryError } = await query;

        if (queryError) {
            logger.error("Database query failed", { error: queryError.message });
            return errorResponse("Search failed", 500, queryError.message);
        }

        // ========================================================================
        // Return results
        // ========================================================================
        const durationMs = Date.now() - startTime;
        logger.requestEnd(200, durationMs);

        return jsonResponse({
            success: true,
            requestId,
            count: vendors?.length || 0,
            bars: (vendors || []).map((v) => ({
                id: v.id,
                name: v.name,
                address: v.address,
                country: v.country,
                slug: v.slug,
                status: v.status,
                lat: v.lat,
                lng: v.lng,
                photo: v.photos_json?.[0] || null, // First photo if available
            })),
        });
    } catch (error) {
        const durationMs = Date.now() - startTime;
        logger.error("Bar search error", { error: String(error), durationMs });
        return errorResponse("Internal server error", 500, String(error));
    }
});
