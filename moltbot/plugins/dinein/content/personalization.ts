/**
 * Personalization
 * 
 * Guest profile signals with privacy boundaries.
 */

import { Cuisine, PriceBand, Allergen } from "./taxonomy.ts";

/**
 * Guest profile (minimal storage).
 */
export interface GuestProfile {
    guestId: string;
    preferredCuisines: Cuisine[];
    budgetBand: PriceBand;
    spiceLevel: "mild" | "medium" | "hot" | "extra_hot" | null;
    allergies: Allergen[];
    avoidIngredients: string[];
}

/**
 * Behavioral signals (session-scoped or short-term).
 */
export interface BehavioralSignals {
    recentlyViewedVenueIds: string[];
    recentlyOrderedItemIds: string[];
    recentlyOrderedCategories: string[];
    conversionSignals: {
        addToCartCount: number;
        checkoutOpenCount: number;
        submitSuccessCount: number;
    };
}

/**
 * Privacy boundaries for personalization.
 */
export const PERSONALIZATION_PRIVACY = {
    // What we DO NOT store
    forbidden: [
        "exact_location_history",
        "sensitive_pii",
        "health_records",
        "financial_details"
    ],

    // What we store but never share with venues
    internalOnly: [
        "preferredCuisines",
        "budgetBand",
        "allergies",
        "recentlyViewedVenueIds"
    ],

    // What venues can see (aggregate only)
    venueVisible: [
        "aggregate_order_stats",
        "anonymous_conversion_rates"
    ],

    // Retention rules
    retention: {
        guestProfile: "indefinite_unless_deleted",
        behavioralSignals: "30_days",
        sessionData: "session_only"
    }
};

/**
 * Apply personalization boosts to ranking scores.
 */
export function getPersonalizationBoosts(
    profile: GuestProfile | null,
    signals: BehavioralSignals | null
): Map<string, number> {
    const boosts = new Map<string, number>();

    if (!profile) return boosts;

    // Boost for cuisines
    for (const cuisine of profile.preferredCuisines) {
        boosts.set(`cuisine:${cuisine}`, 0.1);
    }

    // Boost for budget band match
    boosts.set(`budget:${profile.budgetBand}`, 0.05);

    // Negative boost for allergy-conflict venues (handled separately in ranking)

    // Recency dampening (avoid repeating same suggestions)
    if (signals) {
        for (const venueId of signals.recentlyViewedVenueIds.slice(0, 3)) {
            boosts.set(`venue:${venueId}`, -0.05); // slight dampen for recency
        }
    }

    return boosts;
}

/**
 * Check if an item has allergen conflicts with guest profile.
 */
export function hasAllergenConflict(
    itemAllergens: string[],
    guestAllergies: Allergen[]
): boolean {
    return itemAllergens.some(allergen =>
        guestAllergies.includes(allergen as Allergen)
    );
}
