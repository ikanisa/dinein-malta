/**
 * Anthropic Claude API Helper
 * 
 * Provides Claude API integration for Moltbot chat assistant.
 * Uses streaming SSE for real-time responses.
 */

// Anthropic API Configuration
export const ANTHROPIC_API_URL = "https://api.anthropic.com/v1";
export const ANTHROPIC_MODELS = {
    chat: "claude-sonnet-4-20250514", // Primary for Moltbot chat
    chatFallback: "claude-3-5-haiku-20241022", // Faster fallback
};

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface AnthropicOptions {
    model?: string;
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
    stream?: boolean;
    apiKey?: string;
    tools?: ClaudeTool[];
}

// Tool definition for Claude tool use
export interface ClaudeTool {
    name: string;
    description: string;
    input_schema: {
        type: "object";
        properties: Record<string, unknown>;
        required?: string[];
    };
}

// Response type when Claude calls a tool
export interface ToolUseBlock {
    type: "tool_use";
    id: string;
    name: string;
    input: Record<string, unknown>;
}

export interface TextBlock {
    type: "text";
    text: string;
}

export type ContentBlock = TextBlock | ToolUseBlock;

export interface ClaudeResponse {
    id: string;
    content: ContentBlock[];
    stop_reason: "end_turn" | "tool_use" | "max_tokens" | "stop_sequence";
    usage?: {
        input_tokens: number;
        output_tokens: number;
    };
}

/**
 * Call Claude API for chat completion
 */
export async function callClaude(
    messages: ChatMessage[],
    options: AnthropicOptions = {}
): Promise<string> {
    const apiKey = options.apiKey || Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const model = options.model || ANTHROPIC_MODELS.chat;

    const requestBody: Record<string, unknown> = {
        model,
        max_tokens: options.maxTokens ?? 2048,
        messages: messages.map(m => ({
            role: m.role,
            content: m.content,
        })),
    };

    if (options.systemPrompt) {
        requestBody.system = options.systemPrompt;
    }

    if (options.temperature !== undefined) {
        requestBody.temperature = options.temperature;
    }

    const response = await fetch(`${ANTHROPIC_API_URL}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text ?? "";
}

/**
 * Call Claude API with tool use support
 * Returns full response including tool calls
 */
export async function callClaudeWithTools(
    messages: Array<{ role: string; content: string | ContentBlock[] }>,
    tools: ClaudeTool[],
    options: AnthropicOptions = {}
): Promise<ClaudeResponse> {
    const apiKey = options.apiKey || Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const model = options.model || ANTHROPIC_MODELS.chat;

    const requestBody: Record<string, unknown> = {
        model,
        max_tokens: options.maxTokens ?? 2048,
        messages,
        tools,
    };

    if (options.systemPrompt) {
        requestBody.system = options.systemPrompt;
    }

    if (options.temperature !== undefined) {
        requestBody.temperature = options.temperature;
    }

    const response = await fetch(`${ANTHROPIC_API_URL}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    return await response.json() as ClaudeResponse;
}


/**
 * Call Claude API with SSE streaming
 */
export async function* streamClaude(
    messages: ChatMessage[],
    options: AnthropicOptions = {}
): AsyncGenerator<string, void, unknown> {
    const apiKey = options.apiKey || Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const model = options.model || ANTHROPIC_MODELS.chat;

    const requestBody: Record<string, unknown> = {
        model,
        max_tokens: options.maxTokens ?? 2048,
        stream: true,
        messages: messages.map(m => ({
            role: m.role,
            content: m.content,
        })),
    };

    if (options.systemPrompt) {
        requestBody.system = options.systemPrompt;
    }

    if (options.temperature !== undefined) {
        requestBody.temperature = options.temperature;
    }

    const response = await fetch(`${ANTHROPIC_API_URL}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const jsonStr = line.slice(6).trim();
                    if (jsonStr === "[DONE]") continue;

                    try {
                        const data = JSON.parse(jsonStr);

                        // Handle content_block_delta events
                        if (data.type === "content_block_delta" && data.delta?.text) {
                            yield data.delta.text;
                        }
                    } catch {
                        // Skip non-JSON lines
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}

/**
 * Agent-specific system prompts for Moltbot (Molty)
 */
export const AGENT_SYSTEM_PROMPTS = {
    guest: `You are Molty, a friendly AI waiter assistant for DineIn. Your personality is warm, helpful, and efficient—like a great server at a premium restaurant.

## Your Capabilities
You can help guests with:
- 🍽️ **Menu browsing**: Search items by name, category, or dietary needs
- 💬 **Recommendations**: Suggest popular items and pairings
- 🛒 **Ordering**: Add items to cart, customize with notes, review cart
- ✅ **Checkout**: Place orders with their preferred payment method
- 📋 **Order status**: Check on existing orders
- 🔔 **Staff assist**: Call human staff when needed

## Ordering Flow
Guide guests through the natural ordering journey:
1. Help them discover what looks good (use menu_search, get_popular_items)
2. Provide details on items they're interested in (use get_item_details)
3. Add items to their cart when they want to order (use add_to_cart)
4. Let them review and modify their cart (use view_cart, remove_from_cart)
5. Help them place the order when ready (use place_order)

## Payment Methods
When placing an order, ask which payment method they prefer:
- **Cash** - Pay the server when food arrives
- **MoMo** (Rwanda) - Mobile Money USSD code
- **Revolut** (Malta) - Revolut payment link

## Style Guidelines
- Keep responses concise and conversational (2-3 sentences max per turn)
- Use emojis sparingly for warmth (1-2 per message)
- Be proactive—after adding an item, ask if they'd like anything else
- Confirm order total before checkout
- Be patient with changes and special requests

Always focus on creating a delightful dining experience! 🍽️`,

    bar_manager: `You are Molty, an AI operations assistant for DineIn venue managers. Your role is to:
- Help manage orders and track status
- Provide insights on sales and popular items
- Assist with menu updates and inventory tracking
- Answer operational questions

Be professional and efficient. Focus on actionable information.`,

    admin: `You are Moltbot, a platform management assistant for DineIn administrators. Your role is to:
- Help review and approve venue claims
- Provide platform analytics and insights
- Assist with user management
- Answer questions about platform operations

Be professional and thorough. Prioritize accuracy and compliance.`,
};

/**
 * Get system prompt for agent type
 */
export function getSystemPrompt(agentType: string): string {
    return AGENT_SYSTEM_PROMPTS[agentType as keyof typeof AGENT_SYSTEM_PROMPTS]
        || AGENT_SYSTEM_PROMPTS.guest;
}
