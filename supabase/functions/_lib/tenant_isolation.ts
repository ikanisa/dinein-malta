/**
 * Tenant Isolation for Moltbot Agent Requests
 * 
 * Enforces multi-tenant isolation by:
 * 1. Resolving tenant context from request
 * 2. Deriving scoped session keys
 * 3. Enforcing venue access permissions
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================================================================
// TENANT CONTEXT
// =============================================================================

export interface TenantContext {
    /** Platform-level tenant ID (for future multi-tenant support) */
    tenantId: string;
    /** Venue ID the request is scoped to (nullable for platform-wide ops) */
    venueId: string | null;
    /** User ID from auth (nullable for anonymous) */
    userId: string | null;
    /** Derived session key for memory scoping */
    sessionKey: string;
    /** Country code derived from venue */
    country: "RW" | "MT" | null;
}

// =============================================================================
// SESSION KEY DERIVATION
// =============================================================================

/**
 * Derive a scoped session key for memory isolation.
 * Format: tenant:{tenantId}:venue:{venueId}:user:{userId}
 * 
 * This key ensures:
 * - Guest memories don't leak across venues
 * - Staff memories are venue-scoped
 * - Admin memories are platform-wide
 */
export function deriveSessionKey(
    tenantId: string,
    venueId: string | null,
    userId: string | null,
    visitId?: string
): string {
    const parts = [`tenant:${tenantId}`];

    if (venueId) {
        parts.push(`venue:${venueId}`);
    }

    if (userId) {
        parts.push(`user:${userId}`);
    } else {
        parts.push(`user:anonymous`);
    }

    if (visitId) {
        parts.push(`visit:${visitId}`);
    }

    return parts.join(":");
}

// =============================================================================
// TENANT CONTEXT RESOLUTION
// =============================================================================

/**
 * Resolve tenant context from request headers and body.
 * 
 * Context is derived from:
 * 1. Auth header -> user_id
 * 2. Request body -> venue_id
 * 3. Venue lookup -> country (for geo-fenced operations)
 */
export async function resolveTenantContext(
    req: Request,
    body: { context?: { venue_id?: string; user_id?: string; session_id?: string } },
    supabase: SupabaseClient
): Promise<TenantContext> {
    // Default tenant ID (single-tenant for now)
    const tenantId = "dinein";

    // Get user ID from auth header or body
    let userId: string | null = body.context?.user_id || null;

    if (!userId) {
        const authHeader = req.headers.get("Authorization");
        if (authHeader?.startsWith("Bearer ")) {
            const token = authHeader.slice(7);
            try {
                const { data: { user } } = await supabase.auth.getUser(token);
                userId = user?.id || null;
            } catch {
                // Continue without user_id
            }
        }
    }

    // Get venue ID from body
    const venueId = body.context?.venue_id || null;

    // Lookup venue country for geo-fencing
    let country: "RW" | "MT" | null = null;
    if (venueId) {
        const { data: venue } = await supabase
            .from("venues")
            .select("country")
            .eq("id", venueId)
            .single();

        if (venue?.country === "RW" || venue?.country === "MT") {
            country = venue.country;
        }
    }

    // Derive session key
    const sessionKey = deriveSessionKey(tenantId, venueId, userId, body.context?.session_id);

    return {
        tenantId,
        venueId,
        userId,
        sessionKey,
        country,
    };
}

// =============================================================================
// VENUE ACCESS ENFORCEMENT
// =============================================================================

export interface VenueAccessResult {
    allowed: boolean;
    reason?: string;
}

/**
 * Check if the user has access to the specified venue.
 * 
 * Access rules:
 * - Guests: can access any active venue (read-only menu, place orders)
 * - Venue owners: can access their own venue (full ops)
 * - Admins: can access all venues (platform ops)
 */
export async function enforceVenueAccess(
    ctx: TenantContext,
    targetVenueId: string,
    requiredRole: "guest" | "owner" | "admin",
    supabase: SupabaseClient
): Promise<VenueAccessResult> {
    // If no venue context, only platform-wide ops allowed
    if (!targetVenueId) {
        return {
            allowed: requiredRole === "admin",
            reason: requiredRole !== "admin" ? "Venue context required" : undefined,
        };
    }

    // Guest access: venue must be active
    if (requiredRole === "guest") {
        const { data: venue } = await supabase
            .from("venues")
            .select("id, is_active")
            .eq("id", targetVenueId)
            .single();

        if (!venue) {
            return { allowed: false, reason: "Venue not found" };
        }

        if (!venue.is_active) {
            return { allowed: false, reason: "Venue is not active" };
        }

        return { allowed: true };
    }

    // Owner access: user must own the venue
    if (requiredRole === "owner") {
        if (!ctx.userId) {
            return { allowed: false, reason: "Authentication required for owner access" };
        }

        const { data: venue } = await supabase
            .from("venues")
            .select("id, owner_id")
            .eq("id", targetVenueId)
            .single();

        if (!venue) {
            return { allowed: false, reason: "Venue not found" };
        }

        if (venue.owner_id !== ctx.userId) {
            return { allowed: false, reason: "Not the venue owner" };
        }

        return { allowed: true };
    }

    // Admin access: user must have admin role
    if (requiredRole === "admin") {
        if (!ctx.userId) {
            return { allowed: false, reason: "Authentication required for admin access" };
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", ctx.userId)
            .single();

        if (profile?.role !== "admin") {
            return { allowed: false, reason: "Admin role required" };
        }

        return { allowed: true };
    }

    return { allowed: false, reason: "Invalid required role" };
}

// =============================================================================
// CROSS-TENANT CHECK
// =============================================================================

/**
 * Ensure a venue belongs to the current tenant context.
 * Prevents cross-tenant data access.
 */
export function enforceTenantMatch(
    ctx: TenantContext,
    targetVenueId: string
): VenueAccessResult {
    // If context has a venue, target must match
    if (ctx.venueId && ctx.venueId !== targetVenueId) {
        return {
            allowed: false,
            reason: `Cross-venue access denied: context venue ${ctx.venueId} != target ${targetVenueId}`,
        };
    }

    return { allowed: true };
}

// =============================================================================
// STRUCTURED LOGGING
// =============================================================================

/**
 * Log tenant context for observability.
 */
export function logTenantContext(
    level: "info" | "warn" | "error",
    message: string,
    ctx: TenantContext,
    extra?: Record<string, unknown>
): void {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        service: "moltbot-tenant",
        message,
        tenantId: ctx.tenantId,
        venueId: ctx.venueId,
        userId: ctx.userId,
        sessionKey: ctx.sessionKey,
        country: ctx.country,
        ...extra,
    };
    console[level](JSON.stringify(entry));
}
