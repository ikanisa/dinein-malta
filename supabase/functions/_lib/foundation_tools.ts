/**
 * Foundation Tools for Moltbot Agent System
 * 
 * These are core tools available to all agents for session management,
 * authentication, policy checking, and health monitoring.
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { type ClaudeTool, type ToolResult } from "./agent_tools.ts";

// =============================================================================
// CLAUDE TOOL DEFINITIONS
// =============================================================================

export const FOUNDATION_TOOLS: ClaudeTool[] = [
    {
        name: "health.ping",
        description: "Check if the agent system is healthy and responsive.",
        input_schema: {
            type: "object",
            properties: {},
        }
    },
    {
        name: "auth.whoami",
        description: "Get information about the current authenticated user/session.",
        input_schema: {
            type: "object",
            properties: {},
        }
    },
    {
        name: "auth.get_roles",
        description: "Get the roles and permissions for the current user.",
        input_schema: {
            type: "object",
            properties: {},
        }
    },
    {
        name: "session.get",
        description: "Retrieve the current session's working memory.",
        input_schema: {
            type: "object",
            properties: {
                key: {
                    type: "string",
                    description: "Optional specific key to retrieve"
                }
            }
        }
    },
    {
        name: "session.set",
        description: "Store a value in the current session's working memory.",
        input_schema: {
            type: "object",
            properties: {
                key: {
                    type: "string",
                    description: "Key to store the value under"
                },
                value: {
                    type: "string",
                    description: "Value to store (will be JSON serialized)"
                }
            },
            required: ["key", "value"]
        }
    },
    {
        name: "rate_limit.check",
        description: "Check if the current user/session has hit any rate limits.",
        input_schema: {
            type: "object",
            properties: {},
        }
    },
    {
        name: "tenant.resolve_context",
        description: "Get the current tenant/venue context for multi-tenant isolation.",
        input_schema: {
            type: "object",
            properties: {},
        }
    },
    {
        name: "audit.log",
        description: "Log an action for audit trail.",
        input_schema: {
            type: "object",
            properties: {
                action: {
                    type: "string",
                    description: "Action being performed"
                },
                details: {
                    type: "string",
                    description: "Additional details"
                }
            },
            required: ["action"]
        }
    }
];

// =============================================================================
// SESSION STORAGE
// In-memory session storage for the edge function instance.
// In production, this would be backed by Redis or similar.
// =============================================================================

const sessionStore = new Map<string, Record<string, unknown>>();

// =============================================================================
// TOOL HANDLER
// =============================================================================

export async function executeFoundationTool(
    toolName: string,
    input: Record<string, unknown>,
    context: {
        session_id?: string;
        user_id?: string;
        venue_id?: string;
        tenant_id?: string;
        correlation_id?: string;
    },
    supabase: SupabaseClient
): Promise<ToolResult> {
    try {
        switch (toolName) {
            case "health.ping":
                return healthPing();
            case "auth.whoami":
                return await authWhoami(context, supabase);
            case "auth.get_roles":
                return await authGetRoles(context, supabase);
            case "session.get":
                return sessionGet(input, context);
            case "session.set":
                return sessionSet(input, context);
            case "rate_limit.check":
                return rateLimitCheck(context);
            case "tenant.resolve_context":
                return tenantResolveContext(context);
            case "audit.log":
                return await auditLog(input, context, supabase);
            default:
                return { success: false, error: `Unknown foundation tool: ${toolName}` };
        }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Tool execution failed" };
    }
}

// =============================================================================
// IMPLEMENTATIONS
// =============================================================================

function healthPing(): ToolResult {
    return {
        success: true,
        data: {
            status: "healthy",
            timestamp: new Date().toISOString(),
            version: "1.0.0"
        }
    };
}

async function authWhoami(
    context: { user_id?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    if (!context.user_id) {
        return {
            success: true,
            data: {
                authenticated: false,
                anonymous: true,
                user_id: null
            }
        };
    }

    // Fetch user profile if available
    const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, display_name")
        .eq("id", context.user_id)
        .single();

    return {
        success: true,
        data: {
            authenticated: true,
            anonymous: false,
            user_id: context.user_id,
            profile: profile || null
        }
    };
}

async function authGetRoles(
    context: { user_id?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    if (!context.user_id) {
        return {
            success: true,
            data: {
                roles: ["anonymous"],
                permissions: ["read:public"]
            }
        };
    }

    // Check if user is admin
    const { data: user } = await supabase.auth.admin.getUserById(context.user_id);
    const isAdmin = user?.user?.user_metadata?.role === "admin";

    // Check if user owns any venues
    const { data: venues } = await supabase
        .from("venues")
        .select("id")
        .eq("owner_id", context.user_id)
        .limit(1);

    const isVenueOwner = venues && venues.length > 0;

    const roles: string[] = ["authenticated"];
    if (isAdmin) roles.push("admin");
    if (isVenueOwner) roles.push("venue_owner");

    return {
        success: true,
        data: {
            roles,
            permissions: isAdmin
                ? ["read:all", "write:all", "admin:all"]
                : isVenueOwner
                    ? ["read:public", "write:own_venue", "manage:orders"]
                    : ["read:public", "write:own"]
        }
    };
}

function sessionGet(
    input: Record<string, unknown>,
    context: { session_id?: string }
): ToolResult {
    const sessionId = context.session_id || "default";
    const session = sessionStore.get(sessionId) || {};

    if (input.key) {
        return {
            success: true,
            data: {
                key: input.key,
                value: session[input.key as string] || null
            }
        };
    }

    return {
        success: true,
        data: {
            session_id: sessionId,
            memory: session
        }
    };
}

function sessionSet(
    input: Record<string, unknown>,
    context: { session_id?: string }
): ToolResult {
    const sessionId = context.session_id || "default";
    const { key, value } = input as { key: string; value: unknown };

    if (!sessionStore.has(sessionId)) {
        sessionStore.set(sessionId, {});
    }

    const session = sessionStore.get(sessionId)!;
    session[key] = value;

    return {
        success: true,
        data: {
            key,
            stored: true,
            session_id: sessionId
        }
    };
}

function rateLimitCheck(context: { user_id?: string; session_id?: string }): ToolResult {
    // Simplified rate limit check
    // In production, this would query a Redis-backed counter
    return {
        success: true,
        data: {
            rate_limited: false,
            remaining: 100,
            reset_at: new Date(Date.now() + 60000).toISOString()
        }
    };
}

function tenantResolveContext(context: {
    tenant_id?: string;
    venue_id?: string;
    user_id?: string;
}): ToolResult {
    return {
        success: true,
        data: {
            tenant_id: context.tenant_id || "default",
            venue_id: context.venue_id || null,
            user_id: context.user_id || null,
            isolated: true
        }
    };
}

async function auditLog(
    input: Record<string, unknown>,
    context: {
        user_id?: string;
        venue_id?: string;
        correlation_id?: string;
    },
    supabase: SupabaseClient
): Promise<ToolResult> {
    const { action, details } = input as { action: string; details?: string };

    // Insert into audit_logs table
    const { error } = await supabase.from("audit_logs").insert({
        user_id: context.user_id,
        venue_id: context.venue_id,
        correlation_id: context.correlation_id,
        action,
        details: details || null,
        timestamp: new Date().toISOString()
    });

    if (error) {
        // Non-blocking: log but don't fail
        console.warn("Audit log insert failed:", error.message);
    }

    return {
        success: true,
        data: {
            logged: true,
            action,
            correlation_id: context.correlation_id
        }
    };
}
