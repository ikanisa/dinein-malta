/**
 * Kill Switches Library
 * 
 * Provides immediate-effect emergency shutdown capabilities.
 * Kill switches can be global or scoped to specific venues/tenants.
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================================================================
// TYPES
// =============================================================================

export const KILL_SWITCH_IDS = [
    'disable_all_ai',
    'disable_order_submit',
    'disable_service_calls',
    'reduce_ai_rate_limits',
    'force_readonly_ui'
] as const;

export type KillSwitchId = typeof KILL_SWITCH_IDS[number];

export interface KillSwitch {
    id: KillSwitchId;
    description: string;
    is_active: boolean;
    scope: string; // 'global', 'venue:{uuid}', 'tenant:{uuid}'
    activated_at: string | null;
    activated_by: string | null;
    reason: string | null;
}

// =============================================================================
// IN-MEMORY CACHE (very short TTL for kill switches)
// =============================================================================

interface CacheEntry {
    value: boolean;
    expiresAt: number;
}

const KILL_SWITCH_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10_000; // 10 second cache (short for emergency behavior)

function getCached(key: string): boolean | null {
    const entry = KILL_SWITCH_CACHE.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        KILL_SWITCH_CACHE.delete(key);
        return null;
    }
    return entry.value;
}

function setCache(key: string, value: boolean): void {
    KILL_SWITCH_CACHE.set(key, {
        value,
        expiresAt: Date.now() + CACHE_TTL_MS
    });
}

// =============================================================================
// KILL SWITCH CHECKING
// =============================================================================

/**
 * Check if a kill switch is active.
 * 
 * Checks in order:
 * 1. Global switch activation
 * 2. Venue-specific switch (if venueId provided)
 * 3. Tenant-specific switch (if tenantId provided)
 */
export async function isKillSwitchActive(
    supabase: SupabaseClient,
    switchId: KillSwitchId,
    venueId?: string,
    tenantId?: string
): Promise<boolean> {
    // Build scopes to check
    const scopes = ['global'];
    if (venueId) scopes.push(`venue:${venueId}`);
    if (tenantId) scopes.push(`tenant:${tenantId}`);

    for (const scope of scopes) {
        const cacheKey = `kill:${switchId}:${scope}`;

        // Check cache first
        const cached = getCached(cacheKey);
        if (cached === true) return true;
        if (cached !== null) continue; // cached as false, check next scope

        // Query database
        const { data } = await supabase
            .from('kill_switches')
            .select('is_active')
            .eq('id', switchId)
            .eq('scope', scope)
            .single();

        const isActive = data?.is_active ?? false;
        setCache(cacheKey, isActive);

        if (isActive) return true;
    }

    return false;
}

/**
 * Check if any "blocking" kill switch is active.
 * Used for quick pre-flight checks before AI operations.
 */
export async function checkBlockingKillSwitches(
    supabase: SupabaseClient,
    venueId?: string,
    tenantId?: string
): Promise<{
    blocked: boolean;
    reason?: 'disable_all_ai' | 'force_readonly_ui';
}> {
    // Check disable_all_ai first (highest priority)
    if (await isKillSwitchActive(supabase, 'disable_all_ai', venueId, tenantId)) {
        return { blocked: true, reason: 'disable_all_ai' };
    }

    // Check force_readonly_ui
    if (await isKillSwitchActive(supabase, 'force_readonly_ui', venueId, tenantId)) {
        return { blocked: true, reason: 'force_readonly_ui' };
    }

    return { blocked: false };
}

/**
 * Check if order submission is blocked.
 */
export async function isOrderSubmitBlocked(
    supabase: SupabaseClient,
    venueId?: string,
    tenantId?: string
): Promise<boolean> {
    return isKillSwitchActive(supabase, 'disable_order_submit', venueId, tenantId);
}

/**
 * Check if service calls are blocked.
 */
export async function isServiceCallsBlocked(
    supabase: SupabaseClient,
    venueId?: string,
    tenantId?: string
): Promise<boolean> {
    return isKillSwitchActive(supabase, 'disable_service_calls', venueId, tenantId);
}

/**
 * Check if rate limits should be reduced (more aggressive throttling).
 */
export async function shouldReduceRateLimits(
    supabase: SupabaseClient,
    venueId?: string,
    tenantId?: string
): Promise<boolean> {
    return isKillSwitchActive(supabase, 'reduce_ai_rate_limits', venueId, tenantId);
}

// =============================================================================
// KILL SWITCH MANAGEMENT (Admin operations - use service role)
// =============================================================================

/**
 * Activate a kill switch.
 */
export async function activateKillSwitch(
    supabase: SupabaseClient,
    switchId: KillSwitchId,
    reason: string,
    scope: string = 'global',
    userId?: string
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('kill_switches')
        .update({
            is_active: true,
            activated_at: new Date().toISOString(),
            activated_by: userId,
            reason,
            scope
        })
        .eq('id', switchId);

    if (error) {
        return { success: false, error: error.message };
    }

    // Invalidate all relevant caches
    clearKillSwitchCache();

    // Log to audit
    await logKillSwitchAction(supabase, switchId, 'activate', reason, scope, userId);

    return { success: true };
}

/**
 * Deactivate a kill switch.
 */
export async function deactivateKillSwitch(
    supabase: SupabaseClient,
    switchId: KillSwitchId,
    reason: string,
    userId?: string
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('kill_switches')
        .update({
            is_active: false,
            reason: `Deactivated: ${reason}`
        })
        .eq('id', switchId);

    if (error) {
        return { success: false, error: error.message };
    }

    // Invalidate all relevant caches
    clearKillSwitchCache();

    // Log to audit
    await logKillSwitchAction(supabase, switchId, 'deactivate', reason, 'global', userId);

    return { success: true };
}

/**
 * Get all kill switches with their current status.
 */
export async function getAllKillSwitches(
    supabase: SupabaseClient
): Promise<KillSwitch[]> {
    const { data, error } = await supabase
        .from('kill_switches')
        .select('*')
        .order('id');

    if (error || !data) return [];

    return data as KillSwitch[];
}

/**
 * Log kill switch action to audit logs.
 */
async function logKillSwitchAction(
    supabase: SupabaseClient,
    switchId: KillSwitchId,
    action: 'activate' | 'deactivate',
    reason: string,
    scope: string,
    userId?: string
): Promise<void> {
    try {
        await supabase.from('audit_logs').insert({
            action: `kill_switch.${action}`,
            entity_type: 'kill_switch',
            entity_id: switchId,
            actor_id: userId,
            metadata: { reason, scope },
            created_at: new Date().toISOString()
        });
    } catch {
        // Don't fail the operation if audit logging fails
        console.error(`Failed to log kill switch action: ${switchId} ${action}`);
    }
}

/**
 * Clear all kill switch caches.
 */
export function clearKillSwitchCache(): void {
    KILL_SWITCH_CACHE.clear();
}
