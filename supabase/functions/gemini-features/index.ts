import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const geminiRequestSchema = z.object({
  action: z.enum([
    "search",
    "generate-image",
    "generate-asset",
    "parse-menu",
    "smart-description",
  ]),
  payload: z.record(z.unknown()).optional(),
});

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
} as const;

type GeminiAction = z.infer<typeof geminiRequestSchema>["action"];

const RATE_LIMIT = {
  maxRequests: 30,
  window: "1 hour",
  endpointPrefix: "gemini",
};

// Gemini API Configuration
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODELS = {
  text: "gemini-3.0-flash-exp", // Primary
  textFallback: "gemini-2.5-pro-exp", // Fallback
  vision: "gemini-3.0-flash-exp", // Primary for vision
  visionFallback: "gemini-2.5-pro-exp", // Fallback for vision
  imagePro: "gemini-2.5-flash-thinking-exp", // Nano Banana Pro (2K)
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
    },
  };

  if (options.tools?.length) requestBody.tools = options.tools;
  if (options.toolConfig) requestBody.toolConfig = options.toolConfig;

  // Try primary model first
  let url = `${GEMINI_API_URL}/models/${primaryModel}:generateContent?key=${apiKey}`;
  let response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  // Fallback to secondary model on error
  if (!response.ok && fallbackModel) {
    console.warn(`Primary model ${primaryModel} failed, trying fallback ${fallbackModel}`);
    url = `${GEMINI_API_URL}/models/${fallbackModel}:generateContent?key=${apiKey}`;
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();

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

// 3. GENERATE IMAGE - Generate images using Nano Banana Pro
async function handleGenerateImage(payload: {
  prompt: string;
  size?: "1K" | "2K" | "4K";
  referenceImages?: string[];
}) {
  const { prompt, referenceImages } = payload;
  const apiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  // Enhance prompt
  let enhancedPrompt = prompt;

  // Add reference images if provided
  const parts: any[] = [{ text: enhancedPrompt }];
  if (referenceImages?.length) {
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

  const url = `${GEMINI_API_URL}/models/${GEMINI_MODELS.imagePro}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
      imageConfig: {
        aspectRatio: "4:3",
        imageSize: "2K",
      },
    }),
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
  const base64Data = await handleGenerateImage({ prompt, size: "2K" });

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

// ============================================================================
// MAIN HANDLER
// ============================================================================

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
    const apiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse body first to determine action
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = geminiRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request data", details: parsed.error.issues }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, payload } = parsed.data;

    // Actions that can be called anonymously (public discovery)
    const anonymousActions = ["search"];
    const isAnonymousAllowed = anonymousActions.includes(action);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase environment variables missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check auth for non-anonymous actions
    const authHeader = req.headers.get("Authorization");
    let user: { id: string } | null = null;

    if (authHeader) {
      const supabaseUser = createClient(
        supabaseUrl,
        supabaseAnonKey,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data, error: userError } = await supabaseUser.auth.getUser();
      if (!userError && data.user) {
        user = { id: data.user.id };
      }
    }

    // Require auth for non-anonymous actions
    if (!isAnonymousAllowed && !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const payloadSchema = payloadSchemas[action as GeminiAction];
    const payloadParsed = payloadSchema.safeParse(payload ?? {});
    if (!payloadParsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid payload", details: payloadParsed.error.issues }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validatedPayload = payloadParsed.data;

    // Rate limiting (use IP for anonymous, user ID for authenticated)
    const rateLimitId = user?.id || req.headers.get("cf-connecting-ip") || "anonymous";
    const { data: allowed, error: rateLimitError } = await supabaseAdmin.rpc("check_rate_limit", {
      p_user_id: rateLimitId,
      p_endpoint: `${RATE_LIMIT.endpointPrefix}_${action}`,
      p_limit: isAnonymousAllowed && !user ? 10 : RATE_LIMIT.maxRequests, // Lower limit for anonymous
      p_window: RATE_LIMIT.window,
    });

    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
      // Don't block on rate limit errors - log and continue
    } else if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Gemini function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
