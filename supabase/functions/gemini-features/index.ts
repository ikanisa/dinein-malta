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
    "discover",
    "search",
    "enrich-profile",
    "adapt",
    "generate-image",
    "parse-menu",
    "smart-description",
  ]),
  payload: z.record(z.unknown()).optional(),
});

const payloadSchemas = {
  discover: z.object({
    lat: z.number(),
    lng: z.number(),
    radius: z.number().optional(),
  }),
  search: z.object({
    query: z.string().min(1),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  "enrich-profile": z.object({
    name: z.string().min(1),
    address: z.string().min(1),
  }),
  adapt: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  "generate-image": z.object({
    prompt: z.string().min(1),
    size: z.enum(["1K", "2K", "4K"]).optional(),
    locationContext: z.object({
      city: z.string().optional(),
      country: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    }).optional(),
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

/**
 * Calculate distance between two coordinates (Haversine)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

// ============================================================================
// HANDLERS - Only essential functions
// ============================================================================

// 1. DISCOVER - Find nearby venues (sorted by distance)
async function handleDiscover(payload: { lat: number; lng: number; radius?: number }) {
  const { lat, lng, radius = 5000 } = payload;

  const prompt = `Find ALL nearby restaurants, bars, cafes, and dining venues within ${radius} meters of latitude ${lat}, longitude ${lng}.

CRITICAL REQUIREMENTS:
1. Sort by DISTANCE FIRST - nearest venues first
2. Include ALL venues found (no limit on count)
3. Use Google Maps grounding to get accurate, real-time data

For each venue, provide comprehensive data from Google Maps:
- name (required, from Google Maps)
- google_place_id (required, from Google Maps Place ID)
- address (full address from Google Maps)
- lat, lng (REQUIRED, precise coordinates from Google Maps)
- distance_meters (calculate exact distance using Haversine formula)
- rating (0-5, from Google Maps user ratings)
- user_rating_total (number of reviews from Google Maps)
- price_level (1-4, from Google Maps price indicators)
- opening_hours_text (current status: "Open now", "Closes at XX:XX", etc.)
- opening_hours_detailed (structured hours for each day)
- website (from Google Maps)
- phone (REQUIRED - international format with country code from Google Maps, e.g., +250788123456)
- photo_url (REQUIRED - high quality image URLs from Google Maps Photos API)
- photo_references (array of Google Maps photo reference IDs)
- place_types (array of place types from Google Maps: "restaurant", "bar", "cafe", etc.)
- quick_tags (array of 3-5 descriptive tags like "cocktails", "live music", "outdoor seating", "romantic")
- category_tags (from Google Maps place types and user reviews: "trending", "outdoor seating", "live music", "family-friendly", etc.)
- why_recommended (one compelling sentence based on reviews and place characteristics)
- city (from Google Maps address components)
- country (from Google Maps address components)
- current_popularity (if available from Google Maps Popular Times data)

Use Google Maps grounding extensively to get accurate, up-to-date information including:
- Real-time opening hours and current status
- Recent photos
- Accurate ratings and review counts
- Precise location data
- Place types and categories

Return as JSON array sorted by distance (nearest first).`;

  const result = await callGemini(GEMINI_MODELS.text, prompt, {
    tools: [{ googleMaps: {} }],
    toolConfig: {
      retrievalConfig: {
        latLng: { latitude: lat, longitude: lng },
      },
    },
    temperature: 0.3,
    maxTokens: 4096,
  });

  const venues = parseJSON(result.text, []);

  // Format phone numbers, calculate distances, and sort
  const processed = venues.map((venue: any) => {
    if (venue.phone) {
      venue.phone = formatPhoneNumber(venue.phone);
      venue.whatsapp = venue.phone;
    }
    if (venue.lat && venue.lng && !venue.distance_meters) {
      venue.distance_meters = calculateDistance(lat, lng, venue.lat, venue.lng);
    }
    return venue;
  });

  processed.sort((a: any, b: any) => (a.distance_meters || 999999) - (b.distance_meters || 999999));
  return processed;
}

// 2. SEARCH - Search venues by query
async function handleSearch(payload: { query: string; lat?: number; lng?: number }) {
  const { query, lat, lng } = payload;

  const locationContext = lat && lng ? `near latitude ${lat}, longitude ${lng}` : "";
  const prompt = `Search for restaurants, bars, cafes, and dining venues matching "${query}" ${locationContext}.

For each venue, provide:
- name (required)
- google_place_id
- address
- lat, lng
- distance_meters (if location provided)
- rating
- price_level
- opening_hours_text
- website
- phone (REQUIRED - international format with country code)
- photo_url (REQUIRED - image URLs from Google Maps)
- photo_references (array)
- quick_tags
- category_tags
- why_recommended
- city (from Google Maps)
- country (from Google Maps)

Return as JSON array${lat && lng ? ' sorted by distance' : ''}.`;

  const toolConfig: any = {};
  if (lat && lng) {
    toolConfig.retrievalConfig = {
      latLng: { latitude: lat, longitude: lng },
    };
  }

  const result = await callGemini(GEMINI_MODELS.text, prompt, {
    tools: [{ googleMaps: {} }, { googleSearch: {} }],
    toolConfig,
    temperature: 0.4,
    maxTokens: 4096,
  });

  const venues = parseJSON(result.text, []);
  
  // Format phone numbers and calculate distances
  const processed = venues.map((venue: any) => {
    if (venue.phone) {
      venue.phone = formatPhoneNumber(venue.phone);
      venue.whatsapp = venue.phone;
    }
    if (lat && lng && venue.lat && venue.lng && !venue.distance_meters) {
      venue.distance_meters = calculateDistance(lat, lng, venue.lat, venue.lng);
    }
    return venue;
  });

  if (lat && lng) {
    processed.sort((a: any, b: any) => (a.distance_meters || 999999) - (b.distance_meters || 999999));
  }

  return processed;
}

// 3. ENRICH PROFILE - Enrich venue with Google Maps/Search data
async function handleEnrichProfile(payload: { name: string; address: string }) {
  const { name, address } = payload;

  const prompt = `Enrich the profile for "${name}" located at "${address}".

Use Google Maps for accurate data and Google Search for additional information.

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
- city (from Google Maps)
- country (from Google Maps)`;

  const result = await callGemini(GEMINI_MODELS.text, prompt, {
    tools: [{ googleMaps: {} }, { googleSearch: {} }],
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

// 4. ADAPT UI - Adapt UI to location
async function handleAdapt(payload: { lat: number; lng: number }) {
  const { lat, lng } = payload;

  const prompt = `Based on coordinates (latitude: ${lat}, longitude: ${lng}), use Google Maps to determine:
- cityName (e.g., "Kigali", "Paris", "New York")
- country (e.g., "Rwanda", "France", "USA")
- currencySymbol (e.g., "$", "€", "£", "RWF")
- greeting (culturally appropriate, e.g., "Muraho" for Rwanda)

Return as JSON object.`;

  const result = await callGemini(GEMINI_MODELS.text, prompt, {
    tools: [{ googleMaps: {} }],
    toolConfig: {
      retrievalConfig: {
        latLng: { latitude: lat, longitude: lng },
      },
    },
    temperature: 0.4,
    maxTokens: 1024,
  });

  const parsed = parseJSON(result.text, {});
  return {
    cityName: parsed.cityName || "Your Area",
    country: parsed.country || "",
    greeting: parsed.greeting || "Welcome",
    currencySymbol: parsed.currencySymbol || "$",
    timezone: parsed.timezone,
  };
}

// 5. GENERATE IMAGE - Generate images using Nano Banana Pro
async function handleGenerateImage(payload: {
  prompt: string;
  size?: "1K" | "2K" | "4K";
  locationContext?: { city?: string; country?: string; lat?: number; lng?: number };
  referenceImages?: string[];
}) {
  const { prompt, locationContext, referenceImages } = payload;
  const apiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  // Enhance prompt with location context
  let enhancedPrompt = prompt;
  if (locationContext?.country) {
    enhancedPrompt += ` Location: ${locationContext.city || ''}${locationContext.city && locationContext.country ? ', ' : ''}${locationContext.country || ''}. IMPORTANT: The image must accurately represent local demographics and culture of ${locationContext.country}, not generic Western demographics.`;
  }

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

// 6. PARSE MENU - Parse menu from image
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

// 7. SMART DESCRIPTION - Generate venue description
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase environment variables missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
    const payloadSchema = payloadSchemas[action as GeminiAction];
    const payloadParsed = payloadSchema.safeParse(payload ?? {});
    if (!payloadParsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid payload", details: payloadParsed.error.issues }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validatedPayload = payloadParsed.data;

    const { data: allowed, error: rateLimitError } = await supabaseAdmin.rpc("check_rate_limit", {
      p_user_id: user.id,
      p_endpoint: `${RATE_LIMIT.endpointPrefix}_${action}`,
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

    let result: any;

    switch (action) {
      case "discover":
        result = await handleDiscover(validatedPayload);
        break;
      case "search":
        result = await handleSearch(validatedPayload);
        break;
      case "enrich-profile":
        result = await handleEnrichProfile(validatedPayload);
        break;
      case "adapt":
        result = await handleAdapt(validatedPayload);
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
