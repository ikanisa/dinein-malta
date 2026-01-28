// deno-lint-ignore-file no-explicit-any
/**
 * KPI Tracking Module for Rollout Strategy
 * 
 * Tracks metrics across four categories for gate decisions:
 * - Reliability: UIPlan validity, latency, error rates
 * - Security: Tenant isolation, tool access violations
 * - Business: Conversion funnel metrics, revenue
 * - UX Quality: Bounce rate, issue reports, compliance
 * 
 * Provides functions to:
 * - Record individual metric events
 * - Aggregate into snapshots for gate evaluation
 * - Query historical KPI data
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";


// =============================================================================
// TYPES
// =============================================================================

export interface RolloutKPIs {
    // Reliability KPIs
    uiplan_valid_rate: number;        // UIPlan schema pass rate (0-1)
    agent_latency_p95_ms: number;     // 95th percentile response time
    tool_error_rate: number;          // Tool errors / total calls (0-1)
    realtime_delivery_rate: number;   // Realtime update success (0-1)

    // Security KPIs
    tenant_mismatch_count: number;    // Cross-tenant access attempts
    forbidden_tool_attempts: number;  // Blocked tool calls
    approval_bypass_attempts: number; // Mutations without approval

    // Business KPIs
    home_to_venue_ctr: number;        // Impressions → venue click rate
    menu_to_cart_rate: number;        // Menu view → add_to_cart rate
    checkout_to_submit_rate: number;  // Checkout start → order submit rate
    avg_order_value: number;          // Average order value in cents
    service_call_sla_seconds: number; // Time to staff acknowledgement

    // UX Quality KPIs
    bounce_rate: number;              // Single-page sessions / total
    user_reported_issues: number;     // Issue reports in period
    allergy_warning_compliance: number; // Allergen warnings shown / required
}

export interface KPIEvent {
    eventType: KPIEventType;
    venueId: string;
    value?: number;
    metadata?: Record<string, unknown>;
    timestamp?: string;
}

export type KPIEventType =
    // Reliability
    | 'uiplan_valid'
    | 'uiplan_invalid'
    | 'agent_latency'
    | 'tool_success'
    | 'tool_error'
    | 'realtime_delivered'
    | 'realtime_failed'
    // Security
    | 'tenant_mismatch'
    | 'forbidden_tool'
    | 'approval_bypass'
    // Business
    | 'venue_impression'
    | 'venue_click'
    | 'menu_view'
    | 'cart_add'
    | 'checkout_start'
    | 'order_submit'
    | 'order_value'
    | 'service_call_made'
    | 'service_call_ack'
    // UX
    | 'session_start'
    | 'session_bounce'
    | 'issue_report'
    | 'allergy_warning_shown'
    | 'allergy_warning_required';

export interface KPISnapshot {
    venueId: string;
    periodStart: string;
    periodEnd: string;
    kpis: Partial<RolloutKPIs>;
    sampleSize: number;
}

// =============================================================================
// KPI EVENT RECORDING
// =============================================================================

// In-memory buffer for batching KPI events
const eventBuffer: KPIEvent[] = [];
const MAX_BUFFER_SIZE = 100;
const FLUSH_INTERVAL_MS = 30_000; // 30 seconds

let flushTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Record a KPI event for later aggregation.
 */
export function recordKPIEvent(
    eventType: KPIEventType,
    venueId: string,
    value?: number,
    metadata?: Record<string, unknown>
): void {
    const event: KPIEvent = {
        eventType,
        venueId,
        value,
        metadata,
        timestamp: new Date().toISOString(),
    };

    eventBuffer.push(event);

    // Flush if buffer is full
    if (eventBuffer.length >= MAX_BUFFER_SIZE) {
        // Note: In edge function context, we'd flush to DB here
        // For now, log as structured JSON for observability pipeline
        flushEventsToLog();
    }
}

/**
 * Flush buffered events to structured log.
 */
function flushEventsToLog(): void {
    if (eventBuffer.length === 0) return;

    const batch = eventBuffer.splice(0, eventBuffer.length);

    // Log as batch for observability pipeline to pick up
    console.log(JSON.stringify({
        type: 'kpi_event_batch',
        count: batch.length,
        events: batch,
        flushedAt: new Date().toISOString(),
    }));
}

// =============================================================================
// CONVENIENCE RECORDING FUNCTIONS
// =============================================================================

export function recordUIPlanResult(venueId: string, valid: boolean): void {
    recordKPIEvent(valid ? 'uiplan_valid' : 'uiplan_invalid', venueId);
}

export function recordAgentLatency(venueId: string, latencyMs: number): void {
    recordKPIEvent('agent_latency', venueId, latencyMs);
}

export function recordToolExecution(venueId: string, success: boolean, toolName?: string): void {
    recordKPIEvent(success ? 'tool_success' : 'tool_error', venueId, undefined, { toolName });
}

export function recordSecurityViolation(
    type: 'tenant_mismatch' | 'forbidden_tool' | 'approval_bypass',
    venueId: string,
    details?: Record<string, unknown>
): void {
    recordKPIEvent(type, venueId, 1, details);
}

export function recordFunnelEvent(
    step: 'venue_impression' | 'venue_click' | 'menu_view' | 'cart_add' | 'checkout_start' | 'order_submit',
    venueId: string
): void {
    recordKPIEvent(step, venueId);
}

export function recordOrderValue(venueId: string, valueCents: number): void {
    recordKPIEvent('order_value', venueId, valueCents);
}

export function recordServiceCallTiming(venueId: string, type: 'made' | 'ack', durationMs?: number): void {
    recordKPIEvent(type === 'made' ? 'service_call_made' : 'service_call_ack', venueId, durationMs);
}

export function recordAllergyCompliance(venueId: string, type: 'shown' | 'required'): void {
    recordKPIEvent(type === 'shown' ? 'allergy_warning_shown' : 'allergy_warning_required', venueId);
}

// =============================================================================
// SNAPSHOT GENERATION
// =============================================================================

/**
 * Generate a KPI snapshot by aggregating events from the database.
 */
export async function generateKPISnapshot(
    supabase: SupabaseClient,
    venueId: string,
    periodMinutes: number = 60
): Promise<KPISnapshot> {
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd.getTime() - periodMinutes * 60 * 1000);

    // Query agent_actions for metrics
    const { data: actions } = await supabase
        .from('agent_actions')
        .select('*')
        .eq('venue_id', venueId)
        .gte('created_at', periodStart.toISOString())
        .lte('created_at', periodEnd.toISOString());

    // Query orders for business metrics
    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status, created_at')
        .eq('venue_id', venueId)
        .gte('created_at', periodStart.toISOString());

    // Calculate KPIs
    const kpis: Partial<RolloutKPIs> = {};
    let sampleSize = 0;

    if (actions && actions.length > 0) {
        sampleSize = actions.length;

        // Tool error rate
        const toolActions = actions.filter((a: any) => a.action_type?.startsWith('tool_'));
        const toolErrors = toolActions.filter((a: any) => !a.success).length;
        kpis.tool_error_rate = toolActions.length > 0 ? toolErrors / toolActions.length : 0;

        // Agent latency (from action durations if tracked)
        const latencies = actions
            .filter((a: any) => a.action_data?.latency_ms)
            .map((a: any) => a.action_data.latency_ms as number);
        if (latencies.length > 0) {
            latencies.sort((a: number, b: number) => a - b);
            const p95Index = Math.floor(latencies.length * 0.95);
            kpis.agent_latency_p95_ms = latencies[p95Index] || latencies[latencies.length - 1];
        }

        // Security metrics
        const securityActions = actions.filter((a: any) => a.action_type === 'security_violation');
        kpis.tenant_mismatch_count = securityActions.filter((a: any) => a.action_data?.type === 'tenant_mismatch').length;
        kpis.forbidden_tool_attempts = securityActions.filter((a: any) => a.action_data?.type === 'forbidden_tool').length;
        kpis.approval_bypass_attempts = securityActions.filter((a: any) => a.action_data?.type === 'approval_bypass').length;
    }

    if (orders && orders.length > 0) {
        // Average order value
        const orderValues = orders.map((o: any) => o.total_amount || 0);
        kpis.avg_order_value = orderValues.reduce((a: number, b: number) => a + b, 0) / orderValues.length;
    }

    return {
        venueId,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        kpis,
        sampleSize,
    };
}


/**
 * Save a KPI snapshot to the database.
 */
export async function saveKPISnapshot(
    supabase: SupabaseClient,
    snapshot: KPISnapshot
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('kpi_snapshots')
        .insert({
            venue_id: snapshot.venueId,
            snapshot_at: snapshot.periodEnd,
            period_minutes: Math.round(
                (new Date(snapshot.periodEnd).getTime() - new Date(snapshot.periodStart).getTime()) / 60000
            ),
            // Flatten KPIs into columns
            uiplan_valid_rate: snapshot.kpis.uiplan_valid_rate,
            agent_latency_p95_ms: snapshot.kpis.agent_latency_p95_ms,
            tool_error_rate: snapshot.kpis.tool_error_rate,
            realtime_delivery_rate: snapshot.kpis.realtime_delivery_rate,
            tenant_mismatch_count: snapshot.kpis.tenant_mismatch_count,
            forbidden_tool_attempts: snapshot.kpis.forbidden_tool_attempts,
            approval_bypass_attempts: snapshot.kpis.approval_bypass_attempts,
            home_to_venue_ctr: snapshot.kpis.home_to_venue_ctr,
            menu_to_cart_rate: snapshot.kpis.menu_to_cart_rate,
            checkout_to_submit_rate: snapshot.kpis.checkout_to_submit_rate,
            avg_order_value: snapshot.kpis.avg_order_value,
            service_call_sla_seconds: snapshot.kpis.service_call_sla_seconds,
            bounce_rate: snapshot.kpis.bounce_rate,
            user_reported_issues: snapshot.kpis.user_reported_issues,
            allergy_warning_compliance: snapshot.kpis.allergy_warning_compliance,
            sample_size: snapshot.sampleSize,
        });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Get historical KPI snapshots for a venue.
 */
export async function getKPIHistory(
    supabase: SupabaseClient,
    venueId: string,
    limit: number = 24
): Promise<KPISnapshot[]> {
    const { data } = await supabase
        .from('kpi_snapshots')
        .select('*')
        .eq('venue_id', venueId)
        .order('snapshot_at', { ascending: false })
        .limit(limit);

    if (!data) return [];

    return data.map((row: any) => ({
        venueId: row.venue_id,
        periodStart: new Date(new Date(row.snapshot_at).getTime() - row.period_minutes * 60000).toISOString(),
        periodEnd: row.snapshot_at,
        sampleSize: row.sample_size,
        kpis: {
            uiplan_valid_rate: row.uiplan_valid_rate,
            agent_latency_p95_ms: row.agent_latency_p95_ms,
            tool_error_rate: row.tool_error_rate,
            realtime_delivery_rate: row.realtime_delivery_rate,
            tenant_mismatch_count: row.tenant_mismatch_count,
            forbidden_tool_attempts: row.forbidden_tool_attempts,
            approval_bypass_attempts: row.approval_bypass_attempts,
            home_to_venue_ctr: row.home_to_venue_ctr,
            menu_to_cart_rate: row.menu_to_cart_rate,
            checkout_to_submit_rate: row.checkout_to_submit_rate,
            avg_order_value: row.avg_order_value,
            service_call_sla_seconds: row.service_call_sla_seconds,
            bounce_rate: row.bounce_rate,
            user_reported_issues: row.user_reported_issues,
            allergy_warning_compliance: row.allergy_warning_compliance,
        },
    }));
}


// =============================================================================
// GATE THRESHOLD EVALUATION
// =============================================================================

export interface GateThresholds {
    // For RM-1 → RM-2
    minUIPlanValidRate: number;      // >= 99%
    maxToolErrorRate: number;        // < 2%
    maxTenantMismatch: number;       // = 0
    maxApprovalBypass: number;       // = 0

    // For RM-2 → RM-3
    minCheckoutToSubmitRate: number; // >= 50%
    maxServiceCallSLA: number;       // <= 180 seconds
    minAllergyCompliance: number;    // >= 99%
}

export const DEFAULT_GATE_THRESHOLDS: GateThresholds = {
    minUIPlanValidRate: 0.99,
    maxToolErrorRate: 0.02,
    maxTenantMismatch: 0,
    maxApprovalBypass: 0,
    minCheckoutToSubmitRate: 0.5,
    maxServiceCallSLA: 180,
    minAllergyCompliance: 0.99,
};

/**
 * Evaluate if KPIs meet gate requirements.
 */
export function evaluateGateThresholds(
    kpis: Partial<RolloutKPIs>,
    gate: 'RM1_to_RM2' | 'RM2_to_RM3',
    thresholds: GateThresholds = DEFAULT_GATE_THRESHOLDS
): { passed: boolean; blockers: string[] } {
    const blockers: string[] = [];

    if (gate === 'RM1_to_RM2') {
        if (kpis.uiplan_valid_rate !== undefined && kpis.uiplan_valid_rate < thresholds.minUIPlanValidRate) {
            blockers.push(`UIPlan valid rate ${(kpis.uiplan_valid_rate * 100).toFixed(1)}% < ${thresholds.minUIPlanValidRate * 100}%`);
        }
        if (kpis.tool_error_rate !== undefined && kpis.tool_error_rate >= thresholds.maxToolErrorRate) {
            blockers.push(`Tool error rate ${(kpis.tool_error_rate * 100).toFixed(1)}% >= ${thresholds.maxToolErrorRate * 100}%`);
        }
        if (kpis.tenant_mismatch_count !== undefined && kpis.tenant_mismatch_count > thresholds.maxTenantMismatch) {
            blockers.push(`Tenant mismatch count ${kpis.tenant_mismatch_count} > ${thresholds.maxTenantMismatch}`);
        }
        if (kpis.approval_bypass_attempts !== undefined && kpis.approval_bypass_attempts > thresholds.maxApprovalBypass) {
            blockers.push(`Approval bypass attempts ${kpis.approval_bypass_attempts} > ${thresholds.maxApprovalBypass}`);
        }
    }

    if (gate === 'RM2_to_RM3') {
        if (kpis.checkout_to_submit_rate !== undefined && kpis.checkout_to_submit_rate < thresholds.minCheckoutToSubmitRate) {
            blockers.push(`Checkout to submit rate ${(kpis.checkout_to_submit_rate * 100).toFixed(1)}% < ${thresholds.minCheckoutToSubmitRate * 100}%`);
        }
        if (kpis.service_call_sla_seconds !== undefined && kpis.service_call_sla_seconds > thresholds.maxServiceCallSLA) {
            blockers.push(`Service call SLA ${kpis.service_call_sla_seconds}s > ${thresholds.maxServiceCallSLA}s`);
        }
        if (kpis.allergy_warning_compliance !== undefined && kpis.allergy_warning_compliance < thresholds.minAllergyCompliance) {
            blockers.push(`Allergy compliance ${(kpis.allergy_warning_compliance * 100).toFixed(1)}% < ${thresholds.minAllergyCompliance * 100}%`);
        }
    }

    return {
        passed: blockers.length === 0,
        blockers,
    };
}
