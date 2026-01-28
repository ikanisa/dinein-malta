/**
 * Merchandising
 * 
 * Ranking factors and layout rules for venue/item presentation.
 */

export interface VenueForRanking {
    venueId: string;
    distanceKm: number;
    isOpenNow: boolean;
    rating: number; // 0-5
    hasActiveOffers: boolean;
    cuisines: string[];
    lastContentUpdate: Date;
}

export interface RankingContext {
    guestCuisines: string[];
    guestBudgetBand: string;
    currentTime: Date;
}

/**
 * Calculate a ranking score for a venue (higher = better).
 */
export function calculateVenueScore(
    venue: VenueForRanking,
    context: RankingContext
): number {
    let score = 50; // base

    // Distance factor (closer = higher)
    if (venue.distanceKm < 1) score += 15;
    else if (venue.distanceKm < 3) score += 10;
    else if (venue.distanceKm < 5) score += 5;
    else score -= Math.min(20, venue.distanceKm * 2);

    // Open now boost
    if (venue.isOpenNow) score += 20;

    // Rating boost
    score += (venue.rating / 5) * 15;

    // Active offers boost
    if (venue.hasActiveOffers) score += 10;

    // Cuisine match boost
    const cuisineMatch = venue.cuisines.some(c => context.guestCuisines.includes(c));
    if (cuisineMatch) score += 10;

    // Freshness boost (updated within 7 days)
    const daysSinceUpdate = (context.currentTime.getTime() - venue.lastContentUpdate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) score += 5;

    return Math.max(0, Math.min(100, score));
}

/**
 * Default layout sections for venue screen.
 */
export const VENUE_SCREEN_LAYOUT = {
    sections: [
        { id: "hero", type: "hero", title: null },
        { id: "categories", type: "chips", title: "Menu" },
        { id: "featured", type: "item_carousel", title: "Featured" },
        { id: "offers", type: "banner", title: "Special Offers" },
        { id: "actions", type: "cta_row", title: null }
    ]
};

/**
 * Default layout rules for menu.
 */
export const MENU_LAYOUT_RULES = {
    showCategoriesWithCounts: true,
    showBadges: ["signature", "popular", "new"],
    showAllergyWarnings: true,
    maxItemsPerCategoryPreview: 5,
    sortItemsBy: "popularity" as "popularity" | "price_asc" | "price_desc" | "name"
};

/**
 * Home screen ranking configuration.
 */
export const HOME_RANKING_CONFIG = {
    factors: [
        { name: "distance", weight: 0.25 },
        { name: "openNow", weight: 0.20 },
        { name: "rating", weight: 0.15 },
        { name: "activeOffers", weight: 0.10 },
        { name: "cuisineMatch", weight: 0.15 },
        { name: "freshness", weight: 0.10 },
        { name: "personalization", weight: 0.05 }
    ]
};
