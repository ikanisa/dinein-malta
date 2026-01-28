/**
 * Guest Intelligence Manager
 * 
 * Handles guest preferences, memory, and order history
 * for personalized AI recommendations.
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================================================================
// TYPES
// =============================================================================

export type PreferenceType =
    | "dietary"
    | "allergy"
    | "dislike"
    | "favorite"
    | "spice_level"
    | "note";

export interface GuestPreference {
    id: string;
    user_id: string;
    preference_type: PreferenceType;
    value: string;
    venue_id: string | null;
    created_at: string;
}

export interface GuestMemory {
    id: string;
    user_id: string;
    memory_key: string;
    memory_value: string;
    venue_id: string | null;
    confidence: number;
    last_mentioned: string;
}

export interface OrderAnalytics {
    menu_item_id: string;
    item_name: string;
    category_name: string;
    order_count: number;
    last_ordered: string;
}

export interface PopularItem {
    menu_item_id: string;
    item_name: string;
    total_orders: number;
    unique_customers: number;
}

// =============================================================================
// PREFERENCE MANAGEMENT
// =============================================================================

/**
 * Get all preferences for a guest
 */
export async function getGuestPreferences(
    supabase: SupabaseClient,
    userId: string,
    venueId?: string
): Promise<GuestPreference[]> {
    const query = supabase
        .from("guest_preferences")
        .select("*")
        .eq("user_id", userId);

    // Include global preferences (venue_id is null) and venue-specific
    if (venueId) {
        query.or(`venue_id.is.null,venue_id.eq.${venueId}`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
        console.error("[guest-intelligence] Error fetching preferences:", error);
        return [];
    }

    return data || [];
}

/**
 * Save a new preference for a guest
 */
export async function saveGuestPreference(
    supabase: SupabaseClient,
    userId: string,
    preferenceType: PreferenceType,
    value: string,
    venueId?: string
): Promise<{ success: boolean; preference?: GuestPreference; error?: string }> {
    const { data, error } = await supabase
        .from("guest_preferences")
        .upsert({
            user_id: userId,
            preference_type: preferenceType,
            value: value.toLowerCase().trim(),
            venue_id: venueId || null,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: "user_id,preference_type,value,venue_id",
        })
        .select()
        .single();

    if (error) {
        console.error("[guest-intelligence] Error saving preference:", error);
        return { success: false, error: error.message };
    }

    return { success: true, preference: data };
}

/**
 * Remove a preference
 */
export async function removeGuestPreference(
    supabase: SupabaseClient,
    userId: string,
    preferenceType: PreferenceType,
    value: string
): Promise<boolean> {
    const { error } = await supabase
        .from("guest_preferences")
        .delete()
        .eq("user_id", userId)
        .eq("preference_type", preferenceType)
        .eq("value", value.toLowerCase().trim());

    return !error;
}

// =============================================================================
// MEMORY MANAGEMENT
// =============================================================================

/**
 * Get guest memory (things AI remembers)
 */
export async function getGuestMemory(
    supabase: SupabaseClient,
    userId: string,
    venueId?: string
): Promise<GuestMemory[]> {
    const query = supabase
        .from("guest_memory")
        .select("*")
        .eq("user_id", userId);

    if (venueId) {
        query.or(`venue_id.is.null,venue_id.eq.${venueId}`);
    }

    const { data, error } = await query.order("last_mentioned", { ascending: false });

    if (error) {
        console.error("[guest-intelligence] Error fetching memory:", error);
        return [];
    }

    return data || [];
}

/**
 * Save something AI learned about the guest
 */
export async function saveGuestMemory(
    supabase: SupabaseClient,
    userId: string,
    key: string,
    value: string,
    venueId?: string,
    confidence = 1.0
): Promise<boolean> {
    const { error } = await supabase
        .from("guest_memory")
        .upsert({
            user_id: userId,
            memory_key: key,
            memory_value: value,
            venue_id: venueId || null,
            confidence,
            last_mentioned: new Date().toISOString(),
        }, {
            onConflict: "user_id,memory_key,venue_id",
        });

    if (error) {
        console.error("[guest-intelligence] Error saving memory:", error);
        return false;
    }

    return true;
}

// =============================================================================
// ORDER HISTORY & RECOMMENDATIONS
// =============================================================================

/**
 * Get guest's order history at a venue
 */
export async function getGuestOrderHistory(
    supabase: SupabaseClient,
    userId: string,
    venueId: string,
    limit = 10
): Promise<OrderAnalytics[]> {
    const { data, error } = await supabase
        .from("guest_order_analytics")
        .select("*")
        .eq("user_id", userId)
        .eq("venue_id", venueId)
        .order("last_ordered", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("[guest-intelligence] Error fetching order history:", error);
        return [];
    }

    return data || [];
}

/**
 * Get popular items at a venue for recommendations
 */
export async function getVenuePopularItems(
    supabase: SupabaseClient,
    venueId: string,
    limit = 5
): Promise<PopularItem[]> {
    const { data, error } = await supabase
        .from("venue_popular_items")
        .select("*")
        .eq("venue_id", venueId)
        .order("total_orders", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("[guest-intelligence] Error fetching popular items:", error);
        return [];
    }

    return data || [];
}

/**
 * Get personalized recommendations based on preferences and history
 */
export async function getPersonalizedRecommendations(
    supabase: SupabaseClient,
    userId: string,
    venueId: string,
    limit = 5
): Promise<{ items: PopularItem[]; reason: string }> {
    // Get preferences to filter
    const preferences = await getGuestPreferences(supabase, userId, venueId);
    const allergies = preferences
        .filter(p => p.preference_type === "allergy")
        .map(p => p.value);
    const dislikes = preferences
        .filter(p => p.preference_type === "dislike")
        .map(p => p.value);
    const dietary = preferences
        .filter(p => p.preference_type === "dietary")
        .map(p => p.value);

    // Get past orders for "you might also like"
    const pastOrders = await getGuestOrderHistory(supabase, userId, venueId, 5);

    // Get popular items
    const popular = await getVenuePopularItems(supabase, venueId, 10);

    // Filter out allergies and dislikes (basic filtering)
    const filtered = popular.filter(item => {
        const nameLower = item.item_name.toLowerCase();
        return !allergies.some(a => nameLower.includes(a)) &&
            !dislikes.some(d => nameLower.includes(d));
    });

    // Build reason
    let reason = "Popular with other guests";
    if (pastOrders.length > 0) {
        reason = `Based on your history with ${pastOrders[0].item_name}`;
    }
    if (dietary.length > 0) {
        reason += ` (filtered for ${dietary.join(", ")})`;
    }

    return {
        items: filtered.slice(0, limit),
        reason,
    };
}

// =============================================================================
// PREFERENCE SUMMARY FOR SYSTEM PROMPT
// =============================================================================

/**
 * Format preferences as context for the AI system prompt
 */
export async function formatPreferencesForPrompt(
    supabase: SupabaseClient,
    userId: string,
    venueId?: string
): Promise<string> {
    const preferences = await getGuestPreferences(supabase, userId, venueId);
    const memory = await getGuestMemory(supabase, userId, venueId);

    if (preferences.length === 0 && memory.length === 0) {
        return "";
    }

    const lines: string[] = [];
    lines.push("GUEST PROFILE:");

    // Group preferences by type
    const grouped: Record<string, string[]> = {};
    for (const pref of preferences) {
        if (!grouped[pref.preference_type]) {
            grouped[pref.preference_type] = [];
        }
        grouped[pref.preference_type].push(pref.value);
    }

    if (grouped.dietary) {
        lines.push(`- Dietary: ${grouped.dietary.join(", ")}`);
    }
    if (grouped.allergy) {
        lines.push(`- ⚠️ Allergies: ${grouped.allergy.join(", ")}`);
    }
    if (grouped.dislike) {
        lines.push(`- Dislikes: ${grouped.dislike.join(", ")}`);
    }
    if (grouped.favorite) {
        lines.push(`- Favorites: ${grouped.favorite.join(", ")}`);
    }
    if (grouped.spice_level) {
        lines.push(`- Spice preference: ${grouped.spice_level[0]}`);
    }

    // Add memories
    for (const mem of memory.slice(0, 5)) {
        lines.push(`- ${mem.memory_key}: ${mem.memory_value}`);
    }

    return lines.join("\n");
}
