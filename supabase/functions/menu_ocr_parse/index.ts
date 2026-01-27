import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
    handleCors,
    jsonResponse,
    errorResponse,
    createAdminClient,
    requireAuth,
    checkRateLimit,
    createLogger,
    getOrCreateRequestId,
    RateLimitConfig,
    callGemini,
    GEMINI_MODELS,
    parseJSON,
} from "../_lib/mod.ts";

// --- Input Validation Schema ---
const ocrSchema = z.object({
    image_base64: z.string().min(100), // Base64 encoded image
    mime_type: z.enum(["image/jpeg", "image/png", "image/webp"]),
    venue_id: z.string().uuid().optional(), // Optional context
});

type OcrInput = z.infer<typeof ocrSchema>;

const RATE_LIMIT: RateLimitConfig = {
    maxRequests: 10,
    window: "1 hour",
    endpoint: "menu_ocr_parse",
};

const MENU_OCR_PROMPT = `You are a menu extraction AI. Analyze this menu image and extract all menu items.

For each item found, extract:
- name: The dish/drink name (required)
- description: Brief description if visible (optional)
- price: Numeric price value (required, extract the number only)
- category: Category like "Starters", "Mains", "Desserts", "Drinks", etc. (optional, infer from context)

Return ONLY a valid JSON array of objects. Example:
[
  {"name": "Caesar Salad", "description": "Fresh romaine with parmesan", "price": 12.50, "category": "Starters"},
  {"name": "Grilled Salmon", "description": "Atlantic salmon with herbs", "price": 24.00, "category": "Mains"}
]

If no menu items can be extracted, return an empty array: []

Important:
- Extract ALL visible menu items
- Convert prices to numbers (e.g., "€12.50" becomes 12.50)
- If currency symbol is present, note that this is EUR for Malta or RWF for Rwanda
- Be thorough but accurate`;

Deno.serve(async (req) => {
    const startTime = Date.now();
    const requestId = getOrCreateRequestId(req);
    const logger = createLogger({ requestId, action: "menu_ocr_parse" });

    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    if (req.method !== "POST") {
        return errorResponse("Method not allowed", 405);
    }

    try {
        logger.requestStart(req.method, "/menu_ocr_parse");

        const supabaseAdmin = createAdminClient();

        // Authenticate user (required for OCR to prevent abuse)
        const authResult = await requireAuth(req, logger);
        if (authResult instanceof Response) return authResult;
        const { user } = authResult;

        // Parse + validate input
        const body = await req.json();
        const parsed = ocrSchema.safeParse(body);
        if (!parsed.success) {
            logger.warn("Validation failed", { errors: parsed.error.issues });
            return errorResponse("Invalid request data", 400, parsed.error.issues);
        }

        const input: OcrInput = parsed.data;
        logger.info("Processing menu OCR", { mimeType: input.mime_type, vendorId: input.venue_id });

        // Rate limiting
        const rateLimitResult = await checkRateLimit(supabaseAdmin, user.id, RATE_LIMIT, logger);
        if (rateLimitResult instanceof Response) return rateLimitResult;

        // ========================================================================
        // Call Gemini Vision API
        // ========================================================================
        logger.info("Calling Gemini Vision API");

        const geminiResult = await callGemini(GEMINI_MODELS.vision, MENU_OCR_PROMPT, {
            imageData: input.image_base64,
            mimeType: input.mime_type,
            temperature: 0.3, // Lower temperature for more consistent extraction
            maxTokens: 4096,
            responseMimeType: "application/json",
        });

        if (!geminiResult.text) {
            logger.error("Gemini returned no text response", { raw: geminiResult.raw });
            return errorResponse("Failed to parse menu image", 500, "No text response from AI");
        }

        // ========================================================================
        // Parse the JSON response
        // ========================================================================
        const menuItems = parseJSON(geminiResult.text, []);

        // Validate and clean menu items
        const validatedItems = menuItems
            .filter((item: any) => item.name && typeof item.price === "number")
            .map((item: any) => ({
                name: String(item.name).trim(),
                description: item.description ? String(item.description).trim() : null,
                price: Number(item.price),
                category: item.category ? String(item.category).trim() : null,
            }));

        logger.info("Extracted menu items", { count: validatedItems.length });

        // ========================================================================
        // Return parsed items (does NOT save to database)
        // ========================================================================
        const durationMs = Date.now() - startTime;
        logger.requestEnd(200, durationMs);

        return jsonResponse({
            success: true,
            requestId,
            count: validatedItems.length,
            items: validatedItems,
            raw_response: geminiResult.text.substring(0, 500), // First 500 chars for debugging
        });
    } catch (error) {
        const durationMs = Date.now() - startTime;
        logger.error("Menu OCR error", { error: String(error), durationMs });
        return errorResponse("Internal server error", 500, String(error));
    }
});
