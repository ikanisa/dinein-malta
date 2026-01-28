/**
 * Content Taxonomy
 * 
 * Standard categories, cuisines, tags, and occasions for DineIn venues and items.
 */

export const VENUE_TYPES = [
    "bar",
    "restaurant",
    "cafe",
    "lounge",
    "club",
    "hotel_bar"
] as const;
export type VenueType = typeof VENUE_TYPES[number];

export const CUISINES = [
    "rwandan",
    "african_fusion",
    "grill_bbq",
    "italian",
    "indian",
    "chinese",
    "middle_eastern",
    "seafood",
    "vegan_vegetarian",
    "street_food"
] as const;
export type Cuisine = typeof CUISINES[number];

export const OCCASIONS = [
    "date_night",
    "family",
    "business",
    "birthday",
    "sports_night",
    "live_music",
    "late_night"
] as const;
export type Occasion = typeof OCCASIONS[number];

export const VENUE_TAGS = [
    "open_late",
    "happy_hour",
    "live_dj",
    "live_band",
    "outdoor_seating",
    "rooftop",
    "wifi",
    "cocktail_bar",
    "beer_garden"
] as const;
export type VenueTag = typeof VENUE_TAGS[number];

export const ITEM_TAGS = [
    "signature",
    "popular",
    "new",
    "spicy",
    "vegetarian",
    "vegan",
    "gluten_free_option",
    "shareable",
    "quick"
] as const;
export type ItemTag = typeof ITEM_TAGS[number];

export const DISCOUNT_TYPES = [
    "percent_off",
    "fixed_amount_off",
    "buy_x_get_y",
    "happy_hour_pricing",
    "bundle",
    "loyalty_perk"
] as const;
export type DiscountType = typeof DISCOUNT_TYPES[number];

export const CONTROLLED_ALLERGENS = [
    "peanuts",
    "tree_nuts",
    "milk",
    "eggs",
    "fish",
    "shellfish",
    "soy",
    "wheat",
    "sesame"
] as const;
export type Allergen = typeof CONTROLLED_ALLERGENS[number];

export const PRICE_BANDS = ["$", "$$", "$$$", "$$$$"] as const;
export type PriceBand = typeof PRICE_BANDS[number];

/**
 * Check if a value is a valid taxonomy term.
 */
export function isValidTaxonomyTerm(
    type: "venue_type" | "cuisine" | "occasion" | "venue_tag" | "item_tag" | "discount_type" | "allergen",
    value: string
): boolean {
    const lists: Record<string, readonly string[]> = {
        venue_type: VENUE_TYPES,
        cuisine: CUISINES,
        occasion: OCCASIONS,
        venue_tag: VENUE_TAGS,
        item_tag: ITEM_TAGS,
        discount_type: DISCOUNT_TYPES,
        allergen: CONTROLLED_ALLERGENS
    };
    return lists[type]?.includes(value as any) ?? false;
}
