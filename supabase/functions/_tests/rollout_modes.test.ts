/**
 * Integration Tests for Rollout Mode Transitions
 * 
 * Tests the mode transition logic including:
 * - Valid transition paths
 * - Gate requirement evaluation
 * - Invalid transition blocking
 */

import {
    assertEquals,
    assertExists,
} from "https://deno.land/std@0.168.0/testing/asserts.ts";
import {
    describe,
    it,
} from "https://deno.land/std@0.168.0/testing/bdd.ts";

// =============================================================================
// TYPES
// =============================================================================

type RolloutMode = 'off' | 'shadow_ui' | 'assisted' | 'full';

interface RolloutKPIs {
    tool_error_rate: number;
    uiplan_valid_rate: number;
    tenant_mismatch_count: number;
    approval_bypass_attempts: number;
    agent_latency_p95_ms: number;
    avg_order_value: number | null;
}

interface GateRequirement {
    kpi: keyof RolloutKPIs;
    operator: '<' | '<=' | '>' | '>=' | '==';
    threshold: number;
    description: string;
}

interface GateEvaluation {
    allowed: boolean;
    blockers: string[];
}

// =============================================================================
// MODE TRANSITION LOGIC
// =============================================================================

const VALID_TRANSITIONS: Record<RolloutMode, RolloutMode[]> = {
    'off': ['shadow_ui'],
    'shadow_ui': ['off', 'assisted'],
    'assisted': ['shadow_ui', 'full'],  // Can go back to shadow_ui
    'full': ['assisted'],                // Can go back to assisted
};

function isValidTransition(from: RolloutMode, to: RolloutMode): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

const GATE_REQUIREMENTS: Record<string, GateRequirement[]> = {
    'shadow_ui_to_assisted': [
        { kpi: 'tool_error_rate', operator: '<', threshold: 0.02, description: 'Tool error rate < 2%' },
        { kpi: 'uiplan_valid_rate', operator: '>=', threshold: 0.99, description: 'UIPlan valid rate >= 99%' },
        { kpi: 'tenant_mismatch_count', operator: '==', threshold: 0, description: 'Zero tenant mismatches' },
        { kpi: 'approval_bypass_attempts', operator: '==', threshold: 0, description: 'Zero approval bypasses' },
    ],
    'assisted_to_full': [
        { kpi: 'tool_error_rate', operator: '<', threshold: 0.01, description: 'Tool error rate < 1%' },
        { kpi: 'uiplan_valid_rate', operator: '>=', threshold: 0.995, description: 'UIPlan valid rate >= 99.5%' },
        { kpi: 'tenant_mismatch_count', operator: '==', threshold: 0, description: 'Zero tenant mismatches' },
        { kpi: 'approval_bypass_attempts', operator: '==', threshold: 0, description: 'Zero approval bypasses' },
        { kpi: 'agent_latency_p95_ms', operator: '<', threshold: 2000, description: 'Latency p95 < 2s' },
    ],
};

function evaluateRequirement(
    kpis: RolloutKPIs,
    req: GateRequirement
): boolean {
    const value = kpis[req.kpi] as number;

    switch (req.operator) {
        case '<': return value < req.threshold;
        case '<=': return value <= req.threshold;
        case '>': return value > req.threshold;
        case '>=': return value >= req.threshold;
        case '==': return value === req.threshold;
        default: return false;
    }
}

function evaluateGate(
    from: RolloutMode,
    to: RolloutMode,
    kpis: RolloutKPIs
): GateEvaluation {
    const gateKey = `${from}_to_${to}`;
    const requirements = GATE_REQUIREMENTS[gateKey];

    if (!requirements) {
        // No gate requirements for this transition
        return { allowed: true, blockers: [] };
    }

    const blockers: string[] = [];

    for (const req of requirements) {
        if (!evaluateRequirement(kpis, req)) {
            blockers.push(req.description);
        }
    }

    return { allowed: blockers.length === 0, blockers };
}

function canTransition(
    from: RolloutMode,
    to: RolloutMode,
    kpis: RolloutKPIs | null,
    skipGates: boolean = false
): { allowed: boolean; reason?: string; blockers?: string[] } {
    // Check valid transition path
    if (!isValidTransition(from, to)) {
        return { allowed: false, reason: `Invalid transition: ${from} → ${to}` };
    }

    // Skip gate checks if requested (emergency fallback)
    if (skipGates) {
        return { allowed: true };
    }

    // Check gate requirements
    if (!kpis) {
        return { allowed: false, reason: 'No KPI data available' };
    }

    const gate = evaluateGate(from, to, kpis);
    if (!gate.allowed) {
        return { allowed: false, reason: 'Gate requirements not met', blockers: gate.blockers };
    }

    return { allowed: true };
}

// =============================================================================
// TESTS
// =============================================================================

describe("Valid Transitions", () => {
    it("should allow off → shadow_ui", () => {
        assertEquals(isValidTransition('off', 'shadow_ui'), true);
    });

    it("should allow shadow_ui → assisted", () => {
        assertEquals(isValidTransition('shadow_ui', 'assisted'), true);
    });

    it("should allow assisted → full", () => {
        assertEquals(isValidTransition('assisted', 'full'), true);
    });

    it("should allow rollback: full → assisted", () => {
        assertEquals(isValidTransition('full', 'assisted'), true);
    });

    it("should allow rollback: assisted → shadow_ui", () => {
        assertEquals(isValidTransition('assisted', 'shadow_ui'), true);
    });

    it("should allow rollback: shadow_ui → off", () => {
        assertEquals(isValidTransition('shadow_ui', 'off'), true);
    });
});

describe("Invalid Transitions", () => {
    it("should block off → assisted (skip shadow_ui)", () => {
        assertEquals(isValidTransition('off', 'assisted'), false);
    });

    it("should block off → full (skip stages)", () => {
        assertEquals(isValidTransition('off', 'full'), false);
    });

    it("should block shadow_ui → full (skip assisted)", () => {
        assertEquals(isValidTransition('shadow_ui', 'full'), false);
    });

    it("should block full → off (skip stages)", () => {
        assertEquals(isValidTransition('full', 'off'), false);
    });
});

describe("Gate Evaluation - shadow_ui → assisted", () => {
    it("should pass with good KPIs", () => {
        const kpis: RolloutKPIs = {
            tool_error_rate: 0.01,
            uiplan_valid_rate: 0.995,
            tenant_mismatch_count: 0,
            approval_bypass_attempts: 0,
            agent_latency_p95_ms: 1500,
            avg_order_value: 25.50,
        };

        const result = evaluateGate('shadow_ui', 'assisted', kpis);

        assertEquals(result.allowed, true);
        assertEquals(result.blockers.length, 0);
    });

    it("should fail with high error rate", () => {
        const kpis: RolloutKPIs = {
            tool_error_rate: 0.05, // Too high
            uiplan_valid_rate: 0.99,
            tenant_mismatch_count: 0,
            approval_bypass_attempts: 0,
            agent_latency_p95_ms: 1500,
            avg_order_value: 25.50,
        };

        const result = evaluateGate('shadow_ui', 'assisted', kpis);

        assertEquals(result.allowed, false);
        assertEquals(result.blockers.includes('Tool error rate < 2%'), true);
    });

    it("should fail with any tenant mismatch", () => {
        const kpis: RolloutKPIs = {
            tool_error_rate: 0.01,
            uiplan_valid_rate: 0.99,
            tenant_mismatch_count: 1, // Security violation
            approval_bypass_attempts: 0,
            agent_latency_p95_ms: 1500,
            avg_order_value: 25.50,
        };

        const result = evaluateGate('shadow_ui', 'assisted', kpis);

        assertEquals(result.allowed, false);
        assertEquals(result.blockers.includes('Zero tenant mismatches'), true);
    });

    it("should fail with multiple violations", () => {
        const kpis: RolloutKPIs = {
            tool_error_rate: 0.05,
            uiplan_valid_rate: 0.90,
            tenant_mismatch_count: 2,
            approval_bypass_attempts: 1,
            agent_latency_p95_ms: 1500,
            avg_order_value: 25.50,
        };

        const result = evaluateGate('shadow_ui', 'assisted', kpis);

        assertEquals(result.allowed, false);
        assertEquals(result.blockers.length >= 3, true);
    });
});

describe("Gate Evaluation - assisted → full", () => {
    it("should pass with excellent KPIs", () => {
        const kpis: RolloutKPIs = {
            tool_error_rate: 0.005,
            uiplan_valid_rate: 0.998,
            tenant_mismatch_count: 0,
            approval_bypass_attempts: 0,
            agent_latency_p95_ms: 1000,
            avg_order_value: 30.00,
        };

        const result = evaluateGate('assisted', 'full', kpis);

        assertEquals(result.allowed, true);
    });

    it("should fail with latency over threshold", () => {
        const kpis: RolloutKPIs = {
            tool_error_rate: 0.005,
            uiplan_valid_rate: 0.998,
            tenant_mismatch_count: 0,
            approval_bypass_attempts: 0,
            agent_latency_p95_ms: 2500, // Too slow
            avg_order_value: 30.00,
        };

        const result = evaluateGate('assisted', 'full', kpis);

        assertEquals(result.allowed, false);
        assertEquals(result.blockers.includes('Latency p95 < 2s'), true);
    });
});

describe("canTransition", () => {
    it("should allow valid transition with passing gates", () => {
        const kpis: RolloutKPIs = {
            tool_error_rate: 0.01,
            uiplan_valid_rate: 0.995,
            tenant_mismatch_count: 0,
            approval_bypass_attempts: 0,
            agent_latency_p95_ms: 1500,
            avg_order_value: 25.50,
        };

        const result = canTransition('shadow_ui', 'assisted', kpis);

        assertEquals(result.allowed, true);
    });

    it("should block invalid transition path", () => {
        const kpis: RolloutKPIs = {
            tool_error_rate: 0.01,
            uiplan_valid_rate: 0.995,
            tenant_mismatch_count: 0,
            approval_bypass_attempts: 0,
            agent_latency_p95_ms: 1500,
            avg_order_value: 25.50,
        };

        const result = canTransition('off', 'full', kpis);

        assertEquals(result.allowed, false);
        assertExists(result.reason);
    });

    it("should block when no KPI data", () => {
        const result = canTransition('shadow_ui', 'assisted', null);

        assertEquals(result.allowed, false);
        assertEquals(result.reason, 'No KPI data available');
    });

    it("should allow skip gates for emergency", () => {
        const badKpis: RolloutKPIs = {
            tool_error_rate: 0.50,
            uiplan_valid_rate: 0.50,
            tenant_mismatch_count: 10,
            approval_bypass_attempts: 5,
            agent_latency_p95_ms: 10000,
            avg_order_value: null,
        };

        // Normal check would fail
        const normalResult = canTransition('full', 'assisted', badKpis);
        assertEquals(normalResult.allowed, true); // Rollback has no gates

        // But even if there were gates, skipGates bypasses
        const skipResult = canTransition('shadow_ui', 'assisted', badKpis, true);
        assertEquals(skipResult.allowed, true);
    });
});

describe("Rollback Transitions", () => {
    it("should allow rollback without gate checks", () => {
        const badKpis: RolloutKPIs = {
            tool_error_rate: 0.50,
            uiplan_valid_rate: 0.50,
            tenant_mismatch_count: 10,
            approval_bypass_attempts: 5,
            agent_latency_p95_ms: 10000,
            avg_order_value: null,
        };

        // Rollbacks have no gates defined
        const result1 = canTransition('full', 'assisted', badKpis);
        const result2 = canTransition('assisted', 'shadow_ui', badKpis);
        const result3 = canTransition('shadow_ui', 'off', badKpis);

        assertEquals(result1.allowed, true);
        assertEquals(result2.allowed, true);
        assertEquals(result3.allowed, true);
    });
});
