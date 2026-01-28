/**
 * UIPlan v1 - TypeScript Types
 *
 * Deterministic UI contract for Moltbot UI Orchestrator.
 * Both Flutter and PWA clients render from this schema.
 */

// =============================================================================
// ENUMS
// =============================================================================

export const UI_PLAN_VERSION = "ui_plan.v1" as const;

export const SCREEN_NAMES = [
    "home",
    "search",
    "venue",
    "menu",
    "item",
    "checkout",
    "orders",
    "chat_waiter",
    "profile",
] as const;
export type ScreenName = (typeof SCREEN_NAMES)[number];

export const LAYOUT_TYPES = ["scroll", "tabs", "sheet", "modal"] as const;
export type LayoutType = (typeof LAYOUT_TYPES)[number];

export const SECTION_TYPES = [
    "hero",
    "chips",
    "carousel",
    "grid",
    "list",
    "banner",
    "metrics",
    "divider",
    "cta",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const ITEM_KINDS = [
    "venue",
    "menu_item",
    "offer",
    "category",
    "info",
    "action",
] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];

export const ACTOR_TYPES = ["guest", "staff", "admin"] as const;
export type ActorType = (typeof ACTOR_TYPES)[number];

export const EMPHASIS_LEVELS = ["low", "medium", "high"] as const;
export type EmphasisLevel = (typeof EMPHASIS_LEVELS)[number];

export const DENSITY_TYPES = ["compact", "regular"] as const;
export type DensityType = (typeof DENSITY_TYPES)[number];

export const ASPECT_RATIOS = ["1:1", "4:3", "16:9"] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export const CACHE_VARY_BY = ["location", "locale", "guestProfile", "venueId"] as const;
export type CacheVaryBy = (typeof CACHE_VARY_BY)[number];

// =============================================================================
// TYPES
// =============================================================================

export interface UIPlanTenant {
    tenantId: string;
    venueId?: string | null;
}

export interface UIPlanActor {
    actorType: ActorType;
    actorId: string;
    locale?: string | null;
    currency?: string | null;
}

export interface UIPlanSession {
    sessionKey: string;
    actor: UIPlanActor;
}

export interface UIPlanBreadcrumb {
    label: string;
    actionRef?: string | null;
}

export interface UIPlanScreen {
    name: ScreenName;
    title: string;
    layout: LayoutType;
    breadcrumbs?: UIPlanBreadcrumb[];
}

export interface SectionStyle {
    emphasis?: EmphasisLevel;
    density?: DensityType;
    themeToken?: string | null;
}

export interface SectionItemMeta {
    badge?: string | null;
    priceText?: string | null;
    ratingText?: string | null;
    distanceText?: string | null;
    availabilityText?: string | null;
}

export interface SectionItemMedia {
    imageUrl?: string | null;
    aspect?: AspectRatio | null;
}

export interface SectionItem {
    kind: ItemKind;
    id: string;
    primaryText: string;
    secondaryText?: string | null;
    meta?: SectionItemMeta;
    media?: SectionItemMedia;
    actionRef?: string | null;
}

export interface UIPlanSection {
    id: string;
    type: SectionType;
    title: string | null;
    subtitle?: string | null;
    style?: SectionStyle;
    items: SectionItem[];
}

export interface UIPlanAction {
    intent: ActionIntent;
    params?: Record<string, unknown>;
    requiresConfirmation?: boolean | null;
    confirmationText?: string | null;
}

export interface UIPlanActions {
    byId: Record<string, UIPlanAction>;
}

export interface UIPlanCache {
    ttlSeconds: number;
    varyBy?: CacheVaryBy[];
}

export interface UIPlanDebugToolCall {
    tool: string;
    correlationId: string;
}

export interface UIPlanDebug {
    explanation?: string | null;
    sourceToolCalls?: UIPlanDebugToolCall[];
}

/**
 * The main UIPlan type.
 * This is what the UI Orchestrator outputs and clients render.
 */
export interface UIPlan {
    version: typeof UI_PLAN_VERSION;
    planId: string;
    generatedAt: string;
    tenant: UIPlanTenant;
    session: UIPlanSession;
    screen: UIPlanScreen;
    sections: UIPlanSection[];
    actions: UIPlanActions;
    cache: UIPlanCache;
    debug?: UIPlanDebug;
}

// =============================================================================
// ACTION INTENTS
// =============================================================================

export const ACTION_INTENTS = [
    "openHome",
    "openSearch",
    "openVenue",
    "openMenu",
    "openItem",
    "applyFilter",
    "clearFilters",
    "startVisit",
    "addToCart",
    "updateCartItem",
    "removeFromCart",
    "openCheckout",
    "confirmOrder",
    "openChatWaiter",
    "sendWaiterMessage",
    "callStaff",
    "requestBill",
    "openOrders",
    "trackOrder",
    "openExternalUrl",
] as const;
export type ActionIntent = (typeof ACTION_INTENTS)[number];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a string is a valid action intent.
 */
export function isValidIntent(intent: string): intent is ActionIntent {
    return ACTION_INTENTS.includes(intent as ActionIntent);
}

/**
 * Check if a string is a valid screen name.
 */
export function isValidScreenName(name: string): name is ScreenName {
    return SCREEN_NAMES.includes(name as ScreenName);
}

/**
 * Check if a string is a valid section type.
 */
export function isValidSectionType(type: string): type is SectionType {
    return SECTION_TYPES.includes(type as SectionType);
}

/**
 * Generate a unique plan ID.
 */
export function generatePlanId(): string {
    return `plan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
