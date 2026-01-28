/**
 * Channel Webhook Edge Function
 * 
 * Receives messages from external channels (WhatsApp, Telegram, etc.)
 * and routes them to the agent-chat function for AI processing.
 * 
 * This is the multi-channel gateway for Moltbot integration.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import {
    parseWhatsAppMessage,
    parseTelegramMessage,
    parseSlackMessage,
    parseGenericWebhook,
    type UnifiedIncomingMessage,
    type WhatsAppWebhookPayload,
    type TelegramWebhookPayload,
    type SlackWebhookPayload,
    type GenericWebhookPayload,
} from "../_lib/channel_adapters.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/**
 * Channel types supported
 */
type ChannelType = "whatsapp" | "telegram" | "slack" | "webhook";

/**
 * Incoming message from external channel
 */
interface ChannelMessage {
    channel: ChannelType;
    sender_id: string;
    sender_name?: string;
    message: string;
    venue_slug?: string;
    table_no?: string;
    metadata?: Record<string, unknown>;
    timestamp?: string;
}

/**
 * Session tracking for channel users
 */
interface ChannelSession {
    id: string;
    channel: ChannelType;
    sender_id: string;
    venue_id: string | null;
    agent_type: "guest" | "bar_manager";
    message_history: Array<{ role: string; content: string }>;
    created_at: string;
    updated_at: string;
}

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Parse incoming message
        const body = await req.json() as ChannelMessage;

        // Validate required fields
        if (!body.channel || !body.sender_id || !body.message) {
            return new Response(
                JSON.stringify({ error: "Missing required fields: channel, sender_id, message" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`[channel-webhook] Received from ${body.channel}:${body.sender_id}: ${body.message.substring(0, 50)}...`);

        // Resolve venue from slug if provided
        let venueId: string | null = null;
        let agentType: "guest" | "bar_manager" = "guest";

        if (body.venue_slug) {
            const { data: venue } = await supabase
                .from("vendors")
                .select("id")
                .eq("slug", body.venue_slug)
                .single();

            if (venue) {
                venueId = venue.id;
            }
        }

        // Get or create channel session
        const sessionId = `${body.channel}_${body.sender_id}`;
        let session = await getChannelSession(supabase, sessionId);

        if (!session) {
            session = await createChannelSession(supabase, {
                id: sessionId,
                channel: body.channel,
                sender_id: body.sender_id,
                venue_id: venueId,
                agent_type: agentType,
                message_history: [],
            });
        } else if (venueId && !session.venue_id) {
            // Update session with venue if newly provided
            await updateChannelSession(supabase, sessionId, { venue_id: venueId });
            session.venue_id = venueId;
        }

        // Add user message to history
        const messages = [
            ...session.message_history,
            { role: "user", content: body.message }
        ];

        // Call agent-chat function internally
        const agentResponse = await fetch(`${SUPABASE_URL}/functions/v1/agent-chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
                messages: messages,
                context: {
                    agent_type: session.agent_type,
                    venue_id: session.venue_id,
                    table_no: body.table_no,
                    channel: body.channel,
                    sender_id: body.sender_id,
                },
                stream: false, // Don't stream for webhook responses
            }),
        });

        if (!agentResponse.ok) {
            const errorText = await agentResponse.text();
            console.error(`[channel-webhook] agent-chat error: ${errorText}`);
            throw new Error(`Agent chat failed: ${agentResponse.status}`);
        }

        const agentResult = await agentResponse.json();
        const assistantContent = agentResult.content || "Sorry, I couldn't process that request.";

        // Update session with new messages
        await updateChannelSession(supabase, sessionId, {
            message_history: [
                ...messages,
                { role: "assistant", content: assistantContent }
            ].slice(-20), // Keep last 20 messages for context
        });

        // Log the interaction
        await logChannelInteraction(supabase, {
            session_id: sessionId,
            channel: body.channel,
            sender_id: body.sender_id,
            venue_id: session.venue_id,
            user_message: body.message,
            assistant_response: assistantContent,
        });

        // Return response in channel-agnostic format
        return new Response(
            JSON.stringify({
                success: true,
                response: assistantContent,
                session_id: sessionId,
                venue_id: session.venue_id,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("[channel-webhook] Error:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Internal error"
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

async function getChannelSession(
    supabase: ReturnType<typeof createClient>,
    sessionId: string
): Promise<ChannelSession | null> {
    const { data } = await supabase
        .from("channel_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
    return data;
}

async function createChannelSession(
    supabase: ReturnType<typeof createClient>,
    session: Omit<ChannelSession, "created_at" | "updated_at">
): Promise<ChannelSession> {
    const { data, error } = await supabase
        .from("channel_sessions")
        .insert({
            ...session,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error("[channel-webhook] Failed to create session:", error);
        // Return a temporary session if DB fails
        return {
            ...session,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as ChannelSession;
    }
    return data;
}

async function updateChannelSession(
    supabase: ReturnType<typeof createClient>,
    sessionId: string,
    updates: Partial<ChannelSession>
): Promise<void> {
    await supabase
        .from("channel_sessions")
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);
}

async function logChannelInteraction(
    supabase: ReturnType<typeof createClient>,
    data: {
        session_id: string;
        channel: ChannelType;
        sender_id: string;
        venue_id: string | null;
        user_message: string;
        assistant_response: string;
    }
): Promise<void> {
    await supabase.from("channel_interactions").insert({
        session_id: data.session_id,
        channel: data.channel,
        sender_id: data.sender_id,
        venue_id: data.venue_id,
        user_message: data.user_message,
        assistant_response: data.assistant_response,
        created_at: new Date().toISOString(),
    });
}
