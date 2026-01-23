
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Gemini API Configuration
export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";
export const GEMINI_MODELS = {
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
 * Call Gemini API with primary/fallback model support
 */
export async function callGemini(
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
        apiKey?: string; // Optional override
    } = {}
) {
    const apiKey = options.apiKey || Deno.env.get("GEMINI_API_KEY") || Deno.env.get("API_KEY");
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
export function parseJSON(text: string | undefined, fallback: any = []): any {
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
