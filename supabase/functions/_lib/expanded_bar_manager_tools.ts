/**
 * Expanded Bar Manager Tools for Moltbot
 * 
 * These tools extend the bar manager capabilities with:
 * - Venue operations (read-only)
 * - Menu drafts (create/update with approval workflow)
 * - Inventory signals
 * - Review/KPI summaries
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { type ClaudeTool } from "./agent_tools.ts";

// =============================================================================
// EXPANDED BAR MANAGER TOOL DEFINITIONS
// =============================================================================

export const EXPANDED_BAR_MANAGER_TOOLS: ClaudeTool[] = [
    // --- Venue Operations Read ---
    {
        name: "shift_get_current",
        description: "Get current shift information including staff on duty.",
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
    {
        name: "staff_list",
        description: "List staff members for a venue.",
        input_schema: {
            type: "object" as const,
            properties: {
                venue_id: {
                    type: "string",
                    description: "UUID of the venue",
                },
                on_duty_only: {
                    type: "boolean",
                    description: "Only show staff currently on duty",
                },
            },
            required: ["venue_id"],
        },
    },
    {
        name: "inventory_status",
        description: "Get current inventory status for a venue.",
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
    {
        name: "inventory_low_stock",
        description: "Get items with low stock levels.",
        input_schema: {
            type: "object" as const,
            properties: {
                venue_id: {
                    type: "string",
                    description: "UUID of the venue",
                },
                threshold_percent: {
                    type: "number",
                    description: "Stock threshold percentage (default 20)",
                },
            },
            required: ["venue_id"],
        },
    },
    {
        name: "reviews_fetch",
        description: "Fetch recent reviews for a venue.",
        input_schema: {
            type: "object" as const,
            properties: {
                venue_id: {
                    type: "string",
                    description: "UUID of the venue",
                },
                days_back: {
                    type: "number",
                    description: "Number of days to look back (default 7)",
                },
                min_rating: {
                    type: "number",
                    description: "Minimum rating filter (1-5)",
                },
            },
            required: ["venue_id"],
        },
    },
    {
        name: "service_kpi_snapshot",
        description: "Get service KPIs: avg wait time, order completion rate, etc.",
        input_schema: {
            type: "object" as const,
            properties: {
                venue_id: {
                    type: "string",
                    description: "UUID of the venue",
                },
                time_window: {
                    type: "string",
                    enum: ["today", "yesterday", "week", "month"],
                    description: "Time window for KPIs",
                },
            },
            required: ["venue_id"],
        },
    },

    // --- Menu Drafts ---
    {
        name: "menu_draft_create",
        description: "Create a new menu item draft. Requires approval before publishing.",
        input_schema: {
            type: "object" as const,
            properties: {
                venue_id: {
                    type: "string",
                    description: "UUID of the venue",
                },
                category_id: {
                    type: "string",
                    description: "UUID of the category",
                },
                name: {
                    type: "string",
                    description: "Item name",
                },
                description: {
                    type: "string",
                    description: "Item description",
                },
                price: {
                    type: "number",
                    description: "Price in local currency",
                },
            },
            required: ["venue_id", "category_id", "name", "price"],
        },
    },
    {
        name: "menu_draft_update",
        description: "Update an existing menu item draft.",
        input_schema: {
            type: "object" as const,
            properties: {
                draft_id: {
                    type: "string",
                    description: "UUID of the draft",
                },
                updates: {
                    type: "object",
                    description: "Fields to update (name, description, price)",
                },
            },
            required: ["draft_id", "updates"],
        },
    },
    {
        name: "menu_draft_validate",
        description: "Validate a menu draft before requesting publish.",
        input_schema: {
            type: "object" as const,
            properties: {
                draft_id: {
                    type: "string",
                    description: "UUID of the draft to validate",
                },
            },
            required: ["draft_id"],
        },
    },
    {
        name: "menu_publish_request",
        description: "Request approval to publish a menu draft. Creates an approval request.",
        input_schema: {
            type: "object" as const,
            properties: {
                draft_id: {
                    type: "string",
                    description: "UUID of the draft to publish",
                },
                notes: {
                    type: "string",
                    description: "Notes for the approver",
                },
            },
            required: ["draft_id"],
        },
    },
    {
        name: "menu_publish_status",
        description: "Check the status of a menu publish request.",
        input_schema: {
            type: "object" as const,
            properties: {
                request_id: {
                    type: "string",
                    description: "UUID of the publish request",
                },
            },
            required: ["request_id"],
        },
    },

    // --- Promo Drafts ---
    {
        name: "promo_draft_create",
        description: "Create a new promotion draft. Requires approval before publishing.",
        input_schema: {
            type: "object" as const,
            properties: {
                venue_id: {
                    type: "string",
                    description: "UUID of the venue",
                },
                title: {
                    type: "string",
                    description: "Promo title",
                },
                description: {
                    type: "string",
                    description: "Promo description",
                },
                discount_percent: {
                    type: "number",
                    description: "Discount percentage (0-100)",
                },
                discount_amount: {
                    type: "number",
                    description: "Fixed discount amount (alternative to percent)",
                },
                valid_from: {
                    type: "string",
                    description: "Start date (ISO format)",
                },
                valid_until: {
                    type: "string",
                    description: "End date (ISO format)",
                },
            },
            required: ["venue_id", "title"],
        },
    },
    {
        name: "promo_draft_simulate",
        description: "Simulate the impact of a promo on sales.",
        input_schema: {
            type: "object" as const,
            properties: {
                draft_id: {
                    type: "string",
                    description: "UUID of the promo draft",
                },
            },
            required: ["draft_id"],
        },
    },
    {
        name: "promo_publish_request",
        description: "Request approval to publish a promo. Creates an approval request.",
        input_schema: {
            type: "object" as const,
            properties: {
                draft_id: {
                    type: "string",
                    description: "UUID of the promo draft",
                },
                notes: {
                    type: "string",
                    description: "Notes for approver",
                },
            },
            required: ["draft_id"],
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
 * Execute an expanded bar manager tool.
 */
export async function executeExpandedBarManagerTool(
    toolName: string,
    input: Record<string, unknown>,
    context: { venue_id?: string; user_id?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    const venueId = (input.venue_id as string) || context.venue_id;

    switch (toolName) {
        // Venue Ops Read
        case "shift_get_current":
            return await shiftGetCurrent(venueId!, supabase);
        case "staff_list":
            return await staffList(venueId!, input.on_duty_only as boolean, supabase);
        case "inventory_status":
            return await inventoryStatus(venueId!, supabase);
        case "inventory_low_stock":
            return await inventoryLowStock(venueId!, input.threshold_percent as number, supabase);
        case "reviews_fetch":
            return await reviewsFetch(venueId!, input, supabase);
        case "service_kpi_snapshot":
            return await serviceKPISnapshot(venueId!, input.time_window as string, supabase);

        // Menu Drafts
        case "menu_draft_create":
            return await menuDraftCreate(input, context.user_id!, supabase);
        case "menu_draft_update":
            return await menuDraftUpdate(input.draft_id as string, input.updates as Record<string, unknown>, supabase);
        case "menu_draft_validate":
            return await menuDraftValidate(input.draft_id as string, supabase);
        case "menu_publish_request":
            return await menuPublishRequest(input.draft_id as string, input.notes as string, context.user_id!, supabase);
        case "menu_publish_status":
            return await menuPublishStatus(input.request_id as string, supabase);

        // Promo Drafts
        case "promo_draft_create":
            return await promoDraftCreate(input, context.user_id!, supabase);
        case "promo_draft_simulate":
            return await promoDraftSimulate(input.draft_id as string, supabase);
        case "promo_publish_request":
            return await promoPublishRequest(input.draft_id as string, input.notes as string, context.user_id!, supabase);

        default:
            return { success: false, error: `Unknown tool: ${toolName}` };
    }
}

// =============================================================================
// IMPLEMENTATION STUBS (to be connected to actual tables)
// =============================================================================

async function shiftGetCurrent(venueId: string, supabase: SupabaseClient): Promise<ToolResult> {
    // TODO: Connect to shifts table when created
    return {
        success: true,
        data: {
            shift: "evening",
            start_time: "17:00",
            end_time: "23:00",
            staff_count: 4,
            message: "Shift data will be available when shifts table is created",
        },
    };
}

async function staffList(venueId: string, onDutyOnly: boolean, supabase: SupabaseClient): Promise<ToolResult> {
    // TODO: Connect to staff assignments table
    return {
        success: true,
        data: {
            staff: [],
            message: "Staff list will be available when staff table is created",
        },
    };
}

async function inventoryStatus(venueId: string, supabase: SupabaseClient): Promise<ToolResult> {
    // TODO: Connect to inventory table
    return {
        success: true,
        data: {
            total_items: 0,
            low_stock_count: 0,
            out_of_stock_count: 0,
            message: "Inventory data will be available when inventory table is created",
        },
    };
}

async function inventoryLowStock(venueId: string, threshold: number, supabase: SupabaseClient): Promise<ToolResult> {
    return {
        success: true,
        data: {
            low_stock_items: [],
            threshold_percent: threshold || 20,
            message: "Low stock alerts will be available when inventory table is created",
        },
    };
}

async function reviewsFetch(venueId: string, input: Record<string, unknown>, supabase: SupabaseClient): Promise<ToolResult> {
    // TODO: Connect to reviews table
    return {
        success: true,
        data: {
            reviews: [],
            average_rating: null,
            total_reviews: 0,
            message: "Reviews will be available when reviews table is created",
        },
    };
}

async function serviceKPISnapshot(venueId: string, timeWindow: string, supabase: SupabaseClient): Promise<ToolResult> {
    // Calculate from orders table
    const now = new Date();
    let startDate = new Date();

    switch (timeWindow) {
        case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
        case "yesterday":
            startDate.setDate(startDate.getDate() - 1);
            startDate.setHours(0, 0, 0, 0);
            break;
        case "week":
            startDate.setDate(startDate.getDate() - 7);
            break;
        case "month":
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        default:
            startDate.setHours(0, 0, 0, 0);
    }

    const { data: orders, error } = await supabase
        .from("orders")
        .select("id, status, created_at, served_at")
        .eq("venue_id", venueId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", now.toISOString());

    if (error) {
        return { success: false, error: error.message };
    }

    const total = orders?.length || 0;
    const served = orders?.filter((o: { status: string }) => o.status === "Served").length || 0;
    const cancelled = orders?.filter((o: { status: string }) => o.status === "Cancelled").length || 0;

    return {
        success: true,
        data: {
            time_window: timeWindow || "today",
            total_orders: total,
            served_orders: served,
            cancelled_orders: cancelled,
            completion_rate: total > 0 ? Math.round((served / total) * 100) : 0,
            cancellation_rate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
        },
    };
}

// --- Menu Draft Handlers ---

async function menuDraftCreate(input: Record<string, unknown>, userId: string, supabase: SupabaseClient): Promise<ToolResult> {
    const { data, error } = await supabase
        .from("menu_item_drafts")
        .insert({
            venue_id: input.venue_id,
            category_id: input.category_id,
            name: input.name,
            description: input.description,
            price: input.price,
            created_by: userId,
            status: "draft",
        })
        .select()
        .single();

    if (error) {
        // Table might not exist yet
        if (error.code === "42P01") {
            return {
                success: false,
                error: "Menu drafts table not yet created. Run the approvals migration first.",
            };
        }
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

async function menuDraftUpdate(draftId: string, updates: Record<string, unknown>, supabase: SupabaseClient): Promise<ToolResult> {
    const { data, error } = await supabase
        .from("menu_item_drafts")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", draftId)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

async function menuDraftValidate(draftId: string, supabase: SupabaseClient): Promise<ToolResult> {
    const { data, error } = await supabase
        .from("menu_item_drafts")
        .select("*")
        .eq("id", draftId)
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    const errors: string[] = [];
    if (!data.name || data.name.length < 2) errors.push("Name must be at least 2 characters");
    if (!data.price || data.price <= 0) errors.push("Price must be positive");
    if (!data.category_id) errors.push("Category is required");

    return {
        success: errors.length === 0,
        data: {
            valid: errors.length === 0,
            errors,
            draft: data,
        },
    };
}

async function menuPublishRequest(draftId: string, notes: string, userId: string, supabase: SupabaseClient): Promise<ToolResult> {
    const { data, error } = await supabase
        .from("approval_requests")
        .insert({
            request_type: "menu_publish",
            entity_id: draftId,
            entity_type: "menu_item_draft",
            requested_by: userId,
            notes,
            status: "pending",
        })
        .select()
        .single();

    if (error) {
        if (error.code === "42P01") {
            return {
                success: false,
                error: "Approval requests table not yet created. Run the approvals migration first.",
            };
        }
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: {
            request_id: data.id,
            status: "pending",
            message: "Publish request created. Awaiting admin approval.",
        },
    };
}

async function menuPublishStatus(requestId: string, supabase: SupabaseClient): Promise<ToolResult> {
    const { data, error } = await supabase
        .from("approval_requests")
        .select("id, status, created_at, resolved_at, resolved_by, resolution_notes")
        .eq("id", requestId)
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

// --- Promo Draft Handlers ---

async function promoDraftCreate(input: Record<string, unknown>, userId: string, supabase: SupabaseClient): Promise<ToolResult> {
    const { data, error } = await supabase
        .from("promo_drafts")
        .insert({
            venue_id: input.venue_id,
            title: input.title,
            description: input.description,
            discount_percent: input.discount_percent,
            discount_amount: input.discount_amount,
            valid_from: input.valid_from,
            valid_until: input.valid_until,
            created_by: userId,
            status: "draft",
        })
        .select()
        .single();

    if (error) {
        if (error.code === "42P01") {
            return {
                success: false,
                error: "Promo drafts table not yet created. Run the approvals migration first.",
            };
        }
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

async function promoDraftSimulate(draftId: string, supabase: SupabaseClient): Promise<ToolResult> {
    // Get the draft
    const { data: draft, error } = await supabase
        .from("promo_drafts")
        .select("*")
        .eq("id", draftId)
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    // Simulate impact (placeholder logic)
    const discountPercent = draft.discount_percent || 0;
    const estimatedRedemptions = Math.round(100 * (discountPercent / 100) * 1.5);
    const estimatedRevenueLoss = estimatedRedemptions * (draft.discount_amount || 0);

    return {
        success: true,
        data: {
            promo_title: draft.title,
            discount: `${discountPercent}%`,
            estimated_redemptions: estimatedRedemptions,
            estimated_revenue_impact: -estimatedRevenueLoss,
            recommendation: discountPercent > 30 ? "High discount - consider limiting duration" : "Looks reasonable",
        },
    };
}

async function promoPublishRequest(draftId: string, notes: string, userId: string, supabase: SupabaseClient): Promise<ToolResult> {
    const { data, error } = await supabase
        .from("approval_requests")
        .insert({
            request_type: "promo_publish",
            entity_id: draftId,
            entity_type: "promo_draft",
            requested_by: userId,
            notes,
            status: "pending",
        })
        .select()
        .single();

    if (error) {
        if (error.code === "42P01") {
            return {
                success: false,
                error: "Approval requests table not yet created. Run the approvals migration first.",
            };
        }
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: {
            request_id: data.id,
            status: "pending",
            message: "Promo publish request created. Awaiting admin approval.",
        },
    };
}
