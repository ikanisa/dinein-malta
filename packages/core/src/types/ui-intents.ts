/**
 * UI Intents Catalog
 *
 * Defines all allowed action intents, their required/optional params,
 * and validation rules.
 */

import { type ActionIntent } from "./ui-plan";

// =============================================================================
// INTENT PARAMETER DEFINITIONS
// =============================================================================

export interface IntentParamDef {
    required: string[];
    optional: string[];
    constraints?: string[];
}

/**
 * Maps each intent to its required and optional parameters.
 */
export const INTENT_PARAMS: Record<ActionIntent, IntentParamDef> = {
    openHome: {
        required: [],
        optional: ["referrer"],
    },
    openSearch: {
        required: [],
        optional: ["query", "filters"],
    },
    openVenue: {
        required: ["venueId"],
        optional: ["referrer"],
    },
    openMenu: {
        required: ["venueId"],
        optional: ["categoryId"],
    },
    openItem: {
        required: ["itemId"],
        optional: ["venueId"],
    },
    applyFilter: {
        required: ["filters"],
        optional: ["scope"],
    },
    clearFilters: {
        required: [],
        optional: ["scope"],
    },
    startVisit: {
        required: ["venueId"],
        optional: ["tableId", "partySize"],
    },
    addToCart: {
        required: ["visitId", "itemId", "qty"],
        optional: ["addons", "notes"],
    },
    updateCartItem: {
        required: ["visitId", "lineId", "patch"],
        optional: [],
    },
    removeFromCart: {
        required: ["visitId", "lineId"],
        optional: [],
    },
    openCheckout: {
        required: ["visitId"],
        optional: [],
    },
    confirmOrder: {
        required: ["visitId"],
        optional: ["paymentMethod", "tip"],
    },
    openChatWaiter: {
        required: ["visitId"],
        optional: [],
    },
    sendWaiterMessage: {
        required: ["visitId", "message"],
        optional: ["attachments"],
    },
    callStaff: {
        required: ["visitId", "reason"],
        optional: ["priority"],
    },
    requestBill: {
        required: ["visitId"],
        optional: [],
    },
    openOrders: {
        required: [],
        optional: ["venueId"],
    },
    trackOrder: {
        required: ["orderId"],
        optional: [],
    },
    openExternalUrl: {
        required: ["url"],
        optional: ["label"],
        constraints: ["Must be allowlisted domain or blocked"],
    },
};

// =============================================================================
// DOMAIN ALLOWLIST FOR EXTERNAL URLS
// =============================================================================

/**
 * Allowlist of domains for openExternalUrl intent.
 * Any URL not matching these patterns is blocked.
 */
export const EXTERNAL_URL_ALLOWLIST = [
    // Payment handoffs (per scope rules)
    "*.mtn.co.rw",       // MoMo Rwanda
    "momo.mtn.rw",       // MoMo direct
    "revolut.me",        // Revolut links (Malta)
    "pay.revolut.com",   // Revolut pay
    // Social/info
    "instagram.com",
    "www.instagram.com",
    "facebook.com",
    "www.facebook.com",
    "google.com/maps",   // Map links
    "maps.google.com",
];

/**
 * Check if a URL is allowed for openExternalUrl.
 */
export function isAllowedExternalUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        const host = parsed.hostname.toLowerCase();

        for (const pattern of EXTERNAL_URL_ALLOWLIST) {
            if (pattern.startsWith("*.")) {
                // Wildcard match
                const suffix = pattern.slice(1); // ".domain.com"
                if (host.endsWith(suffix) || host === pattern.slice(2)) {
                    return true;
                }
            } else if (pattern.includes("/")) {
                // Path prefix match
                const fullMatch = `${host}${parsed.pathname}`;
                if (fullMatch.startsWith(pattern)) {
                    return true;
                }
            } else {
                // Exact host match
                if (host === pattern) {
                    return true;
                }
            }
        }
        return false;
    } catch {
        return false;
    }
}

// =============================================================================
// VALIDATION
// =============================================================================

export interface IntentValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Validate an intent's parameters against the catalog.
 */
export function validateIntentParams(
    intent: ActionIntent,
    params: Record<string, unknown> | undefined
): IntentValidationResult {
    const def = INTENT_PARAMS[intent];
    const errors: string[] = [];
    const actualParams = params || {};

    // Check required params
    for (const req of def.required) {
        if (!(req in actualParams) || actualParams[req] === undefined || actualParams[req] === null) {
            errors.push(`Missing required param: ${req}`);
        }
    }

    // Check for unknown params
    const allKnown = new Set([...def.required, ...def.optional]);
    for (const key of Object.keys(actualParams)) {
        if (!allKnown.has(key)) {
            errors.push(`Unknown param: ${key}`);
        }
    }

    // Special validation for openExternalUrl
    if (intent === "openExternalUrl" && typeof actualParams.url === "string") {
        if (!isAllowedExternalUrl(actualParams.url)) {
            errors.push(`URL not in allowlist: ${actualParams.url}`);
        }
    }

    return { valid: errors.length === 0, errors };
}

// =============================================================================
// STATE-CHANGING INTENTS (require confirmation)
// =============================================================================

/**
 * Intents that change state and should have requiresConfirmation=true
 * unless the user has explicitly triggered them.
 */
export const STATE_CHANGING_INTENTS: ActionIntent[] = [
    "startVisit",
    "addToCart",
    "updateCartItem",
    "removeFromCart",
    "confirmOrder",
    "sendWaiterMessage",
    "callStaff",
    "requestBill",
];

/**
 * Check if an intent changes state.
 */
export function isStateChangingIntent(intent: ActionIntent): boolean {
    return STATE_CHANGING_INTENTS.includes(intent);
}
