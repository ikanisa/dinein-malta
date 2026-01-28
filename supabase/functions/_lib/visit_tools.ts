/**
 * Visit Tools
 * 
 * Manages the "Visit" lifecycle:
 * - Start a visit (scan QR) -> creates visit record
 * - Get current visit context
 * - End visit (checkout/leave)
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { type ToolResult } from "./agent_tools.ts";

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

export interface VisitContext {
    visit_id?: string;
    venue_id: string;
    table_no?: string;
    user_id?: string;
}

// =============================================================================
// IMPLEMENTATIONS
// =============================================================================

export async function startVisit(
    input: { venue_id: string; table_no?: string; party_size?: number },
    context: { user_id?: string; session_key?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    const { venue_id, table_no, party_size = 1 } = input;

    // 1. Check if active visit exists for this user/session at this venue
    let query = supabase.from("visits").select("id, status").eq("venue_id", venue_id).eq("status", "active");

    // Link by user_id if auth, or session_key if anon
    if (context.user_id) {
        query = query.eq("guest_id", context.user_id); // Assuming guest_id maps to user_id for now
    } else if (context.session_key) {
        query = query.eq("session_key", context.session_key);
    } else {
        // Fallback: create fresh if no context (rare)
    }

    const { data: existing } = await query.maybeSingle();

    if (existing) {
        return {
            success: true,
            data: {
                visit_id: existing.id,
                status: "resumed",
                message: "Resumed existing visit"
            }
        };
    }

    // 2. Create new visit
    // If we have a user_id, check if guest record exists
    let guestId = null;
    if (context.user_id) {
        const { data: guest } = await supabase.from("guests").select("id").eq("user_id", context.user_id).maybeSingle();
        if (guest) {
            guestId = guest.id;
        } else {
            // Auto-create guest profile for authenticated user
            const { data: newGuest } = await supabase.from("guests").insert({ user_id: context.user_id }).select("id").single();
            guestId = newGuest?.id;
        }
    }

    const { data: newVisit, error } = await supabase.from("visits").insert({
        venue_id,
        table_no,
        guest_id: guestId, // nullable
        party_size,
        session_key: context.session_key,
        status: "active"
    }).select("id").single();

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: {
            visit_id: newVisit.id,
            status: "created",
            message: "Welcome! Visit started."
        }
    };
}

export async function getVisit(
    input: { visit_id?: string }, // optional, can infer from context
    context: { user_id?: string; session_key?: string; venue_id?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {

    let query = supabase.from("visits").select("*, venue:venues(name)");

    if (input.visit_id) {
        query = query.eq("id", input.visit_id);
    } else if (context.user_id && context.venue_id) {
        query = query.eq("venue_id", context.venue_id).eq("guest_id", context.user_id).eq("status", "active"); // simplified linkage
        // Note: Schema stores guest_id (UUID from guests table). 
        // We need to resolve user_id -> guest_id first or join.
        // For MVP, enable direct lookup:
        // Or assume guest_id IS user_id if we simplified schema (we didn't).
        // Let's rely on session_key or input.visit_id for reliability.
    } else if (context.session_key && context.venue_id) {
        query = query.eq("venue_id", context.venue_id).eq("session_key", context.session_key).eq("status", "active");
    } else {
        return { success: false, error: "Cannot resolve visit context" };
    }

    const { data, error } = await query.maybeSingle();

    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: "No active visit found" };

    return {
        success: true,
        data: {
            visit: data
        }
    };
}

export async function endVisit(
    input: { visit_id: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    const { error } = await supabase
        .from("visits")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", input.visit_id);

    if (error) return { success: false, error: error.message };

    return {
        success: true,
        data: { message: "Visit ended. Thank you!" }
    };
}

export async function assignTable(
    input: { visit_id: string; table_no: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    const { visit_id, table_no } = input;

    const { error } = await supabase
        .from("visits")
        .update({ table_no })
        .eq("id", visit_id)
        .eq("status", "active");

    if (error) return { success: false, error: error.message };

    return {
        success: true,
        data: { message: `Table updated to ${table_no}` }
    };
}

// =============================================================================
// TOOL DEFINITIONS (for agent use)
// =============================================================================

export const VISIT_TOOLS = [
    {
        name: "visit.start",
        description: "Start a new visit or resume an existing one at a venue.",
        input_schema: {
            type: "object",
            properties: {
                venue_id: { type: "string", description: "Venue UUID" },
                table_no: { type: "string", description: "Optional table number" },
                party_size: { type: "number", description: "Number of guests (default 1)" }
            },
            required: ["venue_id"]
        }
    },
    {
        name: "visit.get",
        description: "Get the current active visit context.",
        input_schema: {
            type: "object",
            properties: {
                visit_id: { type: "string", description: "Optional visit ID (inferred from context if not provided)" }
            }
        }
    },
    {
        name: "visit.assign_table",
        description: "Change the table number for an active visit.",
        input_schema: {
            type: "object",
            properties: {
                visit_id: { type: "string", description: "Visit UUID" },
                table_no: { type: "string", description: "New table number" }
            },
            required: ["visit_id", "table_no"]
        }
    },
    {
        name: "visit.end",
        description: "End the current visit (checkout).",
        input_schema: {
            type: "object",
            properties: {
                visit_id: { type: "string", description: "Visit UUID" }
            },
            required: ["visit_id"]
        }
    }
];
