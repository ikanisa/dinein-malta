import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Rough bounding box for Malta (keeps scope strict + reduces abuse)
function isInMalta(lat: number, lng: number) {
  return lat >= 35.7 && lat <= 36.2 && lng >= 14.0 && lng <= 14.9;
}

function toNumber(v: unknown) {
  const n = typeof v === "string" ? Number(v) : (typeof v === "number" ? v : NaN);
  return Number.isFinite(n) ? n : null;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function extractJsonArray(text: string) {
  const s = text.trim();
  // best case: already valid JSON array
  if (s.startsWith("[") && s.endsWith("]")) return s;

  // fallback: try to carve out the first [...] block
  const start = s.indexOf("[");
  const end = s.lastIndexOf("]");
  if (start >= 0 && end > start) return s.slice(start, end + 1);

  return null;
}

type PlaceOut = {
  name: string;
  google_place_id: string | null;
  primary_type: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  user_ratings_total: number | null;
  price_level: number | null;
  website: string | null;
  phone: string | null;
  opening_hours_text: string | null;
  open_now: boolean | null;
  photo_hint: string | null; // may be a URL or a short hint depending on grounding
  quick_tags: string[];
  why_recommended: string | null;
  distance_m: number | null;
};

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) return json({ ok: false, error: "MISSING_GEMINI_API_KEY" }, 500);

    // Require auth header (keep it simple; Supabase “Verify JWT” can enforce validity)
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader) return json({ ok: false, error: "MISSING_AUTHORIZATION" }, 401);

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: "INVALID_JSON_BODY" }, 400);
    }

    const lat = toNumber(body?.lat);
    const lng = toNumber(body?.lng);
    const limitRaw = toNumber(body?.limit);
    const limit = Math.max(1, Math.min(30, limitRaw ?? 30));
    const mode = (typeof body?.mode === "string" ? body.mode : "client") as "client" | "vendor";
    const intent = typeof body?.intent === "string" ? body.intent.trim() : "";

    if (lat === null || lng === null) {
      return json({ ok: false, error: "lat/lng required", hint: { lat: "number", lng: "number" } }, 400);
    }
    if (!isInMalta(lat, lng)) {
      return json({ ok: false, error: "OUT_OF_SCOPE_MALTA_ONLY" }, 400);
    }

    const userIntentLine = intent ? `User intent: ${intent}\n` : "";
    const prompt = `
You are a hyper-accurate Malta-only dine-in scout.
Return a JSON ARRAY (no markdown, no commentary) of up to ${limit} nearby places that are either BAR, RESTAURANT, CAFE, or similar dine-in venues.

Use Google Maps grounding for factual fields (name, address, hours, rating, etc).
Use Google Search grounding ONLY to enrich with lightweight “what’s interesting” signals (events nights, live music, specials) if available.

${userIntentLine}
Context:
- Country: Malta (MT) only.
- Mode: ${mode} (client shows the best choices; vendor shows closest choices for onboarding).
- Location: latitude ${lat}, longitude ${lng}.
- Prefer within ~2km if possible. Avoid duplicates.

For each item, output exactly these keys:
{
  "name": string,
  "google_place_id": string|null,
  "primary_type": string|null,
  "address": string|null,
  "lat": number|null,
  "lng": number|null,
  "rating": number|null,
  "user_ratings_total": number|null,
  "price_level": number|null,
  "website": string|null,
  "phone": string|null,
  "opening_hours_text": string|null,
  "open_now": boolean|null,
  "photo_hint": string|null,
  "quick_tags": string[],         // short tags like ["cocktails","live music","sea view"]
  "why_recommended": string|null  // one short sentence
}

Return ONLY the JSON array.
    `.trim();

    const geminiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    const geminiReqBody = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools: [
        { googleMaps: {} },
        { google_search: {} },
      ],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng },
        },
      },
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    };

    const r = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(geminiReqBody),
    });

    const geminiJson = await r.json().catch(() => null);
    if (!r.ok) {
      return json(
        {
          ok: false,
          error: "GEMINI_ERROR",
          status: r.status,
          details: geminiJson,
        },
        502,
      );
    }

    const parts: any[] = geminiJson?.candidates?.[0]?.content?.parts ?? [];
    const text = parts.map((p) => p?.text ?? "").join("").trim();

    const jsonArrayText = extractJsonArray(text);
    if (!jsonArrayText) {
      return json(
        {
          ok: false,
          error: "MODEL_DID_NOT_RETURN_JSON_ARRAY",
          model_text_preview: text.slice(0, 400),
        },
        502,
      );
    }

    let placesRaw: any[] = [];
    try {
      placesRaw = JSON.parse(jsonArrayText);
      if (!Array.isArray(placesRaw)) throw new Error("not array");
    } catch {
      return json(
        {
          ok: false,
          error: "JSON_PARSE_FAILED",
          model_text_preview: text.slice(0, 400),
        },
        502,
      );
    }

    const normalized: PlaceOut[] = placesRaw.slice(0, limit).map((p) => {
      const plat = toNumber(p?.lat);
      const plng = toNumber(p?.lng);
      const distance_m =
        plat !== null && plng !== null ? Math.round(haversineMeters(lat, lng, plat, plng)) : null;

      const tags = Array.isArray(p?.quick_tags) ? p.quick_tags.filter((t: any) => typeof t === "string").slice(0, 8) : [];

      return {
        name: typeof p?.name === "string" ? p.name : "Unknown",
        google_place_id: typeof p?.google_place_id === "string" ? p.google_place_id : null,
        primary_type: typeof p?.primary_type === "string" ? p.primary_type : null,
        address: typeof p?.address === "string" ? p.address : null,
        lat: plat,
        lng: plng,
        rating: toNumber(p?.rating),
        user_ratings_total: toNumber(p?.user_ratings_total),
        price_level: toNumber(p?.price_level),
        website: typeof p?.website === "string" ? p.website : null,
        phone: typeof p?.phone === "string" ? p.phone : null,
        opening_hours_text: typeof p?.opening_hours_text === "string" ? p.opening_hours_text : null,
        open_now: typeof p?.open_now === "boolean" ? p.open_now : null,
        photo_hint: typeof p?.photo_hint === "string" ? p.photo_hint : null,
        quick_tags: tags,
        why_recommended: typeof p?.why_recommended === "string" ? p.why_recommended : null,
        distance_m,
      };
    }).sort((a, b) => (a.distance_m ?? 1e12) - (b.distance_m ?? 1e12));

    const groundingChunks: any[] = geminiJson?.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources = {
      maps: groundingChunks
        .filter((c) => c?.maps?.uri)
        .map((c) => ({ title: c.maps.title ?? null, uri: c.maps.uri ?? null, placeId: c.maps.placeId ?? null })),
      web: groundingChunks
        .filter((c) => c?.web?.uri)
        .map((c) => ({ title: c.web.title ?? null, uri: c.web.uri ?? null })),
    };

    return json({
      ok: true,
      mode,
      count: normalized.length,
      places: normalized,
      sources,
    });
  } catch (e) {
    return json({ ok: false, error: "UNEXPECTED_ERROR", details: String(e) }, 500);
  }
});
