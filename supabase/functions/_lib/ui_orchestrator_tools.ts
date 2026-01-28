/**
 * UI Orchestrator Tools for Moltbot
 * 
 * These tools are used by the UI Orchestrator agent to compose
 * UIPlan documents that apps render deterministically.
 */

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
    type UIPlan,
    type Section,
    type Country,
    createUIPlan,
    validateUIPlan,
    featuredVenues,
    menuItems,
    paymentOptions,
    emptyState,
    loadingSection,
    errorSection,
} from "./ui_plan.ts";
import { type ClaudeTool } from "./agent_tools.ts";

// =============================================================================
// TOOL DEFINITIONS FOR CLAUDE
// =============================================================================

export const UI_ORCHESTRATOR_TOOLS: ClaudeTool[] = [
    {
        name: "venues_search",
        description: "Search for venues by name, cuisine, or other criteria. Returns venue IDs for UIPlan composition.",
        input_schema: {
            type: "object" as const,
            properties: {
                query: {
                    type: "string",
                    description: "Search query (venue name, cuisine type, etc.)",
                },
                country: {
                    type: "string",
                    enum: ["RW", "MT"],
                    description: "Filter by country",
                },
                limit: {
                    type: "number",
                    description: "Maximum results to return (default 10)",
                },
            },
            required: ["query"],
        },
    },
    {
        name: "venues_list",
        description: "List venues, optionally filtered by country. For home screen venue discovery.",
        input_schema: {
            type: "object" as const,
            properties: {
                country: {
                    type: "string",
                    enum: ["RW", "MT"],
                    description: "Filter by country",
                },
                featured_only: {
                    type: "boolean",
                    description: "Only return featured venues",
                },
                limit: {
                    type: "number",
                    description: "Maximum results (default 20)",
                },
            },
        },
    },
    {
        name: "venues_get",
        description: "Get details for a specific venue by ID.",
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
        name: "offers_list_applicable",
        description: "Get applicable offers/promos for a venue or guest.",
        input_schema: {
            type: "object" as const,
            properties: {
                venue_id: {
                    type: "string",
                    description: "Venue ID to get offers for",
                },
                guest_id: {
                    type: "string",
                    description: "Optional guest ID for personalized offers",
                },
            },
            required: ["venue_id"],
        },
    },
    {
        name: "menu_get",
        description: "Get menu categories and items for a venue.",
        input_schema: {
            type: "object" as const,
            properties: {
                venue_id: {
                    type: "string",
                    description: "UUID of the venue",
                },
                category_id: {
                    type: "string",
                    description: "Optional category to filter items",
                },
            },
            required: ["venue_id"],
        },
    },
    {
        name: "guest_get_profile",
        description: "Get guest preferences and history for personalization.",
        input_schema: {
            type: "object" as const,
            properties: {
                guest_id: {
                    type: "string",
                    description: "UUID of the guest",
                },
            },
            required: ["guest_id"],
        },
    },
    {
        name: "ui_compose",
        description: "Compose a UIPlan document for the app to render. Use this after gathering data from other tools.",
        input_schema: {
            type: "object" as const,
            properties: {
                screen: {
                    type: "string",
                    enum: ["home", "venue_menu", "search_results", "cart", "checkout", "order_status", "settings", "venue_detail"],
                    description: "Target screen type",
                },
                sections: {
                    type: "array",
                    description: "Array of section objects to display",
                    items: {
                        type: "object",
                        properties: {
                            type: {
                                type: "string",
                                description: "Section type (featured_venues, promos, menu_items, etc.)",
                            },
                        },
                    },
                },
                venue_id: {
                    type: "string",
                    description: "Context venue ID if applicable",
                },
                country: {
                    type: "string",
                    enum: ["RW", "MT"],
                    description: "Country context",
                },
            },
            required: ["screen", "sections"],
        },
    },
    {
        name: "ui_validate",
        description: "Validate a UIPlan document before returning it.",
        input_schema: {
            type: "object" as const,
            properties: {
                plan: {
                    type: "object",
                    description: "The UIPlan document to validate",
                },
            },
            required: ["plan"],
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
 * Execute a UI Orchestrator tool.
 */
export async function executeUIOrchestratorTool(
    toolName: string,
    input: Record<string, unknown>,
    context: { venue_id?: string; user_id?: string; correlation_id?: string },
    supabase: SupabaseClient
): Promise<ToolResult> {
    switch (toolName) {
        case "venues_search":
            return await venuesSearch(input, supabase);
        case "venues_list":
            return await venuesList(input, supabase);
        case "venues_get":
            return await venuesGet(input, supabase);
        case "offers_list_applicable":
            return await offersListApplicable(input, supabase);
        case "menu_get":
            return await menuGet(input, supabase);
        case "guest_get_profile":
            return await guestGetProfile(input, supabase);
        case "ui_compose":
            return await uiCompose(input, context);
        case "ui_validate":
            return uiValidate(input);
        default:
            return { success: false, error: `Unknown tool: ${toolName}` };
    }
}

// =============================================================================
// INDIVIDUAL TOOL IMPLEMENTATIONS
// =============================================================================

async function venuesSearch(
    input: Record<string, unknown>,
    supabase: SupabaseClient
): Promise<ToolResult> {
    const query = input.query as string;
    const country = input.country as Country | undefined;
    const limit = (input.limit as number) || 10;

    let dbQuery = supabase
        .from("venues")
        .select("id, name, slug, cuisine_type, country")
        .eq("status", "active")
        .ilike("name", `%${query}%`)
        .limit(limit);

    if (country) {
        dbQuery = dbQuery.eq("country", country);
    }

    const { data, error } = await dbQuery;

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: {
            venues: data,
            venue_ids: data?.map((v: { id: string }) => v.id) || [],
            count: data?.length || 0,
        },
    };
}

async function venuesList(
    input: Record<string, unknown>,
    supabase: SupabaseClient
): Promise<ToolResult> {
    const country = input.country as Country | undefined;
    const featuredOnly = input.featured_only as boolean | undefined;
    const limit = (input.limit as number) || 20;

    let dbQuery = supabase
        .from("venues")
        .select("id, name, slug, cuisine_type, country, is_featured")
        .eq("status", "active")
        .limit(limit);

    if (country) {
        dbQuery = dbQuery.eq("country", country);
    }

    if (featuredOnly) {
        dbQuery = dbQuery.eq("is_featured", true);
    }

    const { data, error } = await dbQuery;

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: {
            venues: data,
            venue_ids: data?.map((v: { id: string }) => v.id) || [],
            count: data?.length || 0,
        },
    };
}

async function venuesGet(
    input: Record<string, unknown>,
    supabase: SupabaseClient
): Promise<ToolResult> {
    const venueId = input.venue_id as string;

    const { data, error } = await supabase
        .from("venues")
        .select("id, name, slug, cuisine_type, country, address, opening_hours, is_featured")
        .eq("id", venueId)
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data };
}

async function offersListApplicable(
    input: Record<string, unknown>,
    supabase: SupabaseClient
): Promise<ToolResult> {
    const venueId = input.venue_id as string;
    // guest_id could be used for personalization in future

    const now = new Date().toISOString();

    const { data, error } = await supabase
        .from("promos")
        .select("id, title, description, discount_percent, discount_amount, valid_until")
        .eq("venue_id", venueId)
        .eq("is_active", true)
        .gte("valid_until", now)
        .limit(10);

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: {
            promos: data || [],
            promo_ids: data?.map((p: { id: string }) => p.id) || [],
            count: data?.length || 0,
        },
    };
}

async function menuGet(
    input: Record<string, unknown>,
    supabase: SupabaseClient
): Promise<ToolResult> {
    const venueId = input.venue_id as string;
    const categoryId = input.category_id as string | undefined;

    // Get categories
    const { data: categories, error: catError } = await supabase
        .from("menu_categories")
        .select("id, name, sort_order")
        .eq("venue_id", venueId)
        .order("sort_order");

    if (catError) {
        return { success: false, error: catError.message };
    }

    // Get items
    let itemsQuery = supabase
        .from("menu_items")
        .select("id, name, description, price, category_id, is_available")
        .eq("venue_id", venueId)
        .eq("is_available", true);

    if (categoryId) {
        itemsQuery = itemsQuery.eq("category_id", categoryId);
    }

    const { data: items, error: itemError } = await itemsQuery;

    if (itemError) {
        return { success: false, error: itemError.message };
    }

    return {
        success: true,
        data: {
            categories: categories || [],
            category_ids: categories?.map((c: { id: string }) => c.id) || [],
            items: items || [],
            item_ids: items?.map((i: { id: string }) => i.id) || [],
        },
    };
}

async function guestGetProfile(
    input: Record<string, unknown>,
    supabase: SupabaseClient
): Promise<ToolResult> {
    const guestId = input.guest_id as string;

    const { data, error } = await supabase
        .from("guest_preferences")
        .select("dietary_restrictions, favorite_cuisines, spice_preference, allergies")
        .eq("user_id", guestId)
        .single();

    if (error && error.code !== "PGRST116") { // PGRST116 = not found
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: data || { dietary_restrictions: [], favorite_cuisines: [], allergies: [] },
    };
}

async function uiCompose(
    input: Record<string, unknown>,
    context: { venue_id?: string; user_id?: string; correlation_id?: string }
): Promise<ToolResult> {
    const screen = input.screen as string;
    const sections = input.sections as Section[];
    const venueId = (input.venue_id as string) || context.venue_id;
    const country = input.country as Country | undefined;

    const plan = createUIPlan(
        screen as Parameters<typeof createUIPlan>[0],
        sections,
        {
            correlation_id: context.correlation_id,
            venue_id: venueId,
            guest_id: context.user_id,
            country,
            cacheTTL: 300,
        }
    );

    // Validate before returning
    const validation = validateUIPlan(plan);
    if (!validation.valid) {
        return {
            success: false,
            error: `Invalid UIPlan: ${validation.errors.join(", ")}`,
        };
    }

    return { success: true, data: plan };
}

function uiValidate(input: Record<string, unknown>): ToolResult {
    const plan = input.plan;
    const validation = validateUIPlan(plan);

    return {
        success: validation.valid,
        data: validation,
        error: validation.valid ? undefined : validation.errors.join(", "),
    };
}
