/**
 * Admin Tools for Moltbot Platform Admin Agent
 * 
 * These tools provide platform operations, support, and approval resolution
 * capabilities for the admin agent. All high-impact actions require explicit
 * confirmation or create audit trails.
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { type ClaudeTool } from "./agent_tools.ts";

// =============================================================================
// ADMIN TOOL DEFINITIONS
// =============================================================================

export const ADMIN_TOOLS: ClaudeTool[] = [
    // --- Platform Operations ---
    {
        name: "platform_venue_list",
        description: "List all venues with status filtering for admin oversight.",
        input_schema: {
            type: "object" as const,
            properties: {
                status: {
                    type: "string",
                    enum: ["active", "pending", "suspended", "all"],
                    description: "Filter by venue status",
                },
                country: {
                    type: "string",
                    enum: ["RW", "MT"],
                    description: "Filter by country",
                },
                limit: {
                    type: "number",
                    description: "Max results (default 50)",
                },
            },
        },
    },
    {
        name: "platform_venue_verify",
        description: "Verify a venue after claim approval. Updates venue status to active.",
        input_schema: {
            type: "object" as const,
            properties: {
                venue_id: {
                    type: "string",
                    description: "UUID of the venue to verify",
                },
                notes: {
                    type: "string",
                    description: "Verification notes",
                },
            },
            required: ["venue_id"],
        },
    },
    {
        name: "platform_venue_suspend",
        description: "Suspend a venue. Requires reason and creates audit log.",
        input_schema: {
            type: "object" as const,
            properties: {
                venue_id: {
                    type: "string",
                    description: "UUID of the venue to suspend",
                },
                reason: {
                    type: "string",
                    description: "Reason for suspension (required for audit)",
                },
            },
            required: ["venue_id", "reason"],
        },
    },
    {
        name: "platform_user_search",
        description: "Search users by email or ID.",
        input_schema: {
            type: "object" as const,
            properties: {
                query: {
                    type: "string",
                    description: "Email or user ID to search",
                },
            },
            required: ["query"],
        },
    },

    // --- Support Operations ---
    {
        name: "support_ticket_list",
        description: "List support tickets with status filtering.",
        input_schema: {
            type: "object" as const,
            properties: {
                status: {
                    type: "string",
                    enum: ["open", "in_progress", "resolved", "closed", "all"],
                    description: "Filter by ticket status",
                },
                priority: {
                    type: "string",
                    enum: ["low", "normal", "high", "urgent"],
                    description: "Filter by priority",
                },
                limit: {
                    type: "number",
                    description: "Max results (default 20)",
                },
            },
        },
    },
    {
        name: "support_ticket_update",
        description: "Update a support ticket status or assignment.",
        input_schema: {
            type: "object" as const,
            properties: {
                ticket_id: {
                    type: "string",
                    description: "UUID of the ticket",
                },
                status: {
                    type: "string",
                    enum: ["open", "in_progress", "resolved", "closed"],
                    description: "New status",
                },
                notes: {
                    type: "string",
                    description: "Resolution or update notes",
                },
            },
            required: ["ticket_id"],
        },
    },
    {
        name: "support_refund_approve",
        description: "Approve a refund request. Creates audit entry.",
        input_schema: {
            type: "object" as const,
            properties: {
                request_id: {
                    type: "string",
                    description: "UUID of the refund approval request",
                },
                amount: {
                    type: "number",
                    description: "Refund amount (if different from requested)",
                },
                notes: {
                    type: "string",
                    description: "Approval notes",
                },
            },
            required: ["request_id"],
        },
    },

    // --- Approval Resolution ---
    {
        name: "approval_list_pending",
        description: "List all pending approval requests for admin review.",
        input_schema: {
            type: "object" as const,
            properties: {
                request_type: {
                    type: "string",
                    enum: ["menu_publish", "promo_publish", "promo_pause", "venue_claim", "access_grant", "refund", "all"],
                    description: "Filter by request type",
                },
                priority: {
                    type: "string",
                    enum: ["urgent", "high", "normal", "low"],
                    description: "Filter by priority",
                },
                limit: {
                    type: "number",
                    description: "Max results (default 20)",
                },
            },
        },
    },
    {
        name: "approval_get_details",
        description: "Get full details of an approval request including entity preview.",
        input_schema: {
            type: "object" as const,
            properties: {
                request_id: {
                    type: "string",
                    description: "UUID of the approval request",
                },
            },
            required: ["request_id"],
        },
    },
    {
        name: "approval_resolve",
        description: "Approve or reject a pending request. This is the main approval action.",
        input_schema: {
            type: "object" as const,
            properties: {
                request_id: {
                    type: "string",
                    description: "UUID of the approval request",
                },
                decision: {
                    type: "string",
                    enum: ["approve", "reject"],
                    description: "The resolution decision",
                },
                notes: {
                    type: "string",
                    description: "Resolution notes (required for rejections)",
                },
            },
            required: ["request_id", "decision"],
        },
    },

    // --- Analytics & Reports ---
    {
        name: "analytics_platform_summary",
        description: "Get platform-wide analytics summary.",
        input_schema: {
            type: "object" as const,
            properties: {
                time_window: {
                    type: "string",
                    enum: ["today", "week", "month", "year"],
                    description: "Time window for metrics",
                },
            },
        },
    },
    {
        name: "analytics_venue_health",
        description: "Get health metrics for a specific venue.",
        input_schema: {
            type: "object" as const,
            properties: {
                venue_id: {
                    type: "string",
                    description: "UUID of the venue",
                },
            },
            required: ["venue_id"],
        },
    },

    // --- Audit & Compliance ---
    {
        name: "audit_search",
        description: "Search audit logs by various criteria.",
        input_schema: {
            type: "object" as const,
            properties: {
                action_type: {
                    type: "string",
                    description: "Filter by action type (e.g., 'approval_resolve', 'tool_*')",
                },
                user_id: {
                    type: "string",
                    description: "Filter by user ID",
                },
                venue_id: {
                    type: "string",
                    description: "Filter by venue ID",
                },
                start_date: {
                    type: "string",
                    description: "Start date (ISO format)",
                },
                end_date: {
                    type: "string",
                    description: "End date (ISO format)",
                },
                limit: {
                    type: "number",
                    description: "Max results (default 50)",
                },
            },
        },
    },
];

// =============================================================================
// TOOL HANDLERS
// =============================================================================

interface ToolResult {
    success: boolean;
    data?: unknown;
    error?: string;
}

/**
 * Execute an admin tool.
 */
export async function executeAdminTool(
    toolName: string,
    input: Record<string, unknown>,
    context: { user_id?: string; correlation_id?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    switch (toolName) {
        // Platform Operations
        case "platform_venue_list":
            return await platformVenueList(input, supabase);
        case "platform_venue_verify":
            return await platformVenueVerify(input, context, supabase);
        case "platform_venue_suspend":
            return await platformVenueSuspend(input, context, supabase);
        case "platform_user_search":
            return await platformUserSearch(input, supabase);

        // Support Operations
        case "support_ticket_list":
            return await supportTicketList(input, supabase);
        case "support_ticket_update":
            return await supportTicketUpdate(input, context, supabase);
        case "support_refund_approve":
            return await supportRefundApprove(input, context, supabase);

        // Approval Resolution
        case "approval_list_pending":
            return await approvalListPending(input, supabase);
        case "approval_get_details":
            return await approvalGetDetails(input, supabase);
        case "approval_resolve":
            return await approvalResolve(input, context, supabase);

        // Analytics
        case "analytics_platform_summary":
            return await analyticsPlatformSummary(input, supabase);
        case "analytics_venue_health":
            return await analyticsVenueHealth(input, supabase);

        // Audit
        case "audit_search":
            return await auditSearch(input, supabase);

        default:
            return { success: false, error: `Unknown admin tool: ${toolName}` };
    }
}

// =============================================================================
// PLATFORM OPERATIONS
// =============================================================================

async function platformVenueList(input: Record<string, unknown>, supabase: SupabaseClient): Promise<ToolResult> {
    const status = input.status as string || "all";
    const country = input.country as string;
    const limit = (input.limit as number) || 50;

    let query = supabase
        .from("venues")
        .select("id, name, slug, country, status, owner_id, created_at")
        .limit(limit)
        .order("created_at", { ascending: false });

    if (status !== "all") {
        query = query.eq("status", status);
    }
    if (country) {
        query = query.eq("country", country);
    }

    const { data, error } = await query;

    if (error) return { success: false, error: error.message };
    return { success: true, data: { venues: data, count: data?.length || 0 } };
}

async function platformVenueVerify(
    input: Record<string, unknown>,
    context: { user_id?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    const venueId = input.venue_id as string;
    const notes = input.notes as string;

    const { data, error } = await supabase
        .from("venues")
        .update({
            status: "active",
            verified_at: new Date().toISOString(),
            verified_by: context.user_id,
        })
        .eq("id", venueId)
        .select()
        .single();

    if (error) return { success: false, error: error.message };

    // Log audit entry
    await supabase.from("agent_actions").insert({
        action_type: "venue_verify",
        action_data: { venue_id: venueId, notes },
        user_id: context.user_id,
        success: true,
    }).catch(() => { });

    return { success: true, data };
}

async function platformVenueSuspend(
    input: Record<string, unknown>,
    context: { user_id?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    const venueId = input.venue_id as string;
    const reason = input.reason as string;

    if (!reason) {
        return { success: false, error: "Reason is required for suspension" };
    }

    const { data, error } = await supabase
        .from("venues")
        .update({
            status: "suspended",
            suspension_reason: reason,
            suspended_at: new Date().toISOString(),
            suspended_by: context.user_id,
        })
        .eq("id", venueId)
        .select()
        .single();

    if (error) return { success: false, error: error.message };

    // Log audit entry
    await supabase.from("agent_actions").insert({
        action_type: "venue_suspend",
        action_data: { venue_id: venueId, reason },
        user_id: context.user_id,
        success: true,
    }).catch(() => { });

    return { success: true, data: { suspended: true, venue_id: venueId } };
}

async function platformUserSearch(input: Record<string, unknown>, supabase: SupabaseClient): Promise<ToolResult> {
    const query = input.query as string;

    // Search by email in venues (owner)
    const { data: venues } = await supabase
        .from("venues")
        .select("id, name, owner_id")
        .limit(10);

    return {
        success: true,
        data: {
            message: "User search requires direct auth.users access. Showing venue owners.",
            venues_with_owners: venues || [],
        },
    };
}

// =============================================================================
// SUPPORT OPERATIONS
// =============================================================================

async function supportTicketList(input: Record<string, unknown>, supabase: SupabaseClient): Promise<ToolResult> {
    // Support tickets table may not exist yet
    return {
        success: true,
        data: {
            tickets: [],
            message: "Support tickets table will be available in a future migration.",
        },
    };
}

async function supportTicketUpdate(
    input: Record<string, unknown>,
    context: { user_id?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    return {
        success: false,
        error: "Support tickets table not yet implemented.",
    };
}

async function supportRefundApprove(
    input: Record<string, unknown>,
    context: { user_id?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    const requestId = input.request_id as string;
    const notes = input.notes as string;

    // Resolve the refund approval request
    return approvalResolve(
        { request_id: requestId, decision: "approve", notes },
        context,
        supabase
    );
}

// =============================================================================
// APPROVAL RESOLUTION
// =============================================================================

async function approvalListPending(input: Record<string, unknown>, supabase: SupabaseClient): Promise<ToolResult> {
    const requestType = input.request_type as string || "all";
    const priority = input.priority as string;
    const limit = (input.limit as number) || 20;

    let query = supabase
        .from("approval_requests")
        .select(`
      id, request_type, entity_type, entity_id, venue_id,
      requested_by, notes, priority, status, created_at
    `)
        .eq("status", "pending")
        .limit(limit)
        .order("created_at", { ascending: true });

    if (requestType !== "all") {
        query = query.eq("request_type", requestType);
    }
    if (priority) {
        query = query.eq("priority", priority);
    }

    const { data, error } = await query;

    if (error) {
        if (error.code === "42P01") {
            return { success: true, data: { requests: [], message: "Run approvals migration first." } };
        }
        return { success: false, error: error.message };
    }

    return { success: true, data: { requests: data, count: data?.length || 0 } };
}

async function approvalGetDetails(input: Record<string, unknown>, supabase: SupabaseClient): Promise<ToolResult> {
    const requestId = input.request_id as string;

    const { data: request, error } = await supabase
        .from("approval_requests")
        .select("*")
        .eq("id", requestId)
        .single();

    if (error) return { success: false, error: error.message };

    // Get entity preview based on type
    let entityPreview = null;
    if (request.entity_type === "menu_item_draft") {
        const { data: draft } = await supabase
            .from("menu_item_drafts")
            .select("name, description, price, status")
            .eq("id", request.entity_id)
            .single();
        entityPreview = draft;
    } else if (request.entity_type === "promo_draft") {
        const { data: draft } = await supabase
            .from("promo_drafts")
            .select("title, description, discount_percent, discount_amount, valid_until")
            .eq("id", request.entity_id)
            .single();
        entityPreview = draft;
    }

    return {
        success: true,
        data: {
            request,
            entity_preview: entityPreview,
        },
    };
}

async function approvalResolve(
    input: Record<string, unknown>,
    context: { user_id?: string; correlation_id?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    const requestId = input.request_id as string;
    const decision = input.decision as "approve" | "reject";
    const notes = input.notes as string;

    if (decision === "reject" && !notes) {
        return { success: false, error: "Notes are required when rejecting a request" };
    }

    // Get the request first
    const { data: request, error: fetchError } = await supabase
        .from("approval_requests")
        .select("*")
        .eq("id", requestId)
        .eq("status", "pending")
        .single();

    if (fetchError) return { success: false, error: fetchError.message };
    if (!request) return { success: false, error: "Request not found or already resolved" };

    const newStatus = decision === "approve" ? "approved" : "rejected";

    // Update the approval request
    const { error: updateError } = await supabase
        .from("approval_requests")
        .update({
            status: newStatus,
            resolved_by: context.user_id,
            resolved_at: new Date().toISOString(),
            resolution_notes: notes,
        })
        .eq("id", requestId);

    if (updateError) return { success: false, error: updateError.message };

    // If approved, perform the actual action
    if (decision === "approve") {
        await performApprovalAction(request, context, supabase);
    } else {
        // If rejected, update draft status
        await markDraftRejected(request, notes, supabase);
    }

    // Log audit entry
    await supabase.from("agent_actions").insert({
        action_type: "approval_resolve",
        action_data: {
            request_id: requestId,
            request_type: request.request_type,
            decision,
            notes,
        },
        user_id: context.user_id,
        correlation_id: context.correlation_id,
        success: true,
    }).catch(() => { });

    return {
        success: true,
        data: {
            request_id: requestId,
            decision,
            status: newStatus,
            message: `Request ${decision === "approve" ? "approved" : "rejected"} successfully`,
        },
    };
}

async function performApprovalAction(
    request: Record<string, unknown>,
    context: { user_id?: string },
    supabase: SupabaseClient
): Promise<void> {
    const requestType = request.request_type as string;
    const entityId = request.entity_id as string;

    switch (requestType) {
        case "menu_publish": {
            // Get the draft
            const { data: draft } = await supabase
                .from("menu_item_drafts")
                .select("*")
                .eq("id", entityId)
                .single();

            if (draft) {
                // Create the actual menu item
                const { data: newItem } = await supabase
                    .from("menu_items")
                    .insert({
                        venue_id: draft.venue_id,
                        category_id: draft.category_id,
                        name: draft.name,
                        description: draft.description,
                        price: draft.price,
                        is_available: true,
                    })
                    .select()
                    .single();

                // Update draft status
                await supabase
                    .from("menu_item_drafts")
                    .update({
                        status: "published",
                        published_item_id: newItem?.id,
                        approved_by: context.user_id,
                        approved_at: new Date().toISOString(),
                    })
                    .eq("id", entityId);
            }
            break;
        }

        case "promo_publish": {
            // Get the draft
            const { data: draft } = await supabase
                .from("promo_drafts")
                .select("*")
                .eq("id", entityId)
                .single();

            if (draft) {
                // Create the actual promo
                const { data: newPromo } = await supabase
                    .from("promos")
                    .insert({
                        venue_id: draft.venue_id,
                        title: draft.title,
                        description: draft.description,
                        discount_percent: draft.discount_percent,
                        discount_amount: draft.discount_amount,
                        valid_from: draft.valid_from,
                        valid_until: draft.valid_until,
                        is_active: true,
                    })
                    .select()
                    .single();

                // Update draft status
                await supabase
                    .from("promo_drafts")
                    .update({
                        status: "published",
                        published_promo_id: newPromo?.id,
                        approved_by: context.user_id,
                        approved_at: new Date().toISOString(),
                    })
                    .eq("id", entityId);
            }
            break;
        }

        case "promo_pause": {
            // Pause the published promo
            await supabase
                .from("promos")
                .update({ is_active: false })
                .eq("id", entityId);
            break;
        }
    }
}

async function markDraftRejected(
    request: Record<string, unknown>,
    reason: string,
    supabase: SupabaseClient
): Promise<void> {
    const entityType = request.entity_type as string;
    const entityId = request.entity_id as string;

    const table = entityType === "menu_item_draft" ? "menu_item_drafts" : "promo_drafts";

    await supabase
        .from(table)
        .update({
            status: "rejected",
            rejection_reason: reason,
        })
        .eq("id", entityId);
}

// =============================================================================
// ANALYTICS
// =============================================================================

async function analyticsPlatformSummary(input: Record<string, unknown>, supabase: SupabaseClient): Promise<ToolResult> {
    const timeWindow = (input.time_window as string) || "week";

    const now = new Date();
    let startDate = new Date();

    switch (timeWindow) {
        case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
        case "week":
            startDate.setDate(startDate.getDate() - 7);
            break;
        case "month":
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case "year":
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
    }

    // Get venue count
    const { count: venueCount } = await supabase
        .from("venues")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");

    // Get order count
    const { count: orderCount } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startDate.toISOString());

    // Get pending approvals count
    const { count: pendingApprovals } = await supabase
        .from("approval_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

    return {
        success: true,
        data: {
            time_window: timeWindow,
            active_venues: venueCount || 0,
            orders_in_period: orderCount || 0,
            pending_approvals: pendingApprovals || 0,
            as_of: now.toISOString(),
        },
    };
}

async function analyticsVenueHealth(input: Record<string, unknown>, supabase: SupabaseClient): Promise<ToolResult> {
    const venueId = input.venue_id as string;

    // Get venue details
    const { data: venue } = await supabase
        .from("venues")
        .select("id, name, status, created_at")
        .eq("id", venueId)
        .single();

    if (!venue) {
        return { success: false, error: "Venue not found" };
    }

    // Get order stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: orderCount } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId)
        .gte("created_at", thirtyDaysAgo.toISOString());

    // Get menu item count
    const { count: menuItemCount } = await supabase
        .from("menu_items")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId)
        .eq("is_available", true);

    return {
        success: true,
        data: {
            venue,
            health: {
                orders_last_30_days: orderCount || 0,
                active_menu_items: menuItemCount || 0,
                status: venue.status,
            },
        },
    };
}

// =============================================================================
// AUDIT
// =============================================================================

async function auditSearch(input: Record<string, unknown>, supabase: SupabaseClient): Promise<ToolResult> {
    const actionType = input.action_type as string;
    const userId = input.user_id as string;
    const venueId = input.venue_id as string;
    const startDate = input.start_date as string;
    const endDate = input.end_date as string;
    const limit = (input.limit as number) || 50;

    let query = supabase
        .from("agent_actions")
        .select("id, action_type, action_data, success, user_id, venue_id, created_at")
        .limit(limit)
        .order("created_at", { ascending: false });

    if (actionType) {
        query = query.ilike("action_type", `%${actionType}%`);
    }
    if (userId) {
        query = query.eq("user_id", userId);
    }
    if (venueId) {
        query = query.eq("venue_id", venueId);
    }
    if (startDate) {
        query = query.gte("created_at", startDate);
    }
    if (endDate) {
        query = query.lte("created_at", endDate);
    }

    const { data, error } = await query;

    if (error) return { success: false, error: error.message };

    return {
        success: true,
        data: {
            audit_entries: data,
            count: data?.length || 0,
        },
    };
}
