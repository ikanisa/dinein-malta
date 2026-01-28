/**
 * Rollout Mode Manager
 * 
 * Manages the progressive rollout of AI capabilities:
 * - RM-0 (Off): Baseline static UI
 * - RM-1 (Shadow UI): UIPlan only, no cart/order
 * - RM-2 (Assisted): Cart + Quote, submit gated
 * - RM-3 (Full): End-to-end operational
 * 
 * Includes gate validation for safe mode transitions.
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { type FeatureFlag } from "./feature_flags.ts";

// =============================================================================
// TYPES
// =============================================================================

export const ROLLOUT_MODES = ['off', 'shadow_ui', 'assisted', 'full'] as const;
export type RolloutMode = typeof ROLLOUT_MODES[number];

export interface ModeBehavior {
    uiPlanEnabled: boolean;
    waiterEnabled: boolean;
    cartEnabled: boolean;
    pricingQuoteEnabled: boolean;
    orderSubmitEnabled: boolean;
    realtimeEnabled: boolean;
    serviceCallsEnabled: boolean;
}

export interface ModeConfig {
    id: RolloutMode;
    name: string;
    description: string;
    enabledFlags: FeatureFlag[];
    disabledFlags: FeatureFlag[];
    behavior: ModeBehavior;
}

export interface VenueRolloutState {
    venueId: string;
    mode: RolloutMode;
    config: ModeConfig;
    updatedAt: string;
    updatedBy: string | null;
}

export interface GateEvaluation {
    allowed: boolean;
    gate: string;
    blockers: string[];
}

// =============================================================================
// MODE CONFIGURATIONS
// =============================================================================

export const MODE_CONFIGS: Record<RolloutMode, ModeConfig> = {
    off: {
        id: 'off',
        name: 'Off',
        description: 'Baseline: static UI and manual flows only',
        enabledFlags: [],
        disabledFlags: [
            'ui_plan_enabled',
            'waiter_enabled',
            'cart_enabled',
            'pricing_quote_enabled',
            'order_submit_enabled',
            'realtime_enabled'
        ],
        behavior: {
            uiPlanEnabled: false,
            waiterEnabled: false,
            cartEnabled: false,
            pricingQuoteEnabled: false,
            orderSubmitEnabled: false,
            realtimeEnabled: false,
            serviceCallsEnabled: false
        }
    },

    shadow_ui: {
        id: 'shadow_ui',
        name: 'Shadow UI (Read-only)',
        description: 'UIPlan generation active, no cart or order operations',
        enabledFlags: ['ui_plan_enabled'],
        disabledFlags: [
            'waiter_enabled',
            'cart_enabled',
            'pricing_quote_enabled',
            'order_submit_enabled',
            'realtime_enabled'
        ],
        behavior: {
            uiPlanEnabled: true,
            waiterEnabled: false,
            cartEnabled: false,
            pricingQuoteEnabled: false,
            orderSubmitEnabled: false,
            realtimeEnabled: false,
            serviceCallsEnabled: false
        }
    },

    assisted: {
        id: 'assisted',
        name: 'Assisted Ordering',
        description: 'Cart and quotes enabled, order submit gated or staff-only',
        enabledFlags: [
            'ui_plan_enabled',
            'waiter_enabled',
            'cart_enabled',
            'pricing_quote_enabled'
        ],
        disabledFlags: [
            'order_submit_enabled',
            'realtime_enabled'
        ],
        behavior: {
            uiPlanEnabled: true,
            waiterEnabled: true,
            cartEnabled: true,
            pricingQuoteEnabled: true,
            orderSubmitEnabled: false,
            realtimeEnabled: false,
            serviceCallsEnabled: true
        }
    },

    full: {
        id: 'full',
        name: 'Full Mode',
        description: 'Complete end-to-end AI ordering and tracking',
        enabledFlags: [
            'ui_plan_enabled',
            'waiter_enabled',
            'cart_enabled',
            'pricing_quote_enabled',
            'order_submit_enabled',
            'realtime_enabled'
        ],
        disabledFlags: [],
        behavior: {
            uiPlanEnabled: true,
            waiterEnabled: true,
            cartEnabled: true,
            pricingQuoteEnabled: true,
            orderSubmitEnabled: true,
            realtimeEnabled: true,
            serviceCallsEnabled: true
        }
    }
};

// =============================================================================
// GATE REQUIREMENTS
// =============================================================================

interface GateRequirement {
    kpi: string;
    operator: '>=' | '<=' | '<' | '>' | '=';
    threshold: number;
    critical: boolean;
}

const GATE_REQUIREMENTS: Record<string, GateRequirement[]> = {
    'gate_RM1_to_RM2': [
        { kpi: 'uiplan_valid_rate', operator: '>=', threshold: 0.99, critical: true },
        { kpi: 'tool_error_rate', operator: '<', threshold: 0.02, critical: true },
        { kpi: 'tenant_mismatch_count', operator: '=', threshold: 0, critical: true },
        { kpi: 'approval_bypass_attempts', operator: '=', threshold: 0, critical: true }
    ],
    'gate_RM2_to_RM3': [
        { kpi: 'checkout_to_submit_rate', operator: '>=', threshold: 0.5, critical: false },
        { kpi: 'tool_error_rate', operator: '<', threshold: 0.01, critical: true },
        { kpi: 'service_call_sla_seconds', operator: '<=', threshold: 180, critical: false }, // 3 minutes
        { kpi: 'allergy_warning_compliance', operator: '>=', threshold: 0.99, critical: true }
    ]
};

// =============================================================================
// MODE RETRIEVAL
// =============================================================================

/**
 * Get the current rollout mode for a venue.
 */
export async function getVenueRolloutMode(
    supabase: SupabaseClient,
    venueId: string
): Promise<VenueRolloutState> {
    const { data, error } = await supabase
        .from('rollout_modes')
        .select('venue_id, mode, updated_at, updated_by')
        .eq('venue_id', venueId)
        .single();

    // Default to 'off' if not found
    const mode: RolloutMode = error || !data ? 'off' : (data.mode as RolloutMode);
    const config = MODE_CONFIGS[mode];

    return {
        venueId,
        mode,
        config,
        updatedAt: data?.updated_at ?? new Date().toISOString(),
        updatedBy: data?.updated_by ?? null
    };
}

/**
 * Get the behavior for a venue's current rollout mode.
 */
export async function getVenueBehavior(
    supabase: SupabaseClient,
    venueId: string
): Promise<ModeBehavior> {
    const state = await getVenueRolloutMode(supabase, venueId);
    return state.config.behavior;
}

// =============================================================================
// MODE TRANSITIONS
// =============================================================================

/**
 * Check if a mode transition is allowed based on KPI gates.
 */
export async function canTransitionMode(
    supabase: SupabaseClient,
    venueId: string,
    fromMode: RolloutMode,
    toMode: RolloutMode
): Promise<GateEvaluation> {
    // Allow stepping down (always safe)
    const fromIndex = ROLLOUT_MODES.indexOf(fromMode);
    const toIndex = ROLLOUT_MODES.indexOf(toMode);
    if (toIndex < fromIndex) {
        return { allowed: true, gate: 'downgrade', blockers: [] };
    }

    // Determine gate to apply
    let gateId: string;
    if (fromMode === 'off' && toMode === 'shadow_ui') {
        // No gate for initial shadow mode
        return { allowed: true, gate: 'initial_shadow', blockers: [] };
    } else if (fromMode === 'shadow_ui' && toMode === 'assisted') {
        gateId = 'gate_RM1_to_RM2';
    } else if (fromMode === 'assisted' && toMode === 'full') {
        gateId = 'gate_RM2_to_RM3';
    } else if (toIndex - fromIndex > 1) {
        // Don't allow skipping modes
        return {
            allowed: false,
            gate: 'skip_not_allowed',
            blockers: ['Cannot skip modes. Transition one step at a time.']
        };
    } else {
        gateId = 'unknown';
    }

    // Get KPIs
    const { data: kpiData } = await supabase
        .from('kpi_snapshots')
        .select('*')
        .eq('venue_id', venueId)
        .order('snapshot_at', { ascending: false })
        .limit(1)
        .single();

    if (!kpiData) {
        return {
            allowed: false,
            gate: gateId,
            blockers: ['No KPI data available. Run in current mode longer to collect metrics.']
        };
    }

    // Evaluate gate requirements
    const requirements = GATE_REQUIREMENTS[gateId] ?? [];
    const blockers: string[] = [];

    for (const req of requirements) {
        const value = kpiData[req.kpi as keyof typeof kpiData] as number | null;

        if (value === null || value === undefined) {
            if (req.critical) {
                blockers.push(`Missing required KPI: ${req.kpi}`);
            }
            continue;
        }

        let passed = false;
        switch (req.operator) {
            case '>=': passed = value >= req.threshold; break;
            case '<=': passed = value <= req.threshold; break;
            case '>': passed = value > req.threshold; break;
            case '<': passed = value < req.threshold; break;
            case '=': passed = value === req.threshold; break;
        }

        if (!passed) {
            blockers.push(`${req.kpi} ${req.operator} ${req.threshold} (actual: ${value})`);
        }
    }

    // Record gate evaluation
    await recordGateEvaluation(supabase, venueId, fromMode, toMode, gateId, blockers.length === 0, blockers);

    return {
        allowed: blockers.length === 0,
        gate: gateId,
        blockers
    };
}

/**
 * Transition a venue to a new rollout mode.
 */
export async function transitionMode(
    supabase: SupabaseClient,
    venueId: string,
    toMode: RolloutMode,
    userId?: string,
    skipGates: boolean = false
): Promise<{ success: boolean; error?: string; blockers?: string[] }> {
    // Get current mode
    const currentState = await getVenueRolloutMode(supabase, venueId);
    const fromMode = currentState.mode;

    if (fromMode === toMode) {
        return { success: true }; // No change needed
    }

    // Check gate (unless explicitly skipped by admin)
    if (!skipGates) {
        const gateCheck = await canTransitionMode(supabase, venueId, fromMode, toMode);
        if (!gateCheck.allowed) {
            return {
                success: false,
                error: `Gate ${gateCheck.gate} not passed`,
                blockers: gateCheck.blockers
            };
        }
    }

    // Build transition history entry
    const historyEntry = {
        from: fromMode,
        to: toMode,
        at: new Date().toISOString(),
        by: userId,
        skippedGates: skipGates
    };

    // Update rollout mode
    const { error } = await supabase
        .from('rollout_modes')
        .upsert({
            venue_id: venueId,
            mode: toMode,
            updated_at: new Date().toISOString(),
            updated_by: userId,
            transition_history: supabase.rpc('jsonb_array_append', {
                arr: currentState.mode === 'off' ? '[]' : undefined,
                elem: historyEntry
            })
        }, {
            onConflict: 'venue_id'
        });

    if (error) {
        // Fallback: simple update without history append
        const { error: simpleError } = await supabase
            .from('rollout_modes')
            .upsert({
                venue_id: venueId,
                mode: toMode,
                updated_at: new Date().toISOString(),
                updated_by: userId
            }, {
                onConflict: 'venue_id'
            });

        if (simpleError) {
            return { success: false, error: simpleError.message };
        }
    }

    // Log to audit
    await logModeTransition(supabase, venueId, fromMode, toMode, userId, skipGates);

    return { success: true };
}

/**
 * Record a gate evaluation for audit purposes.
 */
async function recordGateEvaluation(
    supabase: SupabaseClient,
    venueId: string,
    fromMode: string,
    toMode: string,
    gateId: string,
    passed: boolean,
    blockers: string[]
): Promise<void> {
    try {
        await supabase.from('rollout_gate_evaluations').insert({
            venue_id: venueId,
            from_mode: fromMode,
            to_mode: toMode,
            gate_id: gateId,
            passed,
            blockers,
            evaluated_at: new Date().toISOString()
        });
    } catch {
        console.error('Failed to record gate evaluation');
    }
}

/**
 * Log mode transition to audit logs.
 */
async function logModeTransition(
    supabase: SupabaseClient,
    venueId: string,
    fromMode: RolloutMode,
    toMode: RolloutMode,
    userId?: string,
    skippedGates?: boolean
): Promise<void> {
    try {
        await supabase.from('audit_logs').insert({
            action: 'rollout.mode_transition',
            entity_type: 'venue',
            entity_id: venueId,
            actor_id: userId,
            metadata: { from: fromMode, to: toMode, skippedGates },
            created_at: new Date().toISOString()
        });
    } catch {
        console.error('Failed to log mode transition');
    }
}

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

/**
 * Get rollout states for all venues in a cohort.
 */
export async function getCohortRolloutStates(
    supabase: SupabaseClient,
    cohortId: string
): Promise<VenueRolloutState[]> {
    const { data: assignments } = await supabase
        .from('venue_cohort_assignments')
        .select('venue_id')
        .eq('cohort_id', cohortId);

    if (!assignments) return [];

    const states: VenueRolloutState[] = [];
    for (const assignment of assignments) {
        const state = await getVenueRolloutMode(supabase, assignment.venue_id);
        states.push(state);
    }

    return states;
}

/**
 * Transition all venues in a cohort to a new mode.
 */
export async function transitionCohort(
    supabase: SupabaseClient,
    cohortId: string,
    toMode: RolloutMode,
    userId?: string,
    skipGates: boolean = false
): Promise<{
    success: number;
    failed: number;
    errors: { venueId: string; error: string }[]
}> {
    const states = await getCohortRolloutStates(supabase, cohortId);

    let success = 0;
    let failed = 0;
    const errors: { venueId: string; error: string }[] = [];

    for (const state of states) {
        const result = await transitionMode(supabase, state.venueId, toMode, userId, skipGates);
        if (result.success) {
            success++;
        } else {
            failed++;
            errors.push({ venueId: state.venueId, error: result.error ?? 'Unknown error' });
        }
    }

    return { success, failed, errors };
}
