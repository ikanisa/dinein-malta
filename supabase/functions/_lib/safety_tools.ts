/**
 * Safety & Abuse Tools
 * 
 * - Check message content for abuse/profanity
 * - Rate limiting checks (if not middleware)
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { type ToolResult } from "./agent_tools.ts";

// Simple local blocklist for MVP
const BLOCKED_WORDS = ["ignore previous instructions", "system prompt", "delete database", "drop table"];

export async function checkAbuse(
    input: { text: string; source?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    const { text } = input;

    // 1. Static check
    const lower = text.toLowerCase();
    const matches = BLOCKED_WORDS.filter(w => lower.includes(w));

    if (matches.length > 0) {
        return {
            success: false, // Flagged
            data: {
                flagged: true,
                reason: "policy_violation",
                matches
            }
        };
    }

    // 2. (Optional) Log to telemetry if suspicious but allowed? 
    // For now simple pass.

    return {
        success: true,
        data: {
            flagged: false,
            score: 0
        }
    };
}
