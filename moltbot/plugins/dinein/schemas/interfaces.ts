/**
 * Plugin Tool Interfaces
 * 
 * Mirrors the contracts defined in supabase/functions/_lib/tool_schema_pack_v1.ts
 * ensuring the plugin conforms to the backend expectations.
 */

// ---- Discovery ----

export interface VenuesListNearbyInput {
    location: { lat: number; lng: number };
    radiusKm: number;
    filters: {
        openNow?: boolean | null;
        cuisine?: string[] | null;
        priceBand?: "$" | "$$" | "$$$" | null;
        hasDeals?: boolean | null;
        liveMusic?: boolean | null;
    };
    page: { limit: number; cursor: string | null };
}

export interface VenuesGetInput {
    venueId: string;
}

// ---- Menu ----

export interface MenuGetInput {
    venueId: string;
    menuVersion?: string | null;
    includeItems?: boolean | null;
}

export interface MenuGetItemInput {
    itemId: string;
}

// ---- Guest ----

export interface GuestGetProfileInput {
    guestId: string;
}

export interface GuestUpdatePreferencesInput {
    guestId: string;
    patch: {
        cuisines?: string[] | null;
        spiceLevel?: "mild" | "medium" | "hot" | null;
        allergies?: string[] | null;
    };
}

// ---- Visit/Cart/Order ----

export interface VisitStartInput {
    guestId: string;
    venueId: string;
    tableId?: string | null;
    partySize?: number | null;
}

export interface CartAddItemInput {
    visitId: string;
    itemId: string;
    qty: number;
    selectedAddonIds?: string[] | null;
    notes?: string | null;
}

export interface CartGetInput {
    visitId: string;
}

export interface OrderSubmitInput {
    visitId: string;
    clientConfirmationId: string;
    tipAmount?: number | null;
    specialInstructions?: string | null;
}

export interface OrderStatusInput {
    orderId: string;
}

// ---- Service ----

export interface ServiceCallStaffInput {
    visitId: string;
    reason: "water" | "bill" | "help" | "complaint" | "allergy" | "birthday" | "other";
    priority?: "low" | "normal" | "high" | null;
    note?: string | null;
}

export interface ServiceRequestBillInput {
    visitId: string;
}
