/**
 * Channel Adapters
 * 
 * Transforms incoming messages from various platforms into a unified format
 * and outgoing responses back to platform-specific formats.
 */

// =============================================================================
// UNIFIED MESSAGE TYPES
// =============================================================================

export interface UnifiedIncomingMessage {
    channel: "whatsapp" | "telegram" | "slack" | "webhook";
    sender_id: string;
    sender_name?: string;
    message: string;
    venue_slug?: string;
    table_no?: string;
    metadata?: Record<string, unknown>;
    timestamp: string;
}

export interface UnifiedOutgoingMessage {
    channel: "whatsapp" | "telegram" | "slack" | "webhook";
    recipient_id: string;
    message: string;
    metadata?: Record<string, unknown>;
}

// =============================================================================
// WHATSAPP ADAPTER (Baileys / Cloud API format)
// =============================================================================

export interface WhatsAppWebhookPayload {
    // WhatsApp Cloud API format
    object?: "whatsapp_business_account";
    entry?: Array<{
        id: string;
        changes: Array<{
            value: {
                messaging_product: "whatsapp";
                metadata: { phone_number_id: string };
                messages?: Array<{
                    from: string;
                    id: string;
                    timestamp: string;
                    type: "text" | "image" | "document";
                    text?: { body: string };
                }>;
            };
        }>;
    }>;
    // Baileys / simple format
    from?: string;
    message?: string;
    venue?: string;
    table?: string;
}

export function parseWhatsAppMessage(payload: WhatsAppWebhookPayload): UnifiedIncomingMessage | null {
    // Handle WhatsApp Cloud API format
    if (payload.object === "whatsapp_business_account" && payload.entry) {
        const entry = payload.entry[0];
        const change = entry?.changes?.[0];
        const message = change?.value?.messages?.[0];

        if (!message || message.type !== "text" || !message.text?.body) {
            return null; // Only handle text messages
        }

        // Extract venue slug from message if present (e.g., "Hi from venue-slug")
        const venueMatch = message.text.body.match(/from\s+(\S+)/i);

        return {
            channel: "whatsapp",
            sender_id: message.from,
            message: message.text.body,
            venue_slug: venueMatch?.[1],
            timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
        };
    }

    // Handle simple/Baileys format
    if (payload.from && payload.message) {
        return {
            channel: "whatsapp",
            sender_id: payload.from,
            message: payload.message,
            venue_slug: payload.venue,
            table_no: payload.table,
            timestamp: new Date().toISOString(),
        };
    }

    return null;
}

export function formatWhatsAppResponse(message: UnifiedOutgoingMessage): object {
    // WhatsApp Cloud API format
    return {
        messaging_product: "whatsapp",
        to: message.recipient_id,
        type: "text",
        text: {
            body: message.message,
        },
    };
}

// =============================================================================
// TELEGRAM ADAPTER
// =============================================================================

export interface TelegramWebhookPayload {
    update_id: number;
    message?: {
        message_id: number;
        from: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
        };
        chat: {
            id: number;
            type: "private" | "group" | "supergroup";
        };
        date: number;
        text?: string;
    };
}

export function parseTelegramMessage(payload: TelegramWebhookPayload): UnifiedIncomingMessage | null {
    const msg = payload.message;
    if (!msg || !msg.text) {
        return null;
    }

    // Extract venue from /start command (e.g., /start venue-slug)
    let venueSlug: string | undefined;
    let text = msg.text;

    if (text.startsWith("/start ")) {
        venueSlug = text.substring(7).trim();
        text = `Hi! I'm at ${venueSlug}`;
    }

    return {
        channel: "telegram",
        sender_id: msg.from.id.toString(),
        sender_name: [msg.from.first_name, msg.from.last_name].filter(Boolean).join(" "),
        message: text,
        venue_slug: venueSlug,
        timestamp: new Date(msg.date * 1000).toISOString(),
        metadata: {
            chat_id: msg.chat.id,
            username: msg.from.username,
        },
    };
}

export function formatTelegramResponse(message: UnifiedOutgoingMessage): object {
    const chatId = (message.metadata?.chat_id as number) || parseInt(message.recipient_id);

    return {
        method: "sendMessage",
        chat_id: chatId,
        text: message.message,
        parse_mode: "Markdown",
    };
}

// =============================================================================
// SLACK ADAPTER (for venue managers)
// =============================================================================

export interface SlackWebhookPayload {
    type: "url_verification" | "event_callback";
    challenge?: string; // For URL verification
    event?: {
        type: "message" | "app_mention";
        user: string;
        text: string;
        channel: string;
        ts: string;
    };
    team_id?: string;
}

export function parseSlackMessage(payload: SlackWebhookPayload): UnifiedIncomingMessage | null {
    // Handle URL verification
    if (payload.type === "url_verification") {
        return null; // Handled separately
    }

    const event = payload.event;
    if (!event || (event.type !== "message" && event.type !== "app_mention")) {
        return null;
    }

    // Remove bot mention from text
    const text = event.text.replace(/<@[A-Z0-9]+>/g, "").trim();

    return {
        channel: "slack",
        sender_id: event.user,
        message: text,
        timestamp: new Date(parseFloat(event.ts) * 1000).toISOString(),
        metadata: {
            channel_id: event.channel,
            team_id: payload.team_id,
        },
    };
}

export function formatSlackResponse(message: UnifiedOutgoingMessage): object {
    const channelId = (message.metadata?.channel_id as string) || message.recipient_id;

    return {
        channel: channelId,
        text: message.message,
        mrkdwn: true,
    };
}

// =============================================================================
// GENERIC WEBHOOK ADAPTER
// =============================================================================

export interface GenericWebhookPayload {
    sender_id: string;
    message: string;
    venue_slug?: string;
    table_no?: string;
    sender_name?: string;
}

export function parseGenericWebhook(payload: GenericWebhookPayload): UnifiedIncomingMessage {
    return {
        channel: "webhook",
        sender_id: payload.sender_id,
        sender_name: payload.sender_name,
        message: payload.message,
        venue_slug: payload.venue_slug,
        table_no: payload.table_no,
        timestamp: new Date().toISOString(),
    };
}
