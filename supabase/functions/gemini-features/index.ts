import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
  handleCors,
  jsonResponse,
  errorResponse,
  createAdminClient,
  optionalAuth,
  createLogger,
  getOrCreateRequestId,
  corsHeaders,
  RateLimitConfig,
} from "../_lib/mod.ts";

/**
 * Sanitize text input to prevent XSS and injection attacks
 */
function sanitizeText(text: string, maxLength = 10000): string {
  if (!text) return text;
  // Truncate to max length
  let sanitized = text.slice(0, maxLength);
  // Remove potential script tags and HTML entities that could be malicious
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<[^>]+>/g, '');
  // Normalize whitespace
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  return sanitized.trim();
}

/**
 * Mask sensitive data in error messages to prevent leakage
 */
function maskSensitiveError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  // Mask API keys, tokens, etc.
  return message
    .replace(/key=[^&\s]+/gi, 'key=[MASKED]')
    .replace(/bearer\s+[^\s]+/gi, 'Bearer [MASKED]')
    .replace(/password["':\s]*[^"',\s]+/gi, 'password=[MASKED]')
    .slice(0, 500);
}

const geminiRequestSchema = z.object({
  action: z.enum([
    "search",
    "enrich-profile",
    "generate-image",
    "generate-asset",
    "parse-menu",
    "smart-description",
    "categorize-venue",
    "categorize-menu",
  ]),
  payload: z.record(z.unknown()).optional(),
});

// ... (keep payloadSchemas as is)

// ...



// ...

const payloadSchemas = {
  search: z.object({
    query: z.string().min(1),
  }),
  "enrich-profile": z.object({
    name: z.string().min(1),
    address: z.string().min(1),
  }),
  "generate-image": z.object({
    prompt: z.string().min(1),
    size: z.enum(["1K", "2K", "4K"]).optional(),
    referenceImages: z.array(z.string()).optional(),
    modelPreference: z.enum(["quality", "fast"]).optional(),
  }),
  "parse-menu": z.object({
    fileData: z.string().min(1),
    mimeType: z.string().min(1),
  }),
  "smart-description": z.object({
    name: z.string().min(1),
    category: z.string().min(1),
  }),
  "generate-asset": z.object({
    prompt: z.string().min(1),
    entityId: z.string().uuid(),
    table: z.enum(["vendors", "menu_items"]),
    column: z.string().default("ai_image_url"),
  }),
  "categorize-venue": z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    description: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  "categorize-menu": z.object({
    items: z.array(z.object({
      id: z.string().optional(),
      name: z.string().min(1),
      description: z.string().optional(),
    })).min(1),
    venueName: z.string().optional(),
  }),
} as const;

type GeminiAction = z.infer<typeof geminiRequestSchema>["action"];


// Gemini API Configuration
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODELS = {
  text: "gemini-2.5-flash", // Primary (Stable)
  textFallback: "gemini-2.5-pro", // Fallback
  vision: "gemini-2.5-flash", // Primary for vision
  visionFallback: "gemini-2.5-pro", // Fallback for vision
  imagePro: "nano-banana-pro-preview", // Validated
  imageFast: "imagen-4.0-fast-generate-001",
  // Specific models for tasks
  categorizeVenue: "gemini-2.0-flash-001", // Try 2.0 for tool compatibility
  categorizeMenu: "gemini-2.5-flash",
};

/**
 * Format phone number to international format for WhatsApp
 */
function formatPhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned.startsWith('+') ? cleaned : cleaned;
}

/**
 * Call Gemini API with primary/fallback model support
 */
async function callGemini(
  model: string,
  prompt: string,
  options: {
    tools?: any[];
    toolConfig?: any;
    temperature?: number;
    maxTokens?: number;
    imageData?: string;
    mimeType?: string;
    responseMimeType?: string;
  } = {}
) {
  const apiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  // Determine primary and fallback models
  let primaryModel = model || GEMINI_MODELS.text;
  let fallbackModel: string | null = null;

  if (primaryModel === GEMINI_MODELS.text) {
    fallbackModel = GEMINI_MODELS.textFallback;
  } else if (primaryModel === GEMINI_MODELS.vision) {
    fallbackModel = GEMINI_MODELS.visionFallback;
  }

  const parts: any[] = [];
  if (prompt) parts.push({ text: prompt });
  if (options.imageData && options.mimeType) {
    parts.push({
      inlineData: {
        data: options.imageData,
        mimeType: options.mimeType,
      },
    });
  }

  const requestBody: any = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 2048,
      responseMimeType: options.responseMimeType,
    },
  };

  if (options.tools?.length) requestBody.tools = options.tools;
  if (options.toolConfig) requestBody.toolConfig = options.toolConfig;

  // Retry logic configuration
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1s initial delay with exponential backoff

  async function fetchWithRetry(model: string, isFallback = false): Promise<any> {
    let attempt = 0;
    while (attempt < MAX_RETRIES) {
      try {
        const url = `${GEMINI_API_URL}/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        // If rate limited (429) or server error (5xx), retry
        if (!response.ok && (response.status === 429 || response.status >= 500)) {
          if (attempt < MAX_RETRIES - 1) {
            const delay = RETRY_DELAY * Math.pow(2, attempt);
            console.warn(`Attempt ${attempt + 1} failed for ${model} (${response.status}), retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            attempt++;
            continue;
          }
        }

        // Ensure hard fail on client errors (4xx) except 429, or if retries exhausted
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`${response.status} - ${text.substring(0, 200)}`);
        }

        return await response.json();
      } catch (err) {
        // If it's a network error, retry
        if (attempt < MAX_RETRIES - 1) {
          const delay = RETRY_DELAY * Math.pow(2, attempt);
          console.warn(`Network error on ${model}, retrying in ${delay}ms...`, err);
          await new Promise((resolve) => setTimeout(resolve, delay));
          attempt++;
          continue;
        }
        throw err;
      }
    }
  }

  let data;
  try {
    // Try primary model
    data = await fetchWithRetry(primaryModel);
    console.log("Gemini Raw Response:", JSON.stringify(data).substring(0, 2000)); // Log first 2000 chars
  } catch (error) {
    if (fallbackModel) {
      console.warn(`Primary model ${primaryModel} failed after retries, trying fallback ${fallbackModel}`, error);
      try {
        data = await fetchWithRetry(fallbackModel, true);
      } catch (fallbackError) {
        throw new Error(`Gemini API failed on primary and fallback: ${fallbackError}`);
      }
    } else {
      throw new Error(`Gemini API failed: ${error}`);
    }
  }

  // Extract text content
  if (data.candidates?.[0]?.content?.parts) {
    const textPart = data.candidates[0].content.parts.find((p: any) => p.text);
    if (textPart?.text) {
      return { text: textPart.text, raw: data };
    }
  }

  return { raw: data };
}

/**
 * Parse JSON from text with error handling
 */
function parseJSON(text: string | undefined, fallback: any = []): any {
  if (!text) return fallback;
  const jsonMatch = text.match(/\[[\s\S]*\]|{[\s\S]*}/);
  if (!jsonMatch) return fallback;

  let jsonText = jsonMatch[0].replace(/,(\s*[}\]])/g, '$1');
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("JSON parse error:", e);
    console.warn("Failed JSON text:", text?.substring(0, 1000));
    return fallback;
  }
}

// ============================================================================
// HANDLERS - Only essential functions
// ============================================================================

// 1. SEARCH - Search venues by query (Global/Context-free)
async function handleSearch(payload: { query: string }) {
  const { query } = payload;

  const prompt = `Search for restaurants, bars, cafes, and dining venues matching "${query}".

For each venue, provide:
- name (required)
- address
- rating
- price_level
- opening_hours_text
- website
- phone (REQUIRED - international format with country code)
- quick_tags
- category_tags
- why_recommended
- city
- country

Return as JSON array.`;

  const result = await callGemini(GEMINI_MODELS.text, prompt, {
    tools: [{ googleSearch: {} }],
    temperature: 0.4,
    maxTokens: 4096,
  });

  const venues = parseJSON(result.text, []);

  // Format phone numbers
  const processed = venues.map((venue: any) => {
    if (venue.phone) {
      venue.phone = formatPhoneNumber(venue.phone);
      venue.whatsapp = venue.phone;
    }
    return venue;
  });

  return processed;
}

// 2. ENRICH PROFILE - Enrich venue with Google Search data
async function handleEnrichProfile(payload: { name: string; address: string }) {
  const { name, address } = payload;

  const prompt = `Enrich the profile for "${name}" located at "${address}".

Use Google Search for accurate information.

Return as JSON object with:
- website
- phone (REQUIRED - international format with country code)
- instagram_url
- facebook_url
- description (rich description)
- special_events (array)
- popular_items (array)
- atmosphere (description)
- opening_hours_text
- city
- country`;

  const result = await callGemini(GEMINI_MODELS.text, prompt, {
    tools: [{ googleSearch: {} }],
    temperature: 0.5,
    maxTokens: 2048,
  });

  const enriched = parseJSON(result.text, {});
  if (enriched.phone) {
    enriched.phone = formatPhoneNumber(enriched.phone);
    enriched.whatsapp = enriched.phone;
  }
  return enriched;
}

// 3. GENERATE IMAGE - Generate images using Nano Banana Pro (Quality) or Imagen 4 Fast (Speed)
async function handleGenerateImage(payload: {
  prompt: string;
  size?: "1K" | "2K" | "4K";
  referenceImages?: string[];
  modelPreference?: "quality" | "fast";
}) {
  const { prompt, referenceImages, modelPreference } = payload;
  const apiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  // Determine model based on preference
  // Default to 'quality' for backward compatibility if not specified
  const modelToUse = modelPreference === "fast" ? GEMINI_MODELS.imageFast : GEMINI_MODELS.imagePro;

  // Enhance prompt
  let enhancedPrompt = prompt;

  // Add reference images if provided (Only supported on some models, checking logic)
  // Gemini 3 Pro supports multimodal, Imagen 4 might just take text or specific reference params.
  // For now, attaching inline data for Gemini models, checking docs for Imagen 4 later if needed.
  // Assuming consistent interface for generateContent for now since we are using the unified API endpoint structure
  // Note: Imagen 4 on Vertex AI might have different params, but via AI Studio/Gemini API it might standardization.
  // If Imagen 4 is text-to-image only via this endpoint, we might skip reference images for "fast" mode.

  const parts: any[] = [{ text: enhancedPrompt }];

  if (modelPreference !== "fast" && referenceImages?.length) {
    for (const refImage of referenceImages.slice(0, 5)) {
      try {
        if (refImage.startsWith('data:')) {
          const [header, data] = refImage.split(',');
          const mimeType = header.match(/data:([^;]+)/)?.[1] || "image/jpeg";
          parts.push({
            inlineData: { data, mimeType },
          });
        } else if (refImage.startsWith('http')) {
          enhancedPrompt += ` Reference image: ${refImage}`;
        }
      } catch (e) {
        console.warn("Failed to process reference image:", e);
      }
    }
  }

  const url = `${GEMINI_API_URL}/models/${modelToUse}:generateContent?key=${apiKey}`;

  const requestBody: any = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  };

  // Add specific image config if using image model
  // Note: API parameters might vary slightly between models, keeping it generic for now
  // For Imagen 4 Fast or Gemini 3 Pro Image, they often accept image generation params.
  // If this endpoint is purely generateContent (multimodal), it returns base64 in parts.

  // Basic config for compatibility
  // Only add imageConfig if relevant (some text models might error if present, but these are image models)
  requestBody.generationConfig.responseMimeType = "image/jpeg";
  // Force 4:3 for standardized look
  // requestBody.imageConfig = { aspectRatio: "4:3" }; // Not all models support this validly in the same field

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Image generation failed: ${response.status} - ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  if (data.candidates?.[0]?.content?.parts) {
    for (const part of data.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || "image/png";
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  return null;
}

// 4. PARSE MENU - Parse menu from image
async function handleParseMenu(payload: { fileData: string; mimeType: string }) {
  const { fileData, mimeType } = payload;

  const prompt = `Parse this menu image and extract all menu items. For each item, provide:
- name (required)
- description
- price (as number)
- category (Appetizers, Mains, Desserts, Drinks, etc.)
- tags (array of tags like "vegetarian", "spicy")

Return as JSON array of menu items.`;

  const result = await callGemini(GEMINI_MODELS.vision, prompt, {
    imageData: fileData,
    mimeType,
    temperature: 0.3,
    maxTokens: 4096,
  });

  return parseJSON(result.text, []);
}

// 5. SMART DESCRIPTION - Generate venue description
async function handleSmartDescription(payload: { name: string; category: string }) {
  const { name, category } = payload;

  const prompt = `Write an appetizing, professional menu description for "${name}" in the ${category} category.

Return as JSON object with:
- text (the description text)`;

  const result = await callGemini(GEMINI_MODELS.text, prompt, {
    temperature: 0.8,
    maxTokens: 200,
  });

  const parsed = parseJSON(result.text, {});
  return parsed.text || "";
}

// 6. GENERATE ASSET - Generate, Upload, and Save
async function handleGenerateAsset(payload: {
  prompt: string;
  entityId: string;
  table: "vendors" | "menu_items";
  column: string;
}) {
  const { prompt, entityId, table, column } = payload;

  // 1. Generate Image
  // Use "quality" for venues (vendors) and "fast" for menu items to save costs/time
  const modelPreference = table === "vendors" ? "quality" : "fast";
  const base64Data = await handleGenerateImage({
    prompt,
    size: "2K",
    modelPreference
  });

  if (!base64Data) {
    throw new Error("Failed to generate image");
  }

  // 2. Decode Base64
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 string");
  }
  const type = matches[1];
  const buffer = Uint8Array.from(atob(matches[2]), c => c.charCodeAt(0));

  // 3. Upload to Storage
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const extension = type.split("/")[1] || "png";
  const filePath = `generated/${table}/${entityId}.${extension}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("venue-images")
    .upload(filePath, buffer, {
      contentType: type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  // 4. Get Public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("venue-images")
    .getPublicUrl(filePath);

  // 5. Update Database
  const { error: dbError } = await supabaseAdmin
    .from(table)
    .update({ [column]: publicUrl })
    .eq("id", entityId);

  if (dbError) {
    throw new Error(`Database update failed: ${dbError.message}`);
  }

  return { success: true, url: publicUrl };
}

// 7. CATEGORIZE VENUE - AI categorization using Maps/Search grounding
async function handleCategorizeVenue(payload: { name: string; address: string; description?: string; lat?: number; lng?: number }) {
  const { name, address, description, lat, lng } = payload;

  const prompt = `Analyze the venue "${name}" located at "${address}".
${description ? `Description context: ${description}` : ""}

Using Google Search and Google Maps data, provide comprehensive categorical tags and insights for this venue.
If location data is provided, use it to ground the response in the actual venue details.

Return JSON with:
- primary_category (Most specific category, e.g., "Neapolitan Pizzeria", "Craft Cocktail Bar")
- cuisine_types (array of strings, e.g., "Italian", "Wood-fired Pizza")
- ambiance_tags (array of strings, e.g., "Romantic", "Industrial Chic", "Family-Friendly")
- price_range ($, $$, $$$, or $$$$)
- highlights (array of strings, e.g., "Rooftop View", "Happy Hour", "Live Jazz")
- dietary_friendly (array of strings, e.g., "Vegetarian Options", "Gluten-Free Available")
- popular_times (string description of busy hours if available)
- competitor_context (brief string comparing to local similar venues)`;

  const tools: any[] = [{ googleSearch: {} }];

  // Add Google Maps Grounding if coordinates are available
  if (lat && lng) {
    tools.push({
      google_maps_grounding: {
        user_location: {
          latitude: lat,
          longitude: lng
        }
      }
    });
  }

  const result = await callGemini(GEMINI_MODELS.categorizeVenue, prompt, {
    tools,
    temperature: 0.3, // Lower temperature for more factual categorization
    maxTokens: 1024,
  });

  return parseJSON(result.text, {});
}

// 8. CATEGORIZE MENU - Dynamic menu item grouping and tagging
async function handleCategorizeMenu(payload: { items: any[]; venueName?: string }) {
  const { items, venueName } = payload;

  // Process in chunks to avoid context limits if necessary, but for now assuming reasonable size
  // Minimal payload to save tokens
  const itemsLite = items.map(i => ({ id: i.id, name: i.name, desc: i.description }));

  const prompt = `Categorize these menu items for ${venueName || "the venue"}.

Items: ${JSON.stringify(itemsLite)}

For each item, provide:
1. dietary_tags (e.g., Vegetarian, Vegan, Gluten-Free, Dairy-Free, Nut-Free, Halal, Kosher)
2. flavor_profile (e.g., Spicy, Savory, Sweet, Sour, Umami, Smoky)
3. smart_category (A broad group: Appetizers, Mains, Desserts, Beverages, Sides, Kids)
4. cuisine_style (e.g., Italian, Mexican, Fusion)
5. meal_period (array: Breakfast, Lunch, Dinner, Late Night)
6. pairing_suggestions (short string)

Return a JSON Object where keys are the item IDs (or names if ID missing) and values are the classification objects.`;

  const result = await callGemini(GEMINI_MODELS.categorizeMenu, prompt, {
    temperature: 0.3,
    maxTokens: 4096,
    responseMimeType: "application/json",
  });

  return parseJSON(result.text, {});
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

const RATE_LIMIT: RateLimitConfig = {
  maxRequests: 30,
  window: "1 hour",
  endpoint: "gemini_features",
};

Deno.serve(async (req) => {
  const startTime = Date.now();
  const requestId = getOrCreateRequestId(req);
  const logger = createLogger({ requestId, action: "gemini-features" });

  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    logger.requestStart(req.method, "/gemini-features");

    const apiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("API_KEY");
    if (!apiKey) {
      logger.error("GEMINI_API_KEY not configured");
      return errorResponse("AI service not configured", 500);
    }

    // Parse body first to determine action
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      logger.warn("Invalid JSON body received");
      return errorResponse("Invalid JSON body", 400);
    }

    const parsed = geminiRequestSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("Validation failed", { errors: parsed.error.issues });
      return errorResponse("Invalid request data", 400, parsed.error.issues);
    }

    const { action, payload } = parsed.data;
    logger.info("Processing action", { action });

    // Actions that can be called anonymously (public discovery)
    const anonymousActions = ["search", "categorize-venue", "categorize-menu"];
    const isAnonymousAllowed = anonymousActions.includes(action);

    // Use shared admin client
    const supabaseAdmin = createAdminClient();
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error("Supabase environment variables missing");
      return errorResponse("Backend service not configured", 500);
    }

    // Use optional auth for flexibility
    const authResult = await optionalAuth(req, logger);
    const user = authResult?.user ?? null;

    // Require auth for non-anonymous actions
    if (!isAnonymousAllowed && !user) {
      logger.warn("Unauthorized access attempt", { action });
      return errorResponse("Unauthorized", 401);
    }

    const payloadSchema = payloadSchemas[action as GeminiAction];
    const payloadParsed = payloadSchema.safeParse(payload ?? {});
    if (!payloadParsed.success) {
      logger.warn("Payload validation failed", { action, errors: payloadParsed.error.issues });
      return errorResponse("Invalid payload", 400, payloadParsed.error.issues);
    }

    // Sanitize text inputs in payload
    const validatedPayload = { ...payloadParsed.data };
    if ('query' in validatedPayload && typeof validatedPayload.query === 'string') {
      validatedPayload.query = sanitizeText(validatedPayload.query, 1000);
    }
    if ('prompt' in validatedPayload && typeof validatedPayload.prompt === 'string') {
      validatedPayload.prompt = sanitizeText(validatedPayload.prompt, 5000);
    }
    if ('name' in validatedPayload && typeof validatedPayload.name === 'string') {
      validatedPayload.name = sanitizeText(validatedPayload.name, 500);
    }

    // Rate limiting (use IP for anonymous, user ID for authenticated)
    const rateLimitId = user?.id || req.headers.get("cf-connecting-ip") || "anonymous";
    const { data: allowed, error: rateLimitError } = await supabaseAdmin.rpc("check_rate_limit", {
      p_user_id: rateLimitId,
      p_endpoint: `${RATE_LIMIT.endpoint}_${action}`,
      p_limit: isAnonymousAllowed && !user ? 10 : RATE_LIMIT.maxRequests, // Lower limit for anonymous
      p_window: RATE_LIMIT.window,
    });

    if (rateLimitError) {
      logger.error("Rate limit check failed", { error: rateLimitError.message });
      // Don't block on rate limit errors - log and continue
    } else if (!allowed) {
      logger.warn("Rate limit exceeded", { userId: rateLimitId, action });
      return errorResponse("Too many requests. Please try again later.", 429);
    }

    let result: any;

    switch (action) {
      case "search":
        result = await handleSearch(validatedPayload);
        break;
      case "enrich-profile":
        result = await handleEnrichProfile(validatedPayload);
        break;
      case "generate-image":
        result = await handleGenerateImage(validatedPayload);
        break;
      case "parse-menu":
        result = await handleParseMenu(validatedPayload);
        break;
      case "smart-description":
        result = await handleSmartDescription(validatedPayload);
        break;
      case "generate-asset":
        result = await handleGenerateAsset(validatedPayload);
        break;
      case "categorize-venue":
        result = await handleCategorizeVenue(validatedPayload);
        break;
      case "categorize-menu":
        result = await handleCategorizeMenu(validatedPayload);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const durationMs = Date.now() - startTime;
    logger.requestEnd(200, durationMs);

    return jsonResponse({ success: true, requestId, data: result });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const maskedError = maskSensitiveError(error);
    logger.error("Gemini function error", { error: maskedError, durationMs });
    return errorResponse("Internal server error", 500, maskedError);
  }
});
