import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from "../_lib/cors.ts";

// Types matching ChatKit protocol expectations (simplified)
interface ThreadMetadata {
    id: string;
    [key: string]: unknown;
}

interface ChatKitRequest {
    messsages?: unknown[];
    action?: unknown;
}

serve(async (req) => {
    // Handle CORS
    const cors = handleCors(req);
    if (cors) return cors;

    try {
        // Parse body just to validate, even if we mock response
        const _body = await req.json();

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                // Helper to send SSE event
                const sendEvent = (event: string, data: unknown) => {
                    // Format usually: event: type\ndata: json\n\n
                    // But ChatKit often uses just data with a type field inside, or specific event names.
                    // Based on user docs: "stream_agent_response ... yields events".
                    // We will use standard SSE format.
                    const payload = JSON.stringify(data);
                    controller.enqueue(encoder.encode(`event: ${event}\ndata: ${payload}\n\n`));
                };

                // 1. Start Run
                const runId = "run_" + crypto.randomUUID();
                const msgId = "msg_" + crypto.randomUUID();

                // 2. Stream a text response (Mock)
                const responseText = "Hello! I am your Waiter AI. I can help you browse the menu or track your order. 🍽️";

                // Initial event to signal message start
                sendEvent("thread.message.created", {
                    id: msgId,
                    thread_id: "thread_mock",
                    role: "assistant",
                    content: [],
                    created_at: new Date().toISOString()
                });

                // Stream chunks
                const chunks = responseText.match(/.{1,5}/g) || [];
                for (const chunk of chunks) {
                    sendEvent("thread.message.delta", {
                        id: msgId,
                        delta: {
                            content: [{ index: 0, type: "text", text: chunk }]
                        }
                    });
                    await new Promise((r) => setTimeout(r, 100)); // Simulate typing
                }

                // 3. Send a Widget (Menu Preview)
                // This validates "Implement Custom Widgets" capability
                const widgetId = "widget_" + crypto.randomUUID();
                sendEvent("thread.item.created", {
                    item: {
                        id: widgetId,
                        type: "tool_call", // Or custom type for ChatKit widgets?
                        // ChatKit widgets are often embedded in messages or sent as specific items
                        // User docs say: "The respond method can return ... widgets"
                        // JSON representation of widget:
                        details: {
                            type: "Card",
                            props: {
                                children: [
                                    { type: "Title", props: { value: "Recommended for You" } },
                                    { type: "Text", props: { value: "Try our signature Pasta!" } },
                                    {
                                        type: "Button",
                                        props: {
                                            label: "View Menu",
                                            onClickAction: { type: "view_menu", payload: {} }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                });

                // 4. Complete
                sendEvent("thread.run.completed", {
                    id: runId,
                    status: "completed"
                });

                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                ...corsHeaders,
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });

    } catch (error) {
        console.error("Agent Chat Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
