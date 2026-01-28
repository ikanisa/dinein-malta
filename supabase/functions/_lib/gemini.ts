
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

// =============================================================================
// AGENT CHAT FUNCTIONALITY (Moltbot Integration)
// =============================================================================

export type AgentType = 'guest' | 'bar_manager' | 'admin';

// System prompts for each agent type
export const AGENT_SYSTEM_PROMPTS: Record<AgentType, string> = {
    guest: `You are a friendly, knowledgeable AI waiter at a restaurant/bar. Your role is to:

1. **Welcome Guests** - Greet warmly, explain you can help with menu and orders
2. **Menu Assistance** - Answer questions about items, suggest recommendations based on preferences
3. **Order Taking** - Take orders conversationally, confirm items, suggest pairings
4. **Order Tracking** - Update on order status when asked
5. **Additional Services** - Call human staff when needed, help with payment method selection

**Important Rules:**
- Always confirm orders before submitting
- Be honest about wait times and availability
- Use emojis sparingly (🍽️ 🍷 ✨)
- Keep messages concise but warm
- If unsure, suggest calling a human waiter
- Never make up menu items or prices - only reference actual menu items provided

**Response style:** Friendly, professional, efficient. Keep responses under 3 paragraphs.`,

    bar_manager: `You are a professional business assistant helping bar/restaurant managers with daily operations. Your role is to:

1. **Order Management** - Summarize active orders, highlight urgent items
2. **Analytics** - Provide insights on sales, popular items, peak hours
3. **Operational Support** - Answer questions about workflow, status updates
4. **Decision Support** - Offer data-driven recommendations

**Important Rules:**
- Be direct and actionable
- Use numbers and data when available
- Format lists and summaries clearly
- Prioritize urgent information first

**Response style:** Professional, data-driven, concise. Use bullet points for lists.`,

    admin: `You are a platform management assistant helping DineIn administrators. Your role is to:

1. **Application Review** - Summarize venue applications, highlight key details
2. **Moderation Support** - Help review flagged content or issues
3. **Platform Insights** - Provide analytics on platform usage
4. **Decision Support** - Offer recommendations for approvals/rejections

**Important Rules:**
- Be impartial and thorough
- Document reasoning for decisions
- Prioritize based on urgency
- Highlight any compliance or risk concerns

**Response style:** Professional, analytical, thorough. Use structured summaries.`,
};

export interface ConversationMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

/**
 * Build context string for the AI based on provided data
 */
export function buildAgentContext(context: {
    venue?: { name: string; id: string } | null;
    table_no?: string | null;
    menu_items?: Array<{ name: string; price: number; description?: string; currency?: string }>;
    active_orders?: Array<{ id: string; status: string; items: string[] }>;
    pending_claims?: number;
}): string {
    const parts: string[] = [];

    if (context.venue) {
        parts.push(`**Current Venue:** ${context.venue.name}`);
    }

    if (context.table_no) {
        parts.push(`**Table Number:** ${context.table_no}`);
    }

    if (context.menu_items && context.menu_items.length > 0) {
        const menuStr = context.menu_items
            .slice(0, 15) // Limit to avoid token explosion
            .map((m) => `- ${m.name}: ${m.price} ${m.currency || ''} ${m.description ? `(${m.description})` : ""}`)
            .join("\n");
        parts.push(`**Available Menu Items:**\n${menuStr}`);
    }

    if (context.active_orders && context.active_orders.length > 0) {
        const ordersStr = context.active_orders
            .map((o) => `- Order ${o.id.slice(0, 8)}: ${o.status} - ${o.items.join(", ")}`)
            .join("\n");
        parts.push(`**Active Orders:**\n${ordersStr}`);
    }

    if (context.pending_claims !== undefined && context.pending_claims > 0) {
        parts.push(`**Pending Venue Claims:** ${context.pending_claims}`);
    }

    return parts.length > 0 ? `\n\n**Context:**\n${parts.join("\n\n")}` : "";
}

/**
 * Streaming chat completion for agent conversations
 */
export async function streamAgentChat(
    agentType: AgentType,
    messages: ConversationMessage[],
    contextString: string = ""
): Promise<ReadableStream<Uint8Array>> {
    const apiKey = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("API_KEY");
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY not configured");
    }

    const systemPrompt = AGENT_SYSTEM_PROMPTS[agentType] + contextString;

    // Convert messages to Gemini format
    const geminiMessages = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
        }));

    const url = `${GEMINI_API_URL}/models/gemini-2.0-flash-exp:streamGenerateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{ text: systemPrompt }],
            },
            contents: geminiMessages,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
                topP: 0.9,
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    return response.body!;
}

/**
 * Non-streaming agent chat completion
 */
export async function getAgentChatCompletion(
    agentType: AgentType,
    messages: ConversationMessage[],
    contextString: string = ""
): Promise<string> {
    const systemPrompt = AGENT_SYSTEM_PROMPTS[agentType] + contextString;

    // Use existing callGemini with the system prompt prepended
    const conversationText = messages
        .map(m => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n\n");

    const result = await callGemini(
        "gemini-2.0-flash-exp",
        `${systemPrompt}\n\n---\n\nConversation:\n${conversationText}`,
        { temperature: 0.7, maxTokens: 1024 }
    );

    return result.text || "";
}

