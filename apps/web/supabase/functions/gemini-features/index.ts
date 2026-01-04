import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenAI } from "https://esm.sh/@google/genai@0.1.1";

declare const process: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, payload } = requestBody;

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing "action" field' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get API key (try both environment variable names for flexibility)
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('Gemini API key not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    let result;

    // --- GEMINI LOGIC ---
    switch (action) {
      case 'discover': // Used by: findNearbyPlaces, findVenuesForClaiming
      case 'search':   // Used by: searchPlacesByName, discoverGlobalVenues
        {
          const isDiscover = action === 'discover';
          const prompt = isDiscover 
            ? `Find 10 popular bars and restaurants near lat:${payload.lat}, lng:${payload.lng}. Return a JSON array of venue objects with fields: name, address, google_place_id, lat, lng, visualVibe, category, priceLevel, summary, rating, userRatingCount, photo_url.` 
            : `Find venues matching query: "${payload.query}". Return a JSON array of venue objects with fields: name, address, google_place_id, lat, lng, visualVibe, category, priceLevel, summary, rating, photo_url.`;
          
          const resp = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              tools: [{ googleMaps: {} }],
              toolConfig: payload.lat ? { retrievalConfig: { latLng: { latitude: payload.lat, longitude: payload.lng } } } : undefined,
            }
          });
          
          // Extract location data from grounding chunks if available
          const chunks = resp.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

          // Fallback parsing if model returns markdown
          const text = resp.text || "[]";
          const cleanText = text.replace(/```json|```/g, '').trim();
          try {
            let parsed = JSON.parse(cleanText);
            
            // Enhance results with location data from grounding chunks if available
            if (Array.isArray(parsed) && chunks.length > 0) {
              parsed = parsed.map((venue: any, idx: number) => {
                const chunk = chunks[idx];
                if (chunk?.googleMaps) {
                  venue.google_place_id = venue.google_place_id || chunk.googleMaps.placeId;
                  venue.lat = venue.lat || chunk.googleMaps.lat;
                  venue.lng = venue.lng || chunk.googleMaps.lng;
                  venue.photo_url = venue.photo_url || chunk.googleMaps.photoUrl;
                }
                return venue;
              });
            }
            
            result = parsed;
          } catch (e) {
            console.error("JSON Parse Error", text);
            result = [];
          }
        }
        break;

      case 'venue-insights': // Used by: ClientHome for live events/happy hours
        {
           const venueNames = payload.names.join(', ');
           const resp = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: `Find trending events, happy hours, or live music happening this week for these venues near (${payload.lat}, ${payload.lng}): ${venueNames}.
             Return ONLY a raw JSON object where the key is the venue name and the value is a short, punchy highlight string (max 6 words).
             Example: {"The Pub": "Live Jazz @ 8pm", "Ocean Grill": "2-for-1 Cocktails"}.
             Only include venues where you find specific relevant info.`,
             config: {
               tools: [{ googleSearch: {} }]
             }
           });
           const text = resp.text || "{}";
           try {
             result = JSON.parse(text.replace(/```json|```/g, '').trim());
           } catch {
             result = {};
           }
        }
        break;

      case 'adapt': // Used by: adaptUiToLocation
        {
          const resp = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze this location (Lat: ${payload.lat}, Lng: ${payload.lng}). Return JSON with: { cityName, country, currencySymbol, greeting (local language hello) }.`,
            config: {
              tools: [{ googleMaps: {} }],
              toolConfig: { retrievalConfig: { latLng: { latitude: payload.lat, longitude: payload.lng } } }
            }
          });
          const text = resp.text || "{}";
          try {
            result = JSON.parse(text.replace(/```json|```/g, '').trim());
          } catch {
            result = { cityName: 'Unknown', currencySymbol: '$', greeting: 'Welcome' };
          }
        }
        break;

      case 'recommend': // Used by: getAiRecommendation (Explore)
        {
           const resp = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: `Act as a concierge. Suggest 3 specific venues for: "${payload.query}".`,
             config: {
               tools: [{ googleMaps: {} }],
               toolConfig: payload.location ? { retrievalConfig: { latLng: { latitude: payload.location.lat, longitude: payload.location.lng } } } : undefined
             }
           });
           result = {
             text: resp.text,
             chunks: resp.candidates?.[0]?.groundingMetadata?.groundingChunks || []
           };
        }
        break;

      case 'market-insights': // Used by: Vendor Menu Insights
        {
          const resp = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `What are the top 3 trending menu items or concepts for "${payload.category}" venues in 2024? Keep it concise.`,
            config: { tools: [{ googleSearch: {} }] }
          });
          result = {
            text: resp.text,
            sources: resp.candidates?.[0]?.groundingMetadata?.groundingChunks || []
          };
        }
        break;

      case 'enrich-profile': // Used by: Vendor Onboarding
        {
          const resp = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Search for business "${payload.name}" at "${payload.address}". Return JSON: { phone, website, description, hours, instagramUrl, facebookUrl, tags (array), priceLevel, currencySymbol }.`,
            config: { tools: [{ googleSearch: {} }] }
          });
          try {
            result = JSON.parse((resp.text || "{}").replace(/```json|```/g, '').trim());
          } catch {
            result = {};
          }
        }
        break;

      case 'smart-description': // Used by: Vendor Onboarding
        {
          const resp = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Write a catchy, 1-sentence marketing description for a ${payload.category} called "${payload.name}". Max 15 words.`,
          });
          result = resp.text.trim();
        }
        break;

      case 'generate-image': // Used by: generateProImage, generateVenueThumbnail
        {
          const model = payload.model || 'gemini-2.5-flash-image';
          // 'pro' requires explicit size if supported, otherwise default
          const imageSize = model.includes('pro') ? (payload.size || '1K') : undefined;
          
          const resp = await ai.models.generateContent({
            model: model,
            contents: { parts: [{ text: payload.prompt }] },
            config: {
              imageConfig: {
                aspectRatio: "1:1",
                imageSize: imageSize
              }
            }
          });
          
          let base64 = null;
          // Robustly find image part
          if (resp.candidates?.[0]?.content?.parts) {
            for (const part of resp.candidates[0].content.parts) {
              if (part.inlineData) {
                 base64 = `data:image/png;base64,${part.inlineData.data}`;
                 break;
              }
            }
          }
          result = base64;
        }
        break;

      case 'edit-image': // Used by: editImageWithAi
        {
          const rawBase64 = payload.image.includes('base64,') ? payload.image.split('base64,')[1] : payload.image;
          const resp = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [
                { inlineData: { data: rawBase64, mimeType: 'image/png' } },
                { text: payload.prompt }
              ]
            }
          });
          
          let base64 = null;
          if (resp.candidates?.[0]?.content?.parts) {
            for (const part of resp.candidates[0].content.parts) {
              if (part.inlineData) {
                 base64 = `data:image/png;base64,${part.inlineData.data}`;
                 break;
              }
            }
          }
          result = base64;
        }
        break;

      case 'parse-menu': // Used by: Vendor Menu Import
        {
           const resp = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: {
               parts: [
                 { inlineData: { mimeType: payload.mimeType, data: payload.fileData } },
                 { text: "Extract all menu items from this file. Return a JSON array where each object has: name, description, price (number), category." }
               ]
             },
             config: { responseMimeType: "application/json" }
           });
           try {
             result = JSON.parse(resp.text || "[]");
           } catch {
             result = [];
           }
        }
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  
  } catch (error: any) {
    console.error("Gemini Edge Function Error:", error);
    const errorMessage = error?.message || error?.toString() || 'Internal server error';
    const errorStatus = error?.status || 500;

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error?.details || undefined,
      }),
      {
        status: errorStatus,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});