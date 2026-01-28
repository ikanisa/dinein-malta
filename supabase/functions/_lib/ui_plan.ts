/**
 * UIPlan Schema for Moltbot UI Orchestrator
 * 
 * The UI Orchestrator agent outputs a UIPlan JSON document that
 * Flutter/PWA apps render deterministically. Apps never invent UI;
 * they only render what the backend specifies.
 * 
 * Flow: App Request → Backend → Moltbot → UIPlan → App Render
 */

// =============================================================================
// CORE TYPES
// =============================================================================

export type ScreenType =
    | "home"
    | "venue_menu"
    | "search_results"
    | "cart"
    | "checkout"
    | "order_status"
    | "settings"
    | "venue_detail";

export type SectionType =
    | "featured_venues"
    | "promos"
    | "categories"
    | "menu_items"
    | "cart_items"
    | "order_summary"
    | "payment_options"
    | "recommendations"
    | "search_results"
    | "empty_state"
    | "loading"
    | "error";

export type Country = "RW" | "MT";

// =============================================================================
// SECTION DEFINITIONS
// =============================================================================

export interface BaseSection {
    type: SectionType;
    title?: string;
    subtitle?: string;
}

export interface FeaturedVenuesSection extends BaseSection {
    type: "featured_venues";
    venue_ids: string[];
    layout?: "carousel" | "grid";
}

export interface PromosSection extends BaseSection {
    type: "promos";
    promo_ids: string[];
    layout?: "banner" | "card";
}

export interface CategoriesSection extends BaseSection {
    type: "categories";
    category_ids: string[];
    venue_id: string;
}

export interface MenuItemsSection extends BaseSection {
    type: "menu_items";
    item_ids: string[];
    category_id?: string;
    venue_id: string;
    layout?: "list" | "grid";
}

export interface CartItemsSection extends BaseSection {
    type: "cart_items";
    items: Array<{
        item_id: string;
        quantity: number;
        notes?: string;
        addons?: string[];
    }>;
}

export interface OrderSummarySection extends BaseSection {
    type: "order_summary";
    subtotal: number;
    discount?: number;
    total: number;
    currency: "RWF" | "EUR";
}

export interface PaymentOptionsSection extends BaseSection {
    type: "payment_options";
    options: Array<{
        method: "Cash" | "MoMoUSSD" | "RevolutLink";
        enabled: boolean;
        label: string;
    }>;
    country: Country;
}

export interface RecommendationsSection extends BaseSection {
    type: "recommendations";
    item_ids: string[];
    reason?: string;
}

export interface SearchResultsSection extends BaseSection {
    type: "search_results";
    venue_ids?: string[];
    item_ids?: string[];
    query: string;
    total_results: number;
}

export interface EmptyStateSection extends BaseSection {
    type: "empty_state";
    icon?: string;
    message: string;
    action?: {
        label: string;
        route: string;
    };
}

export interface LoadingSection extends BaseSection {
    type: "loading";
    skeleton_type: "venue_card" | "menu_item" | "generic";
    count?: number;
}

export interface ErrorSection extends BaseSection {
    type: "error";
    error_code: string;
    message: string;
    retry_action?: boolean;
}

export type Section =
    | FeaturedVenuesSection
    | PromosSection
    | CategoriesSection
    | MenuItemsSection
    | CartItemsSection
    | OrderSummarySection
    | PaymentOptionsSection
    | RecommendationsSection
    | SearchResultsSection
    | EmptyStateSection
    | LoadingSection
    | ErrorSection;

// =============================================================================
// UIPLAN DOCUMENT
// =============================================================================

export interface UIPlan {
    /** Schema version for forward compatibility */
    version: "1.0";

    /** Target screen to render */
    screen: ScreenType;

    /** Ordered list of sections to display */
    sections: Section[];

    /** Cache TTL in seconds (client can cache this plan) */
    cacheTTL?: number;

    /** Metadata for debugging/analytics */
    metadata?: {
        correlation_id?: string;
        generated_at?: string;
        guest_id?: string;
        venue_id?: string;
        country?: Country;
    };

    /** Optional navigation hints for the app */
    navigation?: {
        show_cart_pill?: boolean;
        cart_item_count?: number;
        show_back_button?: boolean;
        title?: string;
    };
}

// =============================================================================
// VALIDATION
// =============================================================================

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Validates a UIPlan document against the schema.
 * Returns validation result with any errors found.
 */
export function validateUIPlan(plan: unknown): ValidationResult {
    const errors: string[] = [];

    if (!plan || typeof plan !== "object") {
        return { valid: false, errors: ["UIPlan must be an object"] };
    }

    const p = plan as Record<string, unknown>;

    // Required fields
    if (p.version !== "1.0") {
        errors.push(`Invalid version: expected "1.0", got "${p.version}"`);
    }

    const validScreens: ScreenType[] = [
        "home", "venue_menu", "search_results", "cart",
        "checkout", "order_status", "settings", "venue_detail"
    ];
    if (!validScreens.includes(p.screen as ScreenType)) {
        errors.push(`Invalid screen type: "${p.screen}"`);
    }

    if (!Array.isArray(p.sections)) {
        errors.push("sections must be an array");
    } else {
        const validSectionTypes: SectionType[] = [
            "featured_venues", "promos", "categories", "menu_items",
            "cart_items", "order_summary", "payment_options", "recommendations",
            "search_results", "empty_state", "loading", "error"
        ];

        for (let i = 0; i < p.sections.length; i++) {
            const section = p.sections[i] as Record<string, unknown>;
            if (!section || typeof section !== "object") {
                errors.push(`sections[${i}] must be an object`);
                continue;
            }
            if (!validSectionTypes.includes(section.type as SectionType)) {
                errors.push(`sections[${i}].type is invalid: "${section.type}"`);
            }
        }
    }

    return { valid: errors.length === 0, errors };
}

// =============================================================================
// BUILDER HELPERS
// =============================================================================

/**
 * Creates a new UIPlan with sensible defaults.
 */
export function createUIPlan(
    screen: ScreenType,
    sections: Section[],
    options?: {
        cacheTTL?: number;
        correlation_id?: string;
        venue_id?: string;
        guest_id?: string;
        country?: Country;
    }
): UIPlan {
    return {
        version: "1.0",
        screen,
        sections,
        cacheTTL: options?.cacheTTL ?? 300,
        metadata: {
            correlation_id: options?.correlation_id,
            generated_at: new Date().toISOString(),
            venue_id: options?.venue_id,
            guest_id: options?.guest_id,
            country: options?.country,
        },
    };
}

/**
 * Creates an empty state section.
 */
export function emptyState(message: string, action?: { label: string; route: string }): EmptyStateSection {
    return {
        type: "empty_state",
        message,
        action,
    };
}

/**
 * Creates a loading section with skeleton placeholders.
 */
export function loadingSection(skeleton_type: "venue_card" | "menu_item" | "generic", count = 3): LoadingSection {
    return {
        type: "loading",
        skeleton_type,
        count,
    };
}

/**
 * Creates an error section with retry option.
 */
export function errorSection(error_code: string, message: string, retry = true): ErrorSection {
    return {
        type: "error",
        error_code,
        message,
        retry_action: retry,
    };
}

/**
 * Creates a featured venues section.
 */
export function featuredVenues(venue_ids: string[], title?: string, layout: "carousel" | "grid" = "carousel"): FeaturedVenuesSection {
    return {
        type: "featured_venues",
        venue_ids,
        title,
        layout,
    };
}

/**
 * Creates a menu items section.
 */
export function menuItems(venue_id: string, item_ids: string[], category_id?: string): MenuItemsSection {
    return {
        type: "menu_items",
        venue_id,
        item_ids,
        category_id,
        layout: "list",
    };
}

/**
 * Creates payment options section based on country.
 */
export function paymentOptions(country: Country): PaymentOptionsSection {
    const options = country === "RW"
        ? [
            { method: "Cash" as const, enabled: true, label: "Cash on delivery" },
            { method: "MoMoUSSD" as const, enabled: true, label: "MTN Mobile Money" },
        ]
        : [
            { method: "Cash" as const, enabled: true, label: "Pay at venue" },
            { method: "RevolutLink" as const, enabled: true, label: "Pay with Revolut" },
        ];

    return {
        type: "payment_options",
        options,
        country,
    };
}
