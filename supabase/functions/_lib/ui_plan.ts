/**
 * UIPlan v1 Schema Validation for Moltbot UI Orchestrator
 *
 * Server-side validation ensuring:
 * - Schema compliance
 * - ID reference validation (no invented IDs)
 * - Intent param validation
 * - Domain allowlist for external URLs
 * - PII detection
 */

// =============================================================================
// TYPES (mirrored from @dinein/core for edge function use)
// =============================================================================

export const UI_PLAN_VERSION = "ui_plan.v1" as const;

export const SCREEN_NAMES = [
    "home", "search", "venue", "menu", "item",
    "checkout", "orders", "chat_waiter", "profile",
] as const;
export type ScreenName = (typeof SCREEN_NAMES)[number];

export const LAYOUT_TYPES = ["scroll", "tabs", "sheet", "modal"] as const;
export type LayoutType = (typeof LAYOUT_TYPES)[number];

export const SECTION_TYPES = [
    "hero", "chips", "carousel", "grid", "list",
    "banner", "metrics", "divider", "cta",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const ITEM_KINDS = [
    "venue", "menu_item", "offer", "category", "info", "action",
] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];

export const ACTOR_TYPES = ["guest", "staff", "admin"] as const;
export type ActorType = (typeof ACTOR_TYPES)[number];

export const ACTION_INTENTS = [
    "openHome", "openSearch", "openVenue", "openMenu", "openItem",
    "applyFilter", "clearFilters", "startVisit", "addToCart",
    "updateCartItem", "removeFromCart", "openCheckout", "confirmOrder",
    "openChatWaiter", "sendWaiterMessage", "callStaff", "requestBill",
    "openOrders", "trackOrder", "openExternalUrl",
] as const;
export type ActionIntent = (typeof ACTION_INTENTS)[number];

// =============================================================================
// INTENT PARAM DEFINITIONS
// =============================================================================

interface IntentParamDef {
    required: string[];
    optional: string[];
}

const INTENT_PARAMS: Record<ActionIntent, IntentParamDef> = {
    openHome: { required: [], optional: ["referrer"] },
    openSearch: { required: [], optional: ["query", "filters"] },
    openVenue: { required: ["venueId"], optional: ["referrer"] },
    openMenu: { required: ["venueId"], optional: ["categoryId"] },
    openItem: { required: ["itemId"], optional: ["venueId"] },
    applyFilter: { required: ["filters"], optional: ["scope"] },
    clearFilters: { required: [], optional: ["scope"] },
    startVisit: { required: ["venueId"], optional: ["tableId", "partySize"] },
    addToCart: { required: ["visitId", "itemId", "qty"], optional: ["addons", "notes"] },
    updateCartItem: { required: ["visitId", "lineId", "patch"], optional: [] },
    removeFromCart: { required: ["visitId", "lineId"], optional: [] },
    openCheckout: { required: ["visitId"], optional: [] },
    confirmOrder: { required: ["visitId"], optional: ["paymentMethod", "tip"] },
    openChatWaiter: { required: ["visitId"], optional: [] },
    sendWaiterMessage: { required: ["visitId", "message"], optional: ["attachments"] },
    callStaff: { required: ["visitId", "reason"], optional: ["priority"] },
    requestBill: { required: ["visitId"], optional: [] },
    openOrders: { required: [], optional: ["venueId"] },
    trackOrder: { required: ["orderId"], optional: [] },
    openExternalUrl: { required: ["url"], optional: ["label"] },
};

// =============================================================================
// STATE-CHANGING INTENTS
// =============================================================================

const STATE_CHANGING_INTENTS: ActionIntent[] = [
    "startVisit", "addToCart", "updateCartItem", "removeFromCart",
    "confirmOrder", "sendWaiterMessage", "callStaff", "requestBill",
];

// =============================================================================
// DOMAIN ALLOWLIST
// =============================================================================

const EXTERNAL_URL_ALLOWLIST = [
    "*.mtn.co.rw", "momo.mtn.rw",
    "revolut.me", "pay.revolut.com",
    "instagram.com", "www.instagram.com",
    "facebook.com", "www.facebook.com",
    "google.com/maps", "maps.google.com",
];

function isAllowedExternalUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase();

        for (const pattern of EXTERNAL_URL_ALLOWLIST) {
            if (pattern.startsWith("*.")) {
                const suffix = pattern.slice(1);
                if (host.endsWith(suffix) || host === pattern.slice(2)) return true;
            } else if (pattern.includes("/")) {
                const fullMatch = `${host}${parsed.pathname}`;
                if (fullMatch.startsWith(pattern)) return true;
            } else {
                if (host === pattern) return true;
            }
        }
        return false;
    } catch {
        return false;
    }
}

// =============================================================================
// PII DETECTION
// =============================================================================

const PII_PATTERNS = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    /\b\d{10,15}\b/, // Phone numbers
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // US phone format
];

function containsPII(text: string): boolean {
    return PII_PATTERNS.some((pattern) => pattern.test(text));
}

function scanForPII(obj: unknown, path = ""): string[] {
    const findings: string[] = [];

    if (typeof obj === "string" && containsPII(obj)) {
        findings.push(`PII found at ${path}`);
    } else if (Array.isArray(obj)) {
        obj.forEach((item, i) => {
            findings.push(...scanForPII(item, `${path}[${i}]`));
        });
    } else if (obj && typeof obj === "object") {
        for (const [key, value] of Object.entries(obj)) {
            findings.push(...scanForPII(value, path ? `${path}.${key}` : key));
        }
    }

    return findings;
}

// =============================================================================
// VALIDATION RESULT
// =============================================================================

export interface UIPlanValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

// =============================================================================
// MAIN VALIDATION FUNCTION
// =============================================================================

export interface UIPlanValidationContext {
    /** Known venue IDs from tool calls */
    knownVenueIds?: Set<string>;
    /** Known item IDs from tool calls */
    knownItemIds?: Set<string>;
    /** Known offer IDs from tool calls */
    knownOfferIds?: Set<string>;
    /** Expected tenant ID */
    expectedTenantId?: string;
    /** Expected session key */
    expectedSessionKey?: string;
    /** Allow PII (usually false) */
    allowPII?: boolean;
}

/**
 * Validates a UIPlan document.
 * Performs schema validation, ID reference checks, intent validation, and PII scanning.
 */
export function validateUIPlan(
    plan: unknown,
    context: UIPlanValidationContext = {}
): UIPlanValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!plan || typeof plan !== "object") {
        return { valid: false, errors: ["UIPlan must be an object"], warnings: [] };
    }

    const p = plan as Record<string, unknown>;

    // Version check
    if (p.version !== UI_PLAN_VERSION) {
        errors.push(`Invalid version: expected "${UI_PLAN_VERSION}", got "${p.version}"`);
    }

    // Required fields
    if (!p.planId || typeof p.planId !== "string" || p.planId.length < 8) {
        errors.push("planId must be a string with minimum 8 characters");
    }

    if (!p.generatedAt || typeof p.generatedAt !== "string") {
        errors.push("generatedAt is required (ISO date string)");
    }

    // Tenant validation
    if (!p.tenant || typeof p.tenant !== "object") {
        errors.push("tenant is required");
    } else {
        const tenant = p.tenant as Record<string, unknown>;
        if (!tenant.tenantId || typeof tenant.tenantId !== "string") {
            errors.push("tenant.tenantId is required");
        }
        if (context.expectedTenantId && tenant.tenantId !== context.expectedTenantId) {
            errors.push(`tenant.tenantId mismatch: expected "${context.expectedTenantId}"`);
        }
    }

    // Session validation
    if (!p.session || typeof p.session !== "object") {
        errors.push("session is required");
    } else {
        const session = p.session as Record<string, unknown>;
        if (!session.sessionKey || typeof session.sessionKey !== "string") {
            errors.push("session.sessionKey is required");
        }
        if (context.expectedSessionKey && session.sessionKey !== context.expectedSessionKey) {
            errors.push(`session.sessionKey mismatch`);
        }
        if (!session.actor || typeof session.actor !== "object") {
            errors.push("session.actor is required");
        } else {
            const actor = session.actor as Record<string, unknown>;
            if (!ACTOR_TYPES.includes(actor.actorType as ActorType)) {
                errors.push(`Invalid actorType: "${actor.actorType}"`);
            }
        }
    }

    // Screen validation
    if (!p.screen || typeof p.screen !== "object") {
        errors.push("screen is required");
    } else {
        const screen = p.screen as Record<string, unknown>;
        if (!SCREEN_NAMES.includes(screen.name as ScreenName)) {
            errors.push(`Invalid screen.name: "${screen.name}"`);
        }
        if (!LAYOUT_TYPES.includes(screen.layout as LayoutType)) {
            errors.push(`Invalid screen.layout: "${screen.layout}"`);
        }
    }

    // Sections validation
    if (!Array.isArray(p.sections)) {
        errors.push("sections must be an array");
    } else {
        if (p.sections.length === 0) {
            warnings.push("sections array is empty");
        }
        if (p.sections.length > 50) {
            errors.push("sections exceeds maximum of 50");
        }

        for (let i = 0; i < Math.min(p.sections.length, 50); i++) {
            const section = p.sections[i] as Record<string, unknown>;
            if (!SECTION_TYPES.includes(section.type as SectionType)) {
                errors.push(`sections[${i}].type is invalid: "${section.type}"`);
            }

            // Validate items
            if (Array.isArray(section.items)) {
                if (section.items.length > 100) {
                    errors.push(`sections[${i}].items exceeds maximum of 100`);
                }

                for (let j = 0; j < Math.min(section.items.length, 100); j++) {
                    const item = section.items[j] as Record<string, unknown>;
                    if (!ITEM_KINDS.includes(item.kind as ItemKind)) {
                        errors.push(`sections[${i}].items[${j}].kind is invalid: "${item.kind}"`);
                    }

                    // ID reference validation
                    if (item.kind === "venue" && context.knownVenueIds) {
                        if (!context.knownVenueIds.has(item.id as string)) {
                            errors.push(`Invented venue ID: "${item.id}" at sections[${i}].items[${j}]`);
                        }
                    }
                    if (item.kind === "menu_item" && context.knownItemIds) {
                        if (!context.knownItemIds.has(item.id as string)) {
                            errors.push(`Invented item ID: "${item.id}" at sections[${i}].items[${j}]`);
                        }
                    }
                    if (item.kind === "offer" && context.knownOfferIds) {
                        if (!context.knownOfferIds.has(item.id as string)) {
                            errors.push(`Invented offer ID: "${item.id}" at sections[${i}].items[${j}]`);
                        }
                    }
                }
            }
        }
    }

    // Actions validation
    if (!p.actions || typeof p.actions !== "object") {
        errors.push("actions is required");
    } else {
        const actions = p.actions as { byId?: Record<string, unknown> };
        if (!actions.byId || typeof actions.byId !== "object") {
            errors.push("actions.byId is required");
        } else {
            for (const [actionId, action] of Object.entries(actions.byId)) {
                const a = action as Record<string, unknown>;

                if (!ACTION_INTENTS.includes(a.intent as ActionIntent)) {
                    errors.push(`Unknown intent "${a.intent}" for action "${actionId}"`);
                    continue;
                }

                const intent = a.intent as ActionIntent;
                const params = (a.params as Record<string, unknown>) || {};
                const def = INTENT_PARAMS[intent];

                // Check required params
                for (const req of def.required) {
                    if (!(req in params) || params[req] === null || params[req] === undefined) {
                        errors.push(`Action "${actionId}": missing required param "${req}" for intent "${intent}"`);
                    }
                }

                // Check unknown params
                const allKnown = new Set([...def.required, ...def.optional]);
                for (const key of Object.keys(params)) {
                    if (!allKnown.has(key)) {
                        warnings.push(`Action "${actionId}": unknown param "${key}"`);
                    }
                }

                // External URL validation
                if (intent === "openExternalUrl" && typeof params.url === "string") {
                    if (!isAllowedExternalUrl(params.url)) {
                        errors.push(`Action "${actionId}": URL not in allowlist: "${params.url}"`);
                    }
                }

                // State-changing intent confirmation check
                if (STATE_CHANGING_INTENTS.includes(intent) && !a.requiresConfirmation) {
                    warnings.push(`Action "${actionId}": state-changing intent "${intent}" should have requiresConfirmation=true`);
                }
            }
        }
    }

    // Cache validation
    if (!p.cache || typeof p.cache !== "object") {
        errors.push("cache is required");
    } else {
        const cache = p.cache as Record<string, unknown>;
        if (typeof cache.ttlSeconds !== "number" || cache.ttlSeconds < 1 || cache.ttlSeconds > 900) {
            errors.push("cache.ttlSeconds must be 1-900");
        }
    }

    // PII scan (unless explicitly allowed)
    if (!context.allowPII) {
        const piiFindings = scanForPII(p);
        if (piiFindings.length > 0) {
            errors.push(...piiFindings);
        }
    }

    return { valid: errors.length === 0, errors, warnings };
}

// =============================================================================
// BUILDER HELPERS
// =============================================================================

/**
 * Generate a unique plan ID.
 */
export function generatePlanId(): string {
    return `plan_${Date.now().toString(36)}_${crypto.randomUUID().split("-")[0]}`;
}

/**
 * Creates a minimal valid UIPlan for testing.
 */
export function createMinimalUIPlan(screen: ScreenName): Record<string, unknown> {
    return {
        version: UI_PLAN_VERSION,
        planId: generatePlanId(),
        generatedAt: new Date().toISOString(),
        tenant: { tenantId: "dinein" },
        session: {
            sessionKey: "sess_12345678",
            actor: { actorType: "guest", actorId: "guest_abc" },
        },
        screen: { name: screen, title: "Screen", layout: "scroll" },
        sections: [
            {
                id: "sec_001",
                type: "list",
                title: null,
                items: [],
            },
        ],
        actions: { byId: {} },
        cache: { ttlSeconds: 300 },
    };
}
