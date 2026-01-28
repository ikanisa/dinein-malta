/**
 * Agent Tools for Claude Tool Use
 * 
 * Defines tools that the AI assistant can call to:
 * - Search and get menu items
 * - Check order status
 * - Call staff
 * - Get recommendations
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cart Manager for AI-assisted ordering
import {
    getCart,
    addToCart,
    removeFromCart,
    placeOrder,
} from "./cart_manager.ts";

// Guest Intelligence for personalization
import {
    getGuestPreferences,
    saveGuestPreference,
    getGuestOrderHistory,
    getPersonalizedRecommendations,
    type PreferenceType,
} from "./guest_intelligence.ts";

// =============================================================================
// CLAUDE TOOL DEFINITIONS (schema for Claude API)
// =============================================================================

export interface ClaudeTool {
    name: string;
    description: string;
    input_schema: {
        type: "object";
        properties: Record<string, unknown>;
        required?: string[];
    };
}

export const GUEST_TOOLS: ClaudeTool[] = [
    {
        name: "menu_search",
        description: "Search for menu items by name, category, or dietary restrictions. Use when guest asks about menu, food options, or specific dishes.",
        input_schema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Search term (name, ingredient, or description)",
                },
                category: {
                    type: "string",
                    description: "Category to filter by (e.g., 'drinks', 'mains', 'desserts')",
                },
                dietary: {
                    type: "string",
                    enum: ["vegetarian", "vegan", "gluten_free"],
                    description: "Dietary restriction filter",
                },
                limit: {
                    type: "number",
                    description: "Max results (default 5)",
                },
            },
            required: [],
        },
    },
    {
        name: "get_item_details",
        description: "Get full details about a specific menu item including ingredients and allergens.",
        input_schema: {
            type: "object",
            properties: {
                item_id: {
                    type: "string",
                    description: "The menu item's UUID",
                },
                item_name: {
                    type: "string",
                    description: "The menu item's name (if ID unknown)",
                },
            },
            required: [],
        },
    },
    {
        name: "get_popular_items",
        description: "Get the most popular or recommended menu items at this venue.",
        input_schema: {
            type: "object",
            properties: {
                limit: {
                    type: "number",
                    description: "Number of items to return (default 5)",
                },
            },
            required: [],
        },
    },
    {
        name: "check_order_status",
        description: "Check the status of an order by order ID or get the guest's most recent order.",
        input_schema: {
            type: "object",
            properties: {
                order_id: {
                    type: "string",
                    description: "Order UUID (optional - gets latest if not provided)",
                },
            },
            required: [],
        },
    },
    {
        name: "call_staff",
        description: "Request human staff assistance at the table. Use when guest needs help that AI cannot provide.",
        input_schema: {
            type: "object",
            properties: {
                reason: {
                    type: "string",
                    description: "Brief reason for the call (e.g., 'payment', 'complaint', 'question')",
                },
            },
            required: ["reason"],
        },
    },
    // =========================================================================
    // CART TOOLS (Moltbot Phase 1)
    // =========================================================================
    {
        name: "add_to_cart",
        description: "Add a menu item to the guest's cart. Use when guest wants to order something.",
        input_schema: {
            type: "object",
            properties: {
                item_id: {
                    type: "string",
                    description: "The menu item's UUID (get from menu_search or get_item_details)",
                },
                quantity: {
                    type: "number",
                    description: "Number of items to add (default 1)",
                },
                notes: {
                    type: "string",
                    description: "Special instructions (e.g., 'no onions', 'extra spicy')",
                },
            },
            required: ["item_id"],
        },
    },
    {
        name: "view_cart",
        description: "Show the guest's current cart contents and total. Use when guest asks what's in their cart or wants to review before ordering.",
        input_schema: {
            type: "object",
            properties: {},
            required: [],
        },
    },
    {
        name: "remove_from_cart",
        description: "Remove an item from the cart or reduce its quantity.",
        input_schema: {
            type: "object",
            properties: {
                item_id: {
                    type: "string",
                    description: "The menu item's UUID to remove",
                },
                item_name: {
                    type: "string",
                    description: "The menu item's name (if ID unknown)",
                },
                quantity: {
                    type: "number",
                    description: "Quantity to remove (omit to remove all)",
                },
            },
            required: [],
        },
    },
    {
        name: "place_order",
        description: "Submit the cart as an order. Use when guest confirms they want to place their order.",
        input_schema: {
            type: "object",
            properties: {
                payment_method: {
                    type: "string",
                    enum: ["cash", "momo_ussd", "revolut_link"],
                    description: "How the guest will pay (cash, MoMo Mobile Money, or Revolut)",
                },
            },
            required: ["payment_method"],
        },
    },
    // =========================================================================
    // INTELLIGENCE TOOLS (Moltbot Phase 5)
    // =========================================================================
    {
        name: "save_preference",
        description: "Save a guest preference (dietary restriction, allergy, dislike, favorite). Use when guest mentions 'I'm vegetarian', 'I'm allergic to nuts', etc.",
        input_schema: {
            type: "object",
            properties: {
                preference_type: {
                    type: "string",
                    enum: ["dietary", "allergy", "dislike", "favorite", "spice_level"],
                    description: "Type of preference",
                },
                value: {
                    type: "string",
                    description: "The preference value (e.g., 'vegetarian', 'nuts', 'spicy food')",
                },
            },
            required: ["preference_type", "value"],
        },
    },
    {
        name: "get_my_preferences",
        description: "Get the guest's saved preferences and dietary info. Use to personalize recommendations.",
        input_schema: {
            type: "object",
            properties: {},
            required: [],
        },
    },
    {
        name: "get_past_orders",
        description: "Get the guest's order history at this venue. Use for 'what did I order last time' questions.",
        input_schema: {
            type: "object",
            properties: {
                limit: {
                    type: "number",
                    description: "Number of past orders to show (default 5)",
                },
            },
            required: [],
        },
    },
    {
        name: "get_recommendations",
        description: "Get personalized recommendations based on guest preferences and order history.",
        input_schema: {
            type: "object",
            properties: {
                limit: {
                    type: "number",
                    description: "Number of recommendations (default 3)",
                },
            },
            required: [],
        },
    },
];

export const BAR_MANAGER_TOOLS: ClaudeTool[] = [
    {
        name: "get_active_orders",
        description: "Get all active orders (placed, received) for this venue.",
        input_schema: {
            type: "object",
            properties: {
                status: {
                    type: "string",
                    enum: ["placed", "received", "served", "cancelled"],
                    description: "Filter by specific status",
                },
                limit: {
                    type: "number",
                    description: "Max results (default 20)",
                },
            },
            required: [],
        },
    },
    {
        name: "update_order_status",
        description: "Update the status of an order (e.g., mark as received, served).",
        input_schema: {
            type: "object",
            properties: {
                order_id: {
                    type: "string",
                    description: "The order UUID",
                },
                new_status: {
                    type: "string",
                    enum: ["received", "served", "cancelled"],
                    description: "New status for the order",
                },
            },
            required: ["order_id", "new_status"],
        },
    },
    {
        name: "get_sales_summary",
        description: "Get sales summary for today or a specified period.",
        input_schema: {
            type: "object",
            properties: {
                period: {
                    type: "string",
                    enum: ["today", "week", "month"],
                    description: "Time period for summary",
                },
            },
            required: [],
        },
    },
];

// =============================================================================
// TOOL HANDLERS (execute the actual operations)
// =============================================================================

export interface ToolResult {
    success: boolean;
    data?: unknown;
    error?: string;
}

export async function executeGuestTool(
    toolName: string,
    input: Record<string, unknown>,
    context: { venue_id?: string; table_no?: string; user_id?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    try {
        switch (toolName) {
            case "menu_search":
                return await menuSearch(input, context.venue_id!, supabase);

            case "get_item_details":
                return await getItemDetails(input, context.venue_id!, supabase);

            case "get_popular_items":
                return await getPopularItems(input, context.venue_id!, supabase);

            case "check_order_status":
                return await checkOrderStatus(input, context, supabase);

            case "call_staff":
                return await callStaff(input, context, supabase);

            // Cart tools (Moltbot Phase 1)
            case "add_to_cart":
                return await addToCart(
                    input as { item_id: string; quantity?: number; notes?: string },
                    { venue_id: context.venue_id!, user_id: context.user_id, table_no: context.table_no },
                    supabase
                );

            case "view_cart":
                return await getCart(
                    { venue_id: context.venue_id!, user_id: context.user_id, table_no: context.table_no },
                    supabase
                );

            case "remove_from_cart":
                return await removeFromCart(
                    input as { item_id?: string; item_name?: string; quantity?: number },
                    { venue_id: context.venue_id!, user_id: context.user_id, table_no: context.table_no },
                    supabase
                );

            case "place_order":
                return await placeOrder(
                    input as { payment_method: string },
                    { venue_id: context.venue_id!, user_id: context.user_id, table_no: context.table_no },
                    supabase
                );

            // Intelligence tools (Moltbot Phase 5)
            case "save_preference":
                if (!context.user_id) {
                    return { success: false, error: "User not authenticated" };
                }
                return await saveGuestPreference(
                    supabase,
                    context.user_id,
                    input.preference_type as PreferenceType,
                    input.value as string,
                    context.venue_id
                );

            case "get_my_preferences":
                if (!context.user_id) {
                    return { success: true, data: { preferences: [] } };
                }
                const prefs = await getGuestPreferences(supabase, context.user_id, context.venue_id);
                return {
                    success: true,
                    data: {
                        preferences: prefs.map(p => ({
                            type: p.preference_type,
                            value: p.value,
                        })),
                    },
                };

            case "get_past_orders":
                if (!context.user_id || !context.venue_id) {
                    return { success: true, data: { orders: [] } };
                }
                const history = await getGuestOrderHistory(
                    supabase,
                    context.user_id,
                    context.venue_id,
                    (input.limit as number) || 5
                );
                return {
                    success: true,
                    data: {
                        orders: history.map(h => ({
                            item: h.item_name,
                            category: h.category_name,
                            times_ordered: h.order_count,
                            last_ordered: h.last_ordered,
                        })),
                    },
                };

            case "get_recommendations":
                if (!context.venue_id) {
                    return { success: false, error: "No venue context" };
                }
                const recs = await getPersonalizedRecommendations(
                    supabase,
                    context.user_id || "",
                    context.venue_id,
                    (input.limit as number) || 3
                );
                return {
                    success: true,
                    data: {
                        recommendations: recs.items.map(i => ({
                            name: i.item_name,
                            popularity: `Ordered by ${i.unique_customers} guests`,
                        })),
                        reason: recs.reason,
                    },
                };

            default:
                return { success: false, error: `Unknown tool: ${toolName}` };
        }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Tool execution failed" };
    }
}

export async function executeBarManagerTool(
    toolName: string,
    input: Record<string, unknown>,
    context: { venue_id?: string; user_id?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    try {
        switch (toolName) {
            case "get_active_orders":
                return await getActiveOrders(input, context.venue_id!, supabase);

            case "update_order_status":
                return await updateOrderStatus(input, supabase);

            case "get_sales_summary":
                return await getSalesSummary(input, context.venue_id!, supabase);

            default:
                return { success: false, error: `Unknown tool: ${toolName}` };
        }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Tool execution failed" };
    }
}

// =============================================================================
// TOOL IMPLEMENTATIONS
// =============================================================================

async function menuSearch(
    input: Record<string, unknown>,
    venueId: string,
    supabase: SupabaseClient
): Promise<ToolResult> {
    const { query, category, dietary, limit = 5 } = input;

    let dbQuery = supabase
        .from("menu_items")
        .select("id, name, description, price, currency, category, available")
        .eq("venue_id", venueId)
        .eq("available", true)
        .limit(limit as number);

    if (query) {
        dbQuery = dbQuery.ilike("name", `%${query}%`);
    }
    if (category) {
        dbQuery = dbQuery.ilike("category", `%${category}%`);
    }
    if (dietary === "vegetarian") {
        dbQuery = dbQuery.eq("is_vegetarian", true);
    } else if (dietary === "vegan") {
        dbQuery = dbQuery.eq("is_vegan", true);
    } else if (dietary === "gluten_free") {
        dbQuery = dbQuery.eq("is_gluten_free", true);
    }

    const { data, error } = await dbQuery;

    if (error) return { success: false, error: error.message };

    return {
        success: true,
        data: {
            items: data || [],
            count: data?.length || 0,
            message: data?.length
                ? `Found ${data.length} menu items`
                : "No items found matching your criteria",
        },
    };
}

async function getItemDetails(
    input: Record<string, unknown>,
    venueId: string,
    supabase: SupabaseClient
): Promise<ToolResult> {
    const { item_id, item_name } = input;

    let query = supabase
        .from("menu_items")
        .select("*")
        .eq("venue_id", venueId);

    if (item_id) {
        query = query.eq("id", item_id);
    } else if (item_name) {
        query = query.ilike("name", `%${item_name}%`);
    } else {
        return { success: false, error: "Either item_id or item_name is required" };
    }

    const { data, error } = await query.limit(1).single();

    if (error) return { success: false, error: "Item not found" };

    return {
        success: true,
        data: {
            item: data,
            message: `${data.name} - ${data.currency}${data.price}`,
        },
    };
}

async function getPopularItems(
    input: Record<string, unknown>,
    venueId: string,
    supabase: SupabaseClient
): Promise<ToolResult> {
    const { limit = 5 } = input;

    // For now, return first N available items (could be enhanced with order analytics)
    const { data, error } = await supabase
        .from("menu_items")
        .select("id, name, description, price, currency, category")
        .eq("venue_id", venueId)
        .eq("available", true)
        .limit(limit as number);

    if (error) return { success: false, error: error.message };

    return {
        success: true,
        data: {
            items: data || [],
            message: `Here are ${data?.length || 0} popular items`,
        },
    };
}

async function checkOrderStatus(
    input: Record<string, unknown>,
    context: { venue_id?: string; user_id?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    const { order_id } = input;

    let query = supabase
        .from("orders")
        .select("id, status, total, currency, created_at, order_items(name_snapshot, quantity, unit_price)");

    if (order_id) {
        query = query.eq("id", order_id);
    } else if (context.user_id) {
        query = query.eq("user_id", context.user_id).order("created_at", { ascending: false });
    } else if (context.venue_id) {
        query = query.eq("venue_id", context.venue_id).order("created_at", { ascending: false });
    }

    const { data, error } = await query.limit(1).single();

    if (error) return { success: false, error: "No order found" };

    const statusMessages: Record<string, string> = {
        placed: "Your order has been placed and is awaiting confirmation",
        received: "Your order has been received and is being prepared",
        served: "Your order has been served",
        cancelled: "Your order was cancelled",
    };

    return {
        success: true,
        data: {
            order: data,
            message: statusMessages[data.status] || `Order status: ${data.status}`,
        },
    };
}

async function callStaff(
    input: Record<string, unknown>,
    context: { venue_id?: string; table_no?: string; user_id?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    const { reason } = input;

    if (!context.venue_id) {
        return { success: false, error: "Venue context required" };
    }

    // Insert into waiter_rings table
    const { error } = await supabase.from("waiter_rings").insert({
        venue_id: context.venue_id,
        table_number: context.table_no || "AI Chat",
        user_id: context.user_id,
        status: "pending",
    });

    if (error) {
        return { success: false, error: "Failed to call staff" };
    }

    return {
        success: true,
        data: {
            message: `Staff has been notified. Reason: ${reason}. They will be with you shortly.`,
        },
    };
}

async function getActiveOrders(
    input: Record<string, unknown>,
    venueId: string,
    supabase: SupabaseClient
): Promise<ToolResult> {
    const { status, limit = 20 } = input;

    let query = supabase
        .from("orders")
        .select("id, status, total, currency, table_number, created_at, order_items(name_snapshot, quantity)")
        .eq("venue_id", venueId)
        .order("created_at", { ascending: false })
        .limit(limit as number);

    if (status) {
        query = query.eq("status", status);
    } else {
        query = query.in("status", ["placed", "received"]);
    }

    const { data, error } = await query;

    if (error) return { success: false, error: error.message };

    return {
        success: true,
        data: {
            orders: data || [],
            count: data?.length || 0,
            message: `${data?.length || 0} active orders`,
        },
    };
}

async function updateOrderStatus(
    input: Record<string, unknown>,
    supabase: SupabaseClient
): Promise<ToolResult> {
    const { order_id, new_status } = input;

    if (!order_id || !new_status) {
        return { success: false, error: "order_id and new_status required" };
    }

    const { data, error } = await supabase
        .from("orders")
        .update({ status: new_status })
        .eq("id", order_id)
        .select("id, status")
        .single();

    if (error) return { success: false, error: error.message };

    return {
        success: true,
        data: {
            order: data,
            message: `Order marked as ${new_status}`,
        },
    };
}

async function getSalesSummary(
    input: Record<string, unknown>,
    venueId: string,
    supabase: SupabaseClient
): Promise<ToolResult> {
    const { period = "today" } = input;

    let startDate: Date;
    const now = new Date();

    switch (period) {
        case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case "month":
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    const { data, error } = await supabase
        .from("orders")
        .select("total, currency, status")
        .eq("venue_id", venueId)
        .in("status", ["served", "received"])
        .gte("created_at", startDate.toISOString());

    if (error) return { success: false, error: error.message };

    const totalRevenue = data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const orderCount = data?.length || 0;
    const currency = data?.[0]?.currency || "EUR";

    return {
        success: true,
        data: {
            period,
            total_revenue: totalRevenue,
            order_count: orderCount,
            average_order: orderCount > 0 ? Math.round(totalRevenue / orderCount * 100) / 100 : 0,
            currency,
            message: `${period} summary: ${orderCount} orders, ${currency}${totalRevenue.toFixed(2)} revenue`,
        },
    };
}
