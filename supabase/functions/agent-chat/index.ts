import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors } from "../_lib/cors.ts";
import {
    type ChatMessage,
    type ContentBlock,
    type ToolUseBlock,
    streamClaude,
    callClaudeWithTools,
    getSystemPrompt,
} from "../_lib/anthropic.ts";
import {
    GUEST_TOOLS,
    BAR_MANAGER_TOOLS,
    executeGuestTool,
    executeBarManagerTool,
} from "../_lib/agent_tools.ts";
import {
    UI_ORCHESTRATOR_TOOLS,
    executeUIOrchestratorTool,
} from "../_lib/ui_orchestrator_tools.ts";
import {
    EXPANDED_BAR_MANAGER_TOOLS,
    executeExpandedBarManagerTool,
} from "../_lib/expanded_bar_manager_tools.ts";
import {
    ADMIN_TOOLS,
    executeAdminTool,
} from "../_lib/admin_tools.ts";
import {
    RESEARCH_TOOLS,
    executeResearchTool,
} from "../_lib/research_tools.ts";
import {
    type AgentType as PolicyAgentType,
    checkPolicy,
    generateCorrelationId,
    createAuditEntry,
} from "../_lib/policy_engine.ts";
import {
    resolveTenantContext,
    type TenantContext,
    logTenantContext,
} from "../_lib/tenant_isolation.ts";

/**
 * Agent Chat Edge Function with Tool Calling
 * 
 * Provides AI assistant chat for DineIn with three agent types:
 * - guest: AI waiter for customers (Moltbot) with menu/order tools
 * - bar_manager: Operations assistant with order management tools
 * - admin: Platform management assistant
 * 
 * Uses Anthropic Claude API with tool use for real actions.
 * Supports both SSE streaming and non-streaming responses.
 */

type AgentType = "guest" | "bar_manager" | "admin" | "ui_orchestrator" | "research_intel";

interface ChatRequest {
    messages: ChatMessage[];
    context?: {
        agent_type?: AgentType;
        venue_id?: string;
        table_no?: string;
        session_id?: string;
        user_id?: string;
    };
    stream?: boolean;
}

// ============================================================================
// DEPLOYMENT HARDENING: Rate limiting + Environment validation
// ============================================================================

// In-memory rate limiter (per edge function instance)
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per client

function checkRateLimit(clientId: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const existing = rateLimiter.get(clientId);

    if (!existing || now > existing.resetAt) {
        rateLimiter.set(clientId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
    }

    if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
        return { allowed: false, remaining: 0 };
    }

    existing.count++;
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - existing.count };
}

// Structured logger for production observability
function log(level: 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>) {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        service: 'agent-chat',
        message,
        ...data,
    };
    console[level](JSON.stringify(entry));
}

serve(async (req) => {
    // Handle CORS
    const cors = handleCors(req);
    if (cors) return cors;

    // Environment validation (fail fast)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!supabaseUrl || !supabaseKey) {
        log('error', 'Missing required environment variables', { missing: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'].filter(k => !Deno.env.get(k)) });
        return new Response(
            JSON.stringify({ error: "Service configuration error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    if (!anthropicKey) {
        log('warn', 'ANTHROPIC_API_KEY not set - AI features disabled');
        return new Response(
            JSON.stringify({ error: "AI service temporarily unavailable. Please try again later.", graceful_degradation: true }),
            { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Rate limiting
    const clientId = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "anonymous";
    const rateCheck = checkRateLimit(clientId);

    if (!rateCheck.allowed) {
        log('warn', 'Rate limit exceeded', { clientId });
        return new Response(
            JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }),
            {
                status: 429,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                    "X-RateLimit-Remaining": "0",
                    "Retry-After": "60"
                }
            }
        );
    }

    try {
        const body: ChatRequest = await req.json();
        const { messages = [], context = {}, stream = true } = body;

        // Validate agent type
        const agentType: AgentType = context.agent_type || "guest";
        const validAgentTypes: AgentType[] = ["guest", "bar_manager", "admin", "ui_orchestrator", "research_intel"];
        if (!validAgentTypes.includes(agentType)) {
            return new Response(
                JSON.stringify({ error: `Invalid agent_type. Must be one of: ${validAgentTypes.join(", ")}` }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Generate correlation ID for request tracing
        const correlationId = generateCorrelationId();

        // Validate messages
        if (!messages || messages.length === 0) {
            return new Response(
                JSON.stringify({ error: "Messages array is required and must not be empty." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Resolve tenant context for isolation and audit
        const tenantContext: TenantContext = await resolveTenantContext(req, body, supabase);

        logTenantContext('info', 'Processing chat request', tenantContext, {
            correlationId,
            agentType,
            messageCount: messages.length,
        });

        // Get user ID from auth header if not provided
        let userId = context.user_id;
        if (!userId) {
            const authHeader = req.headers.get("Authorization");
            if (authHeader?.startsWith("Bearer ")) {
                const token = authHeader.slice(7);
                try {
                    const { data: { user } } = await supabase.auth.getUser(token);
                    userId = user?.id;
                } catch {
                    // Continue without user_id
                }
            }
        }

        // Select tools based on agent type (ClaudeTool defined in agent_tools.ts)
        // deno-lint-ignore no-explicit-any
        let tools: any[];
        switch (agentType) {
            case "guest":
                tools = GUEST_TOOLS;
                break;
            case "bar_manager":
                // Combine base bar manager tools with expanded ops/drafts tools
                tools = [...BAR_MANAGER_TOOLS, ...EXPANDED_BAR_MANAGER_TOOLS];
                break;
            case "ui_orchestrator":
                tools = UI_ORCHESTRATOR_TOOLS;
                break;
            case "admin":
                tools = ADMIN_TOOLS;
                break;
            case "research_intel":
                tools = RESEARCH_TOOLS;
                break;
            default:
                tools = [];
        }

        // Build context string
        let contextString = "";
        if (agentType === "guest" && context.venue_id) {
            const { data: venue } = await supabase
                .from("venues")
                .select("id, name")
                .eq("id", context.venue_id)
                .single();
            if (venue) {
                contextString += `\n\nYou are serving at: ${venue.name}`;
                if (context.table_no) {
                    contextString += ` (Table ${context.table_no})`;
                }
            }
        } else if (agentType === "bar_manager" && context.venue_id) {
            const { data: venue } = await supabase
                .from("venues")
                .select("id, name")
                .eq("id", context.venue_id)
                .single();
            if (venue) {
                contextString += `\n\nManaging venue: ${venue.name}`;
            }
        }

        // Add tool use instructions to system prompt
        let toolInstructions = "";
        if (tools.length > 0) {
            toolInstructions = `

You have access to tools to help you accomplish tasks. Use them when appropriate:
- Use menu_search when guests ask about food/drinks, recommendations, or dietary options
- Use get_item_details when they want more info about a specific item
- Use check_order_status when they ask about their order
- Use call_staff when they need human assistance you cannot provide

Always search the menu before making recommendations. Be accurate about prices and availability.`;
        }

        const systemPrompt = getSystemPrompt(agentType) + contextString + toolInstructions;

        // Handle streaming vs non-streaming
        if (stream && tools.length === 0) {
            // Simple streaming for admin (no tools)
            return handleStreamingResponse(messages, systemPrompt, context.session_id, agentType, supabase);
        }

        // Tool-calling flow (non-streaming for now to handle agentic loop)
        const toolContext = {
            venue_id: context.venue_id,
            table_no: context.table_no,
            user_id: userId,
        };

        // Convert messages to Claude format
        let conversationMessages: Array<{ role: string; content: string | ContentBlock[] }> =
            messages.map(m => ({ role: m.role, content: m.content }));

        // Agentic loop - keep calling Claude until no more tool calls
        let maxIterations = 5;
        let finalTextResponse = "";
        const toolResults: Array<{ tool: string; result: unknown }> = [];

        // Token tracking for cost monitoring
        let totalInputTokens = 0;
        let totalOutputTokens = 0;

        while (maxIterations > 0) {
            maxIterations--;

            const response = await callClaudeWithTools(
                conversationMessages,
                tools,
                { systemPrompt, maxTokens: 2048, temperature: 0.7 }
            );

            // Track token usage
            if (response.usage) {
                totalInputTokens += response.usage.input_tokens;
                totalOutputTokens += response.usage.output_tokens;
            }

            // Check if Claude wants to use tools
            const toolCalls = response.content.filter((b): b is ToolUseBlock => b.type === "tool_use");
            const textBlocks = response.content.filter((b): b is { type: "text"; text: string } => b.type === "text");

            // Collect any text responses
            for (const block of textBlocks) {
                finalTextResponse += block.text;
            }

            // If no tool calls, we're done
            if (response.stop_reason !== "tool_use" || toolCalls.length === 0) {
                break;
            }

            // Add assistant response with tool calls
            conversationMessages.push({
                role: "assistant",
                content: response.content,
            });

            // Build tool_result blocks for Claude (must be in "user" role)
            const toolResultBlocks: Array<{ type: "tool_result"; tool_use_id: string; content: string }> = [];

            for (const toolCall of toolCalls) {
                // Policy check: verify agent is allowed to use this tool
                const policyCheck = checkPolicy(agentType as PolicyAgentType, toolCall.name);

                if (!policyCheck.allowed) {
                    log('warn', 'Policy denied tool access', {
                        correlationId,
                        agentType,
                        toolName: toolCall.name,
                        reason: policyCheck.reason,
                    });

                    toolResults.push({
                        tool: toolCall.name,
                        result: { success: false, error: `Access denied: ${policyCheck.reason}` },
                    });

                    toolResultBlocks.push({
                        type: "tool_result",
                        tool_use_id: toolCall.id,
                        content: JSON.stringify({ success: false, error: "This tool is not available for your agent type." }),
                    });
                    continue;
                }

                log('info', `Executing tool: ${toolCall.name}`, { correlationId, agentType });

                let result;
                if (agentType === "guest") {
                    result = await executeGuestTool(toolCall.name, toolCall.input, toolContext, supabase);
                } else if (agentType === "bar_manager") {
                    // Try expanded tools first, then base tools
                    const expandedToolNames = EXPANDED_BAR_MANAGER_TOOLS.map(t => t.name);
                    if (expandedToolNames.includes(toolCall.name)) {
                        result = await executeExpandedBarManagerTool(toolCall.name, toolCall.input, toolContext, supabase);
                    } else {
                        result = await executeBarManagerTool(toolCall.name, toolCall.input, toolContext, supabase);
                    }
                } else if (agentType === "ui_orchestrator") {
                    result = await executeUIOrchestratorTool(
                        toolCall.name,
                        toolCall.input,
                        { ...toolContext, correlation_id: correlationId },
                        supabase
                    );
                } else if (agentType === "admin") {
                    result = await executeAdminTool(
                        toolCall.name,
                        toolCall.input,
                        { user_id: userId, correlation_id: correlationId },
                        supabase
                    );
                } else if (agentType === "research_intel") {
                    result = await executeResearchTool(
                        toolCall.name,
                        toolCall.input,
                        supabase
                    );
                } else {
                    result = { success: false, error: "No tools available for this agent type" };
                }

                toolResults.push({ tool: toolCall.name, result });

                // Add proper tool_result block with tool_use_id
                toolResultBlocks.push({
                    type: "tool_result",
                    tool_use_id: toolCall.id,
                    content: JSON.stringify(result),
                });

                // Log action for analytics with tenant context + correlation ID
                if (context.session_id) {
                    // Calculate cost estimate (Claude Sonnet 3.5 pricing: $3/M input, $15/M output)
                    const costEstimate = (totalInputTokens * 0.000003) + (totalOutputTokens * 0.000015);

                    await supabase.from("agent_actions").insert({
                        session_id: context.session_id,
                        correlation_id: correlationId,
                        tenant_id: tenantContext.tenantId,
                        venue_id: tenantContext.venueId,
                        user_id: tenantContext.userId,
                        agent_type: agentType,
                        action_type: `tool_${toolCall.name}`,
                        action_data: {
                            input: toolCall.input,
                            result: result.success,
                        },
                        success: result.success,
                        error_message: result.error,
                        input_tokens: totalInputTokens,
                        output_tokens: totalOutputTokens,
                        cost_estimate: costEstimate,
                    }).catch(() => { /* Non-blocking */ });
                }
            }

            // Add tool results as user message with tool_result blocks
            conversationMessages.push({
                role: "user",
                content: toolResultBlocks as unknown as ContentBlock[],
            });
        }

        // If we exhausted iterations or just have tool results, get final response
        if (!finalTextResponse && toolResults.length > 0) {
            // Ask Claude for a final response summarizing the tool results
            conversationMessages.push({
                role: "user",
                content: "Please provide a helpful response based on the tool results above.",
            });

            const finalResponse = await callClaudeWithTools(
                conversationMessages,
                [], // No tools for final response
                { systemPrompt, maxTokens: 2048, temperature: 0.7 }
            );

            // Track final response tokens
            if (finalResponse.usage) {
                totalInputTokens += finalResponse.usage.input_tokens;
                totalOutputTokens += finalResponse.usage.output_tokens;
            }

            for (const block of finalResponse.content) {
                if (block.type === "text") {
                    finalTextResponse += block.text;
                }
            }
        }

        // Calculate final cost estimate (Claude Sonnet 3.5 pricing: $3/M input, $15/M output)
        const totalCostEstimate = (totalInputTokens * 0.000003) + (totalOutputTokens * 0.000015);

        // Log chat action with token usage and tenant context
        if (context.session_id) {
            await supabase.from("agent_actions").insert({
                session_id: context.session_id,
                correlation_id: correlationId,
                tenant_id: tenantContext.tenantId,
                venue_id: tenantContext.venueId,
                user_id: tenantContext.userId,
                agent_type: agentType,
                action_type: "chat_response",
                action_data: {
                    agent_type: agentType,
                    response_length: finalTextResponse.length,
                    tools_used: toolResults.map(t => t.tool),
                },
                input_tokens: totalInputTokens,
                output_tokens: totalOutputTokens,
                cost_estimate: totalCostEstimate,
            }).catch(() => { /* Non-blocking */ });
        }

        return new Response(
            JSON.stringify({
                content: finalTextResponse,
                tools_used: toolResults.map(t => ({ tool: t.tool, success: (t.result as { success: boolean }).success })),
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );


    } catch (error) {
        console.error("Agent chat error:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});

// Helper function for streaming response (no tools)
async function handleStreamingResponse(
    messages: ChatMessage[],
    systemPrompt: string,
    sessionId: string | undefined,
    agentType: string,
    supabase: ReturnType<typeof createClient>
): Promise<Response> {
    const encoder = new TextEncoder();
    const runId = "run_" + crypto.randomUUID();
    const msgId = "msg_" + crypto.randomUUID();

    const sseStream = new ReadableStream({
        async start(controller) {
            const sendEvent = (event: string, data: unknown) => {
                const payload = JSON.stringify(data);
                controller.enqueue(encoder.encode(`event: ${event}\ndata: ${payload}\n\n`));
            };

            sendEvent("thread.message.created", {
                id: msgId,
                thread_id: sessionId || "thread_" + crypto.randomUUID(),
                role: "assistant",
                content: [],
                created_at: new Date().toISOString(),
            });

            let fullText = "";

            try {
                for await (const chunk of streamClaude(messages, {
                    systemPrompt,
                    maxTokens: 2048,
                    temperature: 0.7,
                })) {
                    fullText += chunk;
                    sendEvent("thread.message.delta", {
                        id: msgId,
                        delta: {
                            content: [{ index: 0, type: "text", text: chunk }],
                        },
                    });
                }

                sendEvent("thread.message.completed", {
                    id: msgId,
                    role: "assistant",
                    content: [{ type: "text", text: fullText }],
                });

                sendEvent("thread.run.completed", {
                    id: runId,
                    status: "completed",
                });

                if (sessionId) {
                    await supabase.from("agent_actions").insert({
                        session_id: sessionId,
                        action_type: "chat_response",
                        action_data: {
                            agent_type: agentType,
                            response_length: fullText.length,
                        },
                    }).catch(() => { /* Non-blocking */ });
                }
            } catch (error) {
                console.error("Claude stream error:", error);
                sendEvent("thread.run.failed", {
                    id: runId,
                    status: "failed",
                    last_error: {
                        code: "model_error",
                        message: error instanceof Error ? error.message : "Unknown error",
                    },
                });
            } finally {
                controller.close();
            }
        },
    });

    return new Response(sseStream, {
        headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
