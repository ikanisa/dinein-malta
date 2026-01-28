// deno-lint-ignore-file no-explicit-any
/**
 * Cohort Management Module
 * 
 * Handles venue assignment to rollout cohorts and automatic fallback
 * when KPIs breach safety thresholds.
 * 
 * Cohorts define groups for staged rollouts (pilot → expansion → general).
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { transitionMode, getVenueRolloutMode, type RolloutMode } from "./rollout_mode.ts";
import { getKPIHistory, type RolloutKPIs } from "./kpi_tracking.ts";
import { activateKillSwitch } from "./kill_switches.ts";

// =============================================================================
// TYPES
// =============================================================================

export interface Cohort {
    id: string;
    name: string;
    description: string | null;
    phase: CohortPhase;
    createdAt: string;
}

export type CohortPhase = 'pilot' | 'expansion_1' | 'expansion_2' | 'general';

export interface VenueCohortAssignment {
    venueId: string;
    cohortId: string;
    assignedAt: string;
    assignedBy: string | null;
}

export interface FallbackConfig {
    // Critical thresholds - immediate fallback
    maxToolErrorRate: number;           // > this triggers immediate fallback
    maxTenantMismatch: number;          // > 0 triggers immediate fallback
    maxApprovalBypass: number;          // > 0 triggers immediate fallback

    // Warning thresholds - after N violations
    warningToolErrorRate: number;       // Warning if above this
    warningLatencyP95Ms: number;        // Warning if latency exceeds this
    warningViolationsToFallback: number; // Consecutive warnings before fallback

    // Target mode on fallback
    fallbackMode: RolloutMode;
}

export const DEFAULT_FALLBACK_CONFIG: FallbackConfig = {
    maxToolErrorRate: 0.10,             // 10% = critical
    maxTenantMismatch: 0,               // Any = critical
    maxApprovalBypass: 0,               // Any = critical
    warningToolErrorRate: 0.05,         // 5% = warning
    warningLatencyP95Ms: 3000,          // 3s = warning
    warningViolationsToFallback: 3,     // 3 consecutive warnings
    fallbackMode: 'shadow_ui',          // Default to safe read-only mode
};

// In-memory warning counters (per venue)
const warningCounters: Map<string, number> = new Map();

// =============================================================================
// COHORT CRUD
// =============================================================================

/**
 * List all cohorts.
 */
export async function listCohorts(supabase: SupabaseClient): Promise<Cohort[]> {
    const { data } = await supabase
        .from('rollout_cohorts')
        .select('*')
        .order('created_at', { ascending: true });

    if (!data) return [];

    return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        phase: row.phase as CohortPhase,
        createdAt: row.created_at,
    }));
}

/**
 * Get a cohort by ID.
 */
export async function getCohort(
    supabase: SupabaseClient,
    cohortId: string
): Promise<Cohort | null> {
    const { data } = await supabase
        .from('rollout_cohorts')
        .select('*')
        .eq('id', cohortId)
        .single();

    if (!data) return null;

    return {
        id: data.id,
        name: data.name,
        description: data.description,
        phase: data.phase as CohortPhase,
        createdAt: data.created_at,
    };
}

/**
 * Create a new cohort.
 */
export async function createCohort(
    supabase: SupabaseClient,
    name: string,
    phase: CohortPhase,
    description?: string
): Promise<{ success: boolean; cohort?: Cohort; error?: string }> {
    const { data, error } = await supabase
        .from('rollout_cohorts')
        .insert({
            name,
            phase,
            description,
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        cohort: {
            id: data.id,
            name: data.name,
            description: data.description,
            phase: data.phase,
            createdAt: data.created_at,
        },
    };
}

// =============================================================================
// VENUE-COHORT ASSIGNMENT
// =============================================================================

/**
 * Assign a venue to a cohort.
 */
export async function assignVenueToCohort(
    supabase: SupabaseClient,
    venueId: string,
    cohortId: string,
    userId?: string
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('venue_cohort_assignments')
        .upsert({
            venue_id: venueId,
            cohort_id: cohortId,
            assigned_at: new Date().toISOString(),
            assigned_by: userId,
        }, {
            onConflict: 'venue_id,cohort_id',
        });

    if (error) {
        return { success: false, error: error.message };
    }

    // Log assignment
    await logCohortAction(supabase, 'assign', venueId, cohortId, userId);

    return { success: true };
}

/**
 * Remove a venue from a cohort.
 */
export async function removeVenueFromCohort(
    supabase: SupabaseClient,
    venueId: string,
    cohortId: string,
    userId?: string
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('venue_cohort_assignments')
        .delete()
        .eq('venue_id', venueId)
        .eq('cohort_id', cohortId);

    if (error) {
        return { success: false, error: error.message };
    }

    // Log removal
    await logCohortAction(supabase, 'remove', venueId, cohortId, userId);

    return { success: true };
}

/**
 * Get all venues in a cohort.
 */
export async function getVenuesInCohort(
    supabase: SupabaseClient,
    cohortId: string
): Promise<string[]> {
    const { data } = await supabase
        .from('venue_cohort_assignments')
        .select('venue_id')
        .eq('cohort_id', cohortId);

    if (!data) return [];

    return data.map((row: any) => row.venue_id);
}

/**
 * Get all cohorts a venue belongs to.
 */
export async function getVenueCohorts(
    supabase: SupabaseClient,
    venueId: string
): Promise<Cohort[]> {
    const { data } = await supabase
        .from('venue_cohort_assignments')
        .select('cohort_id, rollout_cohorts(*)')
        .eq('venue_id', venueId);

    if (!data) return [];

    return data.map((row: any) => ({
        id: row.rollout_cohorts.id,
        name: row.rollout_cohorts.name,
        description: row.rollout_cohorts.description,
        phase: row.rollout_cohorts.phase as CohortPhase,
        createdAt: row.rollout_cohorts.created_at,
    }));
}

/**
 * Bulk assign venues to a cohort.
 */
export async function bulkAssignToCohort(
    supabase: SupabaseClient,
    venueIds: string[],
    cohortId: string,
    userId?: string
): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const venueId of venueIds) {
        const result = await assignVenueToCohort(supabase, venueId, cohortId, userId);
        if (result.success) {
            success++;
        } else {
            failed++;
            errors.push(`${venueId}: ${result.error}`);
        }
    }

    return { success, failed, errors };
}

// =============================================================================
// AUTOMATIC FALLBACK MONITORING
// =============================================================================

/**
 * Check if a venue's KPIs have breached critical thresholds.
 * Returns true if fallback is needed.
 */
export function checkCriticalThresholds(
    kpis: Partial<RolloutKPIs>,
    config: FallbackConfig = DEFAULT_FALLBACK_CONFIG
): { needsFallback: boolean; reason: string | null } {
    // Security violations = immediate fallback
    if ((kpis.tenant_mismatch_count ?? 0) > config.maxTenantMismatch) {
        return { needsFallback: true, reason: 'Tenant mismatch detected' };
    }
    if ((kpis.approval_bypass_attempts ?? 0) > config.maxApprovalBypass) {
        return { needsFallback: true, reason: 'Approval bypass detected' };
    }

    // Tool error rate = immediate fallback if critical
    if ((kpis.tool_error_rate ?? 0) > config.maxToolErrorRate) {
        return { needsFallback: true, reason: `Tool error rate ${((kpis.tool_error_rate ?? 0) * 100).toFixed(1)}% exceeds ${config.maxToolErrorRate * 100}%` };
    }

    return { needsFallback: false, reason: null };
}

/**
 * Check if a venue's KPIs have exceeded warning thresholds.
 */
export function checkWarningThresholds(
    kpis: Partial<RolloutKPIs>,
    config: FallbackConfig = DEFAULT_FALLBACK_CONFIG
): { isWarning: boolean; warnings: string[] } {
    const warnings: string[] = [];

    if ((kpis.tool_error_rate ?? 0) > config.warningToolErrorRate) {
        warnings.push(`Tool error rate ${((kpis.tool_error_rate ?? 0) * 100).toFixed(1)}% exceeds warning threshold ${config.warningToolErrorRate * 100}%`);
    }

    if ((kpis.agent_latency_p95_ms ?? 0) > config.warningLatencyP95Ms) {
        warnings.push(`Agent latency p95 ${kpis.agent_latency_p95_ms}ms exceeds warning threshold ${config.warningLatencyP95Ms}ms`);
    }

    return { isWarning: warnings.length > 0, warnings };
}

/**
 * Process a venue for automatic fallback based on KPIs.
 * Call this periodically (e.g., from kpi-snapshot function).
 */
export async function processVenueFallback(
    supabase: SupabaseClient,
    venueId: string,
    config: FallbackConfig = DEFAULT_FALLBACK_CONFIG
): Promise<{ action: 'none' | 'warning' | 'fallback'; reason?: string }> {
    // Get latest KPI
    const history = await getKPIHistory(supabase, venueId, 1);
    if (history.length === 0) {
        return { action: 'none' };
    }

    const kpis = history[0].kpis;

    // Check critical thresholds first
    const critical = checkCriticalThresholds(kpis, config);
    if (critical.needsFallback) {
        // Immediate fallback
        const result = await triggerAutomaticFallback(
            supabase,
            venueId,
            critical.reason ?? 'Critical threshold breached',
            config
        );
        if (result.success) {
            return { action: 'fallback', reason: critical.reason ?? undefined };
        }
    }

    // Check warning thresholds
    const warning = checkWarningThresholds(kpis, config);
    if (warning.isWarning) {
        // Increment warning counter
        const count = (warningCounters.get(venueId) ?? 0) + 1;
        warningCounters.set(venueId, count);

        if (count >= config.warningViolationsToFallback) {
            // Too many consecutive warnings
            const result = await triggerAutomaticFallback(
                supabase,
                venueId,
                `${count} consecutive warning violations`,
                config
            );
            if (result.success) {
                warningCounters.delete(venueId);
                return { action: 'fallback', reason: `${count} consecutive warnings` };
            }
        }

        return { action: 'warning', reason: warning.warnings.join('; ') };
    }

    // KPIs are healthy - reset warning counter
    warningCounters.delete(venueId);
    return { action: 'none' };
}

/**
 * Trigger an automatic fallback for a venue.
 */
async function triggerAutomaticFallback(
    supabase: SupabaseClient,
    venueId: string,
    reason: string,
    config: FallbackConfig
): Promise<{ success: boolean; error?: string }> {
    // Get current mode
    const currentState = await getVenueRolloutMode(supabase, venueId);

    // Don't fallback if already at or below fallback mode
    const modeOrder = ['off', 'shadow_ui', 'assisted', 'full'];
    const currentIndex = modeOrder.indexOf(currentState.mode);
    const fallbackIndex = modeOrder.indexOf(config.fallbackMode);

    if (currentIndex <= fallbackIndex) {
        // Already at safe mode
        return { success: true };
    }

    // Transition to fallback mode (skip gates for emergency)
    const result = await transitionMode(
        supabase,
        venueId,
        config.fallbackMode,
        undefined, // system action
        true       // skip gates
    );

    if (result.success) {
        // Log automatic fallback
        await logAutomaticFallback(supabase, venueId, currentState.mode, config.fallbackMode, reason);
    }

    return result;
}

/**
 * Process all active venues for automatic fallback.
 * Call this from the kpi-snapshot scheduled function.
 */
export async function processAllVenuesFallback(
    supabase: SupabaseClient,
    config: FallbackConfig = DEFAULT_FALLBACK_CONFIG
): Promise<{
    processed: number;
    warnings: number;
    fallbacks: number;
    details: { venueId: string; action: string; reason?: string }[];
}> {
    // Get all venues with non-off rollout modes
    const { data: rolloutModes } = await supabase
        .from('rollout_modes')
        .select('venue_id, mode')
        .neq('mode', 'off');

    if (!rolloutModes || rolloutModes.length === 0) {
        return { processed: 0, warnings: 0, fallbacks: 0, details: [] };
    }

    let warnings = 0;
    let fallbacks = 0;
    const details: { venueId: string; action: string; reason?: string }[] = [];

    for (const rm of rolloutModes) {
        const result = await processVenueFallback(supabase, rm.venue_id, config);

        if (result.action === 'warning') {
            warnings++;
        } else if (result.action === 'fallback') {
            fallbacks++;
        }

        if (result.action !== 'none') {
            details.push({
                venueId: rm.venue_id,
                action: result.action,
                reason: result.reason,
            });
        }
    }

    // If too many fallbacks in one run, consider global kill switch
    if (fallbacks >= 5) {
        console.warn(`High fallback count (${fallbacks}). Consider activating global kill switch.`);
        // Optionally auto-activate kill switch:
        // await activateKillSwitch(supabase, 'disable_all_ai', `Auto: ${fallbacks} venues failed KPI checks`);
    }

    return {
        processed: rolloutModes.length,
        warnings,
        fallbacks,
        details,
    };
}

// =============================================================================
// LOGGING
// =============================================================================

async function logCohortAction(
    supabase: SupabaseClient,
    action: 'assign' | 'remove',
    venueId: string,
    cohortId: string,
    userId?: string
): Promise<void> {
    try {
        await supabase.from('audit_logs').insert({
            action: `cohort.${action}`,
            entity_type: 'venue',
            entity_id: venueId,
            actor_id: userId,
            metadata: { cohort_id: cohortId },
            created_at: new Date().toISOString(),
        });
    } catch {
        console.error(`Failed to log cohort ${action}`);
    }
}

async function logAutomaticFallback(
    supabase: SupabaseClient,
    venueId: string,
    fromMode: RolloutMode,
    toMode: RolloutMode,
    reason: string
): Promise<void> {
    try {
        await supabase.from('audit_logs').insert({
            action: 'rollout.automatic_fallback',
            entity_type: 'venue',
            entity_id: venueId,
            actor_id: null, // System action
            metadata: {
                from_mode: fromMode,
                to_mode: toMode,
                reason,
                automatic: true,
            },
            created_at: new Date().toISOString(),
        });
    } catch {
        console.error('Failed to log automatic fallback');
    }
}
