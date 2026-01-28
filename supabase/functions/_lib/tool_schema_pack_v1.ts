/**
 * Tool Schema Pack v1 (MVP)
 * 
 * Defines the minimal, production-grade tool schemas needed to deliver MVP:
 * Home -> Venue -> Menu -> Cart -> Checkout -> Order + Waiter chat.
 */

// =============================================================================
// 1. STANDARD ENVELOPE & RESULT
// =============================================================================

export interface ToolEnvelope<T = unknown> {
    requestId: string;
    sessionKey: string;
    actor: {
        actorType: "guest" | "staff" | "admin";
        actorId: string;
        roles: string[];
        locale: string | null;
    };
    tenant: {
        tenantId: string;
        venueId: string | null;
    };
    mode: "production" | "research";
    timestamp: string; // RFC3339
    input: T;
}

export type ToolResult<T = unknown> = ToolSuccess<T> | ToolError;

export interface ToolSuccess<T = unknown> {
    success: true;
    requestId: string;
    toolCallId: string;
    data: T;
    warnings?: Array<{ code: string; message: string }>;
}

export interface ToolError {
    success: false;
    requestId: string;
    toolCallId: string;
    error: {
        code: ToolErrorCode;
        message: string;
        retryable: boolean;
        details?: Record<string, unknown>;
    };
}

export enum ToolErrorCode {
    AUTH_REQUIRED = "AUTH_REQUIRED",
    FORBIDDEN = "FORBIDDEN",
    TENANT_MISMATCH = "TENANT_MISMATCH",
    NOT_FOUND = "NOT_FOUND",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    RATE_LIMITED = "RATE_LIMITED",
    DEPENDENCY_DOWN = "DEPENDENCY_DOWN",
    CONFLICT = "CONFLICT",
    PRECONDITION_FAILED = "PRECONDITION_FAILED",
    TOOL_TIMEOUT = "TOOL_TIMEOUT",
    INTERNAL_ERROR = "INTERNAL_ERROR",
}

// =============================================================================
// 2. TOOL DEFINITIONS (JSON Schema)
// =============================================================================

export interface ClaudeTool {
    name: string;
    description: string;
    input_schema: {
        type: "object";
        properties: Record<string, unknown>;
        required?: string[];
        additionalProperties?: boolean;
    };
}

export const TOOLS_V1: ClaudeTool[] = [
    // ---- Foundation ----
    {
        name: "tenant.resolve_context",
        description: "Resolve tenant + actor scope from token/headers.",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["authToken"],
            properties: {
                authToken: { type: "string", minLength: 10 },
            },
        },
    },
    {
        name: "policy.check",
        description: "Central policy decision for action/resource.",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["action", "resource", "context"],
            properties: {
                action: { type: "string", minLength: 2 },
                resource: {
                    type: "object",
                    additionalProperties: false,
                    required: ["type", "id"],
                    properties: {
                        type: {
                            type: "string",
                            enum: [
                                "venue",
                                "menu",
                                "item",
                                "offer",
                                "visit",
                                "cart",
                                "order",
                                "service_call",
                                "guest_profile",
                            ],
                        },
                        id: { type: "string" },
                    },
                },
                context: { type: "object" },
            },
        },
    },
    {
        name: "audit.log",
        description: "Immutable audit record (tool call + outcome).",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["eventType", "payload"],
            properties: {
                eventType: { type: "string", minLength: 3 },
                payload: { type: "object" },
            },
        },
    },
    {
        name: "session.get",
        description: "Get scoped working memory for session.",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["sessionKey"],
            properties: {
                sessionKey: { type: "string", minLength: 8 },
            },
        },
    },
    {
        name: "session.set",
        description: "Patch scoped working memory for session.",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["sessionKey", "patch"],
            properties: {
                sessionKey: { type: "string", minLength: 8 },
                patch: { type: "object" },
                ttlSeconds: { type: ["integer", "null"], minimum: 60, maximum: 86400 },
            },
        },
    },
    {
        name: "abuse.check_message",
        description: "Detect jailbreak/prompt injection patterns in user text.",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["text", "context"],
            properties: {
                text: { type: "string", minLength: 1, maxLength: 5000 },
                context: { type: "object" },
            },
        },
    },

    // ---- Discovery ----
    {
        name: "venues.list_nearby",
        description: "List venues near a location with filters.",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["location", "radiusKm", "filters", "page"],
            properties: {
                location: {
                    type: "object",
                    additionalProperties: false,
                    required: ["lat", "lng"],
                    properties: {
                        lat: { type: "number", minimum: -90, maximum: 90 },
                        lng: { type: "number", minimum: -180, maximum: 180 },
                    },
                },
                radiusKm: { type: "number", minimum: 0.2, maximum: 30 },
                filters: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        openNow: { type: ["boolean", "null"] },
                        cuisine: { type: ["array", "null"], items: { type: "string" } },
                        priceBand: { type: ["string", "null"], enum: ["$", "$$", "$$$"] },
                        hasDeals: { type: ["boolean", "null"] },
                        liveMusic: { type: ["boolean", "null"] },
                    },
                },
                page: {
                    type: "object",
                    additionalProperties: false,
                    required: ["limit", "cursor"],
                    properties: {
                        limit: { type: "integer", minimum: 1, maximum: 50 },
                        cursor: { type: ["string", "null"] },
                    },
                },
            },
        },
    },
    {
        name: "venues.get",
        description: "Get venue details for venue screen.",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["venueId"],
            properties: {
                venueId: { type: "string" },
            },
        },
    },

    // ---- Menu/Catalog ----
    {
        name: "menu.get",
        description: "Get menu structure (categories + item summaries).",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["venueId"],
            properties: {
                venueId: { type: "string" },
                menuVersion: { type: ["string", "null"] },
                includeItems: { type: ["boolean", "null"] },
            },
        },
    },
    {
        name: "menu.get_item",
        description: "Get full item details for item screen.",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["itemId"],
            properties: {
                itemId: { type: "string" },
            },
        },
    },
    {
        name: "dietary.check",
        description: "Warn if selected items conflict with guest allergies/preferences.",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["guestProfile", "items"],
            properties: {
                guestProfile: { type: "object" },
                items: {
                    type: "array",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        required: ["itemId"],
                        properties: {
                            itemId: { type: "string" },
                            selectedAddonIds: {
                                type: ["array", "null"],
                                items: { type: "string" },
                            },
                        },
                    },
                },
            },
        },
    },

    // ---- Offers/Pricing ----
    {
        name: "offers.list_applicable",
        description: "List offers for guest and venue now.",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["guestId", "venueId", "atTime"],
            properties: {
                guestId: { type: "string" },
                venueId: { type: "string" },
                atTime: { type: "string", format: "date-time" },
            },
        },
    },
    {
        name: "pricing.quote",
        description: "Compute totals for cart (tax, service, discounts).",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["visitId"],
            properties: {
                visitId: { type: "string" },
                offerId: { type: ["string", "null"] },
            },
        },
    },

    // ---- Visit/Cart/Order ----
    {
        name: "visit.start",
        description: "Start a dining visit (table optional).",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["guestId", "venueId"],
            properties: {
                guestId: { type: "string" },
                venueId: { type: "string" },
                tableId: { type: ["string", "null"] },
                partySize: { type: ["integer", "null"], minimum: 1, maximum: 20 },
            },
        },
    },
    {
        name: "cart.add_item",
        description: "Add an item to the visit cart.",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["visitId", "itemId", "qty"],
            properties: {
                visitId: { type: "string" },
                itemId: { type: "string" },
                qty: { type: "integer", minimum: 1, maximum: 20 },
                selectedAddonIds: { type: ["array", "null"], items: { type: "string" } },
                notes: { type: ["string", "null"], maxLength: 200 },
            },
        },
    },
    {
        name: "cart.get",
        description: "Get current cart.",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["visitId"],
            properties: {
                visitId: { type: "string" },
            },
        },
    },
    {
        name: "order.submit",
        description: "Submit order. Requires explicit confirmation upstream.",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["visitId", "clientConfirmationId"],
            properties: {
                visitId: { type: "string" },
                clientConfirmationId: { type: "string", minLength: 8 },
                tipAmount: { type: ["number", "null"], minimum: 0 },
                specialInstructions: { type: ["string", "null"], maxLength: 300 },
            },
        },
    },
    {
        name: "order.status",
        description: "Get live status timeline.",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["orderId"],
            properties: {
                orderId: { type: "string" },
            },
        },
    },

    // ---- Service Calls ----
    {
        name: "service.call_staff",
        description: "Send a service request to venue staff.",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["visitId", "reason"],
            properties: {
                visitId: { type: "string" },
                reason: {
                    type: "string",
                    enum: [
                        "water",
                        "bill",
                        "help",
                        "complaint",
                        "allergy",
                        "birthday",
                        "other",
                    ],
                },
                priority: {
                    type: ["string", "null"],
                    enum: ["low", "normal", "high", null],
                },
                note: { type: ["string", "null"], maxLength: 200 },
            },
        },
    },
    {
        name: "service.request_bill",
        description: "Request the bill.",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["visitId"],
            properties: {
                visitId: { type: "string" },
            },
        },
    },

    // ---- Guest Profile ----
    {
        name: "guest.get_profile",
        description: "Get guest preferences + allergies (minimal).",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["guestId"],
            properties: {
                guestId: { type: "string" },
            },
        },
    },
    {
        name: "guest.update_preferences",
        description: "Update preferences (guest-initiated only).",
        input_schema: {
            type: "object",
            additionalProperties: false,
            required: ["guestId", "patch"],
            properties: {
                guestId: { type: "string" },
                patch: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                        cuisines: { type: ["array", "null"], items: { type: "string" } },
                        spiceLevel: {
                            type: ["string", "null"],
                            enum: ["mild", "medium", "hot", null],
                        },
                        allergies: { type: ["array", "null"], items: { type: "string" } },
                    },
                },
            },
        },
    },
];

// =============================================================================
// 3. TYPESCRIPT INTERFACES
// =============================================================================

// ---- Foundation ----

export interface TenantResolveContextInput {
    authToken: string;
}
export interface TenantResolveContextOutput {
    tenantId: string;
    venueId: string | null;
    actorType: "guest" | "staff" | "admin";
    actorId: string;
    roles: string[];
}

export interface PolicyCheckInput {
    action: string;
    resource: {
        type:
        | "venue"
        | "menu"
        | "item"
        | "offer"
        | "visit"
        | "cart"
        | "order"
        | "service_call"
        | "guest_profile";
        id: string;
    };
    context: Record<string, unknown>;
}
export interface PolicyCheckOutput {
    allow: boolean;
    reason: string | null;
}

export interface AuditLogInput {
    eventType: string;
    payload: Record<string, unknown>;
}
export interface AuditLogOutput {
    auditId: string;
}

export interface SessionGetInput {
    sessionKey: string;
}
export interface SessionGetOutput {
    sessionKey: string;
    state: Record<string, unknown>;
}

export interface SessionSetInput {
    sessionKey: string;
    patch: Record<string, unknown>;
    ttlSeconds?: number | null;
}
export interface SessionSetOutput {
    ok: boolean;
}

export interface AbuseCheckMessageInput {
    text: string;
    context: Record<string, unknown>;
}
export interface AbuseCheckMessageOutput {
    risk: "low" | "medium" | "high";
    flags: string[];
    recommendation: string | null;
}

// ---- Discovery ----

export interface VenuesListNearbyInput {
    location: {
        lat: number;
        lng: number;
    };
    radiusKm: number;
    filters: {
        openNow?: boolean | null;
        cuisine?: string[] | null;
        priceBand?: "$" | "$$" | "$$$" | null;
        hasDeals?: boolean | null;
        liveMusic?: boolean | null;
    };
    page: {
        limit: number;
        cursor: string | null;
    };
}
export interface VenuesListNearbyOutput {
    venues: Array<{
        venueId: string;
        name: string;
        distanceKm: number;
        isOpen: boolean;
        rating: number | null;
        priceBand: "$" | "$$" | "$$$" | null;
        heroImageUrl: string | null;
        badges: string[] | null;
    }>;
    nextCursor: string | null;
}

export interface VenuesGetInput {
    venueId: string;
}
export interface VenuesGetOutput {
    venueId: string;
    name: string;
    address: string;
    rating: number | null;
    hours: {
        timezone: string;
        today: string;
        weekly: string[];
    };
    assets: {
        heroImageUrl: string | null;
        gallery: string[] | null;
    };
    features: {
        liveMusic?: boolean | null;
        outdoorSeating?: boolean | null;
        wifi?: boolean | null;
    };
}

// ---- Menu/Catalog ----

export interface MenuGetInput {
    venueId: string;
    menuVersion?: string | null;
    includeItems?: boolean | null;
}
export interface MenuGetOutput {
    venueId: string;
    menuVersion: string;
    categories: Array<{
        categoryId: string;
        name: string;
        items: Array<{
            itemId: string;
            name: string;
            price: number;
            currency: string;
            badge: string | null;
            imageUrl: string | null;
        }>;
    }>;
}

export interface MenuGetItemInput {
    itemId: string;
}
export interface MenuGetItemOutput {
    itemId: string;
    venueId: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    addons: Array<{
        addonId: string;
        name: string;
        price: number;
    }>;
    allergens: string[];
}

export interface DietaryCheckInput {
    guestProfile: Record<string, unknown>;
    items: Array<{
        itemId: string;
        selectedAddonIds?: string[] | null;
    }>;
}
export interface DietaryCheckOutput {
    status: "ok" | "warn" | "block";
    warnings: Array<{
        code: string;
        message: string;
    }>;
}

// ---- Offers/Pricing ----

export interface OffersListApplicableInput {
    guestId: string;
    venueId: string;
    atTime: string; // date-time
}
export interface OffersListApplicableOutput {
    offers: Array<{
        offerId: string;
        title: string;
        summary: string;
        badge: string | null;
    }>;
}

export interface PricingQuoteInput {
    visitId: string;
    offerId?: string | null;
}
export interface PricingQuoteOutput {
    visitId: string;
    currency: string;
    lines: Array<{
        label: string;
        amount: number;
    }>;
    totals: {
        subtotal: number;
        discount: number;
        tax: number;
        service: number;
        total: number;
    };
}

// ---- Visit/Cart/Order ----

export interface VisitStartInput {
    guestId: string;
    venueId: string;
    tableId?: string | null;
    partySize?: number | null;
}
export interface VisitStartOutput {
    visitId: string;
    sessionKey: string;
    status: "active";
}

export interface CartAddItemInput {
    visitId: string;
    itemId: string;
    qty: number;
    selectedAddonIds?: string[] | null;
    notes?: string | null;
}
export interface CartAddItemOutput {
    visitId: string;
    cart: {
        updatedAt: string; // date-time
        lines: Array<{
            lineId: string;
            itemId: string;
            name: string;
            qty: number;
            lineTotal: number;
        }>;
    };
}

export interface CartGetInput {
    visitId: string;
}
export interface CartGetOutput {
    visitId: string;
    updatedAt: string; // date-time
    lines: Array<{
        lineId: string;
        itemId: string;
        name: string;
        qty: number;
        lineTotal: number;
    }>;
}

export interface OrderSubmitInput {
    visitId: string;
    clientConfirmationId: string;
    tipAmount?: number | null;
    specialInstructions?: string | null;
}
export interface OrderSubmitOutput {
    orderId: string;
    status:
    | "submitted"
    | "accepted"
    | "in_progress"
    | "ready"
    | "served"
    | "cancelled";
}

export interface OrderStatusInput {
    orderId: string;
}
export interface OrderStatusOutput {
    orderId: string;
    status: string;
    events: Array<{
        at: string; // date-time
        type: string;
        label: string;
    }>;
}

// ---- Service Calls ----

export interface ServiceCallStaffInput {
    visitId: string;
    reason:
    | "water"
    | "bill"
    | "help"
    | "complaint"
    | "allergy"
    | "birthday"
    | "other";
    priority?: "low" | "normal" | "high" | null;
    note?: string | null;
}
export interface ServiceCallStaffOutput {
    serviceCallId: string;
    status: "queued" | "sent" | "acknowledged" | "resolved";
}

export interface ServiceRequestBillInput {
    visitId: string;
}
export interface ServiceRequestBillOutput {
    serviceCallId: string;
    status: string;
}

// ---- Guest Profile ----

export interface GuestGetProfileInput {
    guestId: string;
}
export interface GuestGetProfileOutput {
    guestId: string;
    locale: string | null;
    allergies: string[];
    preferences: {
        cuisines?: string[] | null;
        spiceLevel?: "mild" | "medium" | "hot" | null;
        budgetBand?: "$" | "$$" | "$$$" | null;
    };
}

export interface GuestUpdatePreferencesInput {
    guestId: string;
    patch: {
        cuisines?: string[] | null;
        spiceLevel?: "mild" | "medium" | "hot" | null;
        allergies?: string[] | null;
    };
}
export interface GuestUpdatePreferencesOutput {
    ok: boolean;
}
