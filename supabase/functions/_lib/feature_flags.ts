/**
 * Feature Flags Library
 * 
 * Provides feature flag resolution with tenant/venue/cohort scoping.
 * Implements hierarchical override: cohort > venue > tenant > default.
 * Includes caching for performance.
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// =============================================================================
// TYPES
// =============================================================================

export const FEATURE_FLAGS = [
    'ui_plan_enabled',
    'waiter_enabled',
    'cart_enabled',
    'pricing_quote_enabled',
    'order_submit_enabled',
    'realtime_enabled',
    'research_enabled'
] as const;

export type FeatureFlag = typeof FEATURE_FLAGS[number];

export interface FlagContext {
    tenantId?: string;
    venueId?: string;
    cohortId?: string;
    userId?: string;
}

export interface FlagResult {
    enabled: boolean;
    source: 'default' | 'tenant' | 'venue' | 'cohort' | 'kill_switch';
}

export interface FlagDefinition {
    flag_key: string;
    default_enabled: boolean;
    scope: string[];
    description: string | null;
}

interface FlagOverride {
    flag_key: string;
    scope_type: string;
    scope_id: string;
    enabled: boolean;
}

// =============================================================================
// IN-MEMORY CACHE
// =============================================================================

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

const FLAG_CACHE = new Map<string, CacheEntry<FlagDefinition>>();
const OVERRIDE_CACHE = new Map<string, CacheEntry<FlagOverride[]>>();
const CACHE_TTL_MS = 60_000; // 1 minute cache

function getCached<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }
    return entry.value;
}

function setCache<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T): void {
    cache.set(key, {
        value,
        expiresAt: Date.now() + CACHE_TTL_MS
    });
}

// =============================================================================
// FLAG RESOLUTION
// =============================================================================

/**
 * Fetch a flag definition from database or cache.
 */
async function getFlagDefinition(
    supabase: SupabaseClient,
    flagKey: FeatureFlag
): Promise<FlagDefinition | null> {
    const cacheKey = `flag:${flagKey}`;
    const cached = getCached(FLAG_CACHE, cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
        .from('feature_flags')
        .select('flag_key, default_enabled, scope, description')
        .eq('flag_key', flagKey)
        .single();

    if (error || !data) return null;

    setCache(FLAG_CACHE, cacheKey, data as FlagDefinition);
    return data as FlagDefinition;
}

/**
 * Fetch overrides for a specific scope.
 */
async function getOverrides(
    supabase: SupabaseClient,
    scopeType: 'tenant' | 'venue' | 'cohort',
    scopeId: string
): Promise<FlagOverride[]> {
    const cacheKey = `overrides:${scopeType}:${scopeId}`;
    const cached = getCached(OVERRIDE_CACHE, cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
        .from('feature_flag_overrides')
        .select('flag_key, scope_type, scope_id, enabled')
        .eq('scope_type', scopeType)
        .eq('scope_id', scopeId);

    if (error || !data) return [];

    setCache(OVERRIDE_CACHE, cacheKey, data as FlagOverride[]);
    return data as FlagOverride[];
}

/**
 * Resolve a single feature flag for a given context.
 * 
 * Priority order (highest to lowest):
 * 1. Cohort override (if cohortId provided)
 * 2. Venue override (if venueId provided)
 * 3. Tenant override (if tenantId provided)
 * 4. Default value
 */
export async function resolveFlag(
    supabase: SupabaseClient,
    flagKey: FeatureFlag,
    context: FlagContext
): Promise<FlagResult> {
    // Check kill switches first
    const killSwitchActive = await isGlobalKillSwitchActive(supabase);
    if (killSwitchActive && flagKey.includes('enabled')) {
        return { enabled: false, source: 'kill_switch' };
    }

    // Get flag definition
    const definition = await getFlagDefinition(supabase, flagKey);
    if (!definition) {
        return { enabled: false, source: 'default' };
    }

    // Check overrides in priority order
    // 1. Cohort override
    if (context.cohortId && definition.scope.includes('cohort')) {
        const cohortOverrides = await getOverrides(supabase, 'cohort', context.cohortId);
        const override = cohortOverrides.find(o => o.flag_key === flagKey);
        if (override) {
            return { enabled: override.enabled, source: 'cohort' };
        }
    }

    // 2. Venue override
    if (context.venueId && definition.scope.includes('venue')) {
        const venueOverrides = await getOverrides(supabase, 'venue', context.venueId);
        const override = venueOverrides.find(o => o.flag_key === flagKey);
        if (override) {
            return { enabled: override.enabled, source: 'venue' };
        }
    }

    // 3. Tenant override
    if (context.tenantId && definition.scope.includes('tenant')) {
        const tenantOverrides = await getOverrides(supabase, 'tenant', context.tenantId);
        const override = tenantOverrides.find(o => o.flag_key === flagKey);
        if (override) {
            return { enabled: override.enabled, source: 'tenant' };
        }
    }

    // 4. Default value
    return { enabled: definition.default_enabled, source: 'default' };
}

/**
 * Resolve all feature flags for a given context.
 */
export async function resolveAllFlags(
    supabase: SupabaseClient,
    context: FlagContext
): Promise<Record<FeatureFlag, FlagResult>> {
    const results: Partial<Record<FeatureFlag, FlagResult>> = {};

    for (const flag of FEATURE_FLAGS) {
        results[flag] = await resolveFlag(supabase, flag, context);
    }

    return results as Record<FeatureFlag, FlagResult>;
}

/**
 * Check if the global "disable all AI" kill switch is active.
 */
async function isGlobalKillSwitchActive(supabase: SupabaseClient): Promise<boolean> {
    // Use a simple cache for the kill switch
    const cacheKey = 'kill:disable_all_ai';
    const cached = getCached(FLAG_CACHE, cacheKey);
    if (cached !== null) {
        return (cached as unknown as { is_active: boolean }).is_active;
    }

    const { data } = await supabase
        .from('kill_switches')
        .select('is_active')
        .eq('id', 'disable_all_ai')
        .single();

    const isActive = data?.is_active ?? false;
    setCache(FLAG_CACHE, cacheKey, { is_active: isActive } as unknown as FlagDefinition);
    return isActive;
}

// =============================================================================
// FLAG MANAGEMENT (Admin operations - use service role)
// =============================================================================

/**
 * Set a flag override for a specific scope.
 */
export async function setFlagOverride(
    supabase: SupabaseClient,
    flagKey: FeatureFlag,
    scopeType: 'tenant' | 'venue' | 'cohort',
    scopeId: string,
    enabled: boolean,
    userId?: string
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('feature_flag_overrides')
        .upsert({
            flag_key: flagKey,
            scope_type: scopeType,
            scope_id: scopeId,
            enabled,
            created_by: userId
        }, {
            onConflict: 'flag_key,scope_type,scope_id'
        });

    if (error) {
        return { success: false, error: error.message };
    }

    // Invalidate cache
    OVERRIDE_CACHE.delete(`overrides:${scopeType}:${scopeId}`);

    return { success: true };
}

/**
 * Remove a flag override.
 */
export async function removeFlagOverride(
    supabase: SupabaseClient,
    flagKey: FeatureFlag,
    scopeType: 'tenant' | 'venue' | 'cohort',
    scopeId: string
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('feature_flag_overrides')
        .delete()
        .eq('flag_key', flagKey)
        .eq('scope_type', scopeType)
        .eq('scope_id', scopeId);

    if (error) {
        return { success: false, error: error.message };
    }

    // Invalidate cache
    OVERRIDE_CACHE.delete(`overrides:${scopeType}:${scopeId}`);

    return { success: true };
}

/**
 * Clear all caches (useful for testing or after bulk updates).
 */
export function clearFlagCache(): void {
    FLAG_CACHE.clear();
    OVERRIDE_CACHE.clear();
}
