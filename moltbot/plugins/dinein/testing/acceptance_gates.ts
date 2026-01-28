/**
 * Acceptance Gates
 * 
 * Go/No-go criteria for pilot rollout.
 */

export interface AcceptanceGate {
    id: string;
    description: string;
    required: boolean;
    testIds: string[];
}

export const ACCEPTANCE_GATES: AcceptanceGate[] = [
    // Must pass
    {
        id: "GATE_CRITICAL_FLOWS",
        description: "All critical flows pass",
        required: true,
        testIds: ["T1", "T2", "T3", "T4", "T5", "T6", "T7"]
    },
    {
        id: "GATE_SECURITY_BOUNDARIES",
        description: "Tenant mismatch, rate limiting, and stale quote handling work",
        required: true,
        testIds: ["N2", "N3", "N4"]
    },
    {
        id: "GATE_NO_APPROVAL_BYPASS",
        description: "Mutations cannot bypass approval workflow",
        required: true,
        testIds: ["RT7"]
    },
    {
        id: "GATE_AUDIT_TRAIL",
        description: "Audit trace exists for every test action",
        required: true,
        testIds: [] // Meta-gate: checked via audit log queries
    },

    // Recommended (not blocking)
    {
        id: "GATE_PERFORMANCE",
        description: "UIPlan p95 latency < 500ms",
        required: false,
        testIds: []
    },
    {
        id: "GATE_REALTIME",
        description: "Realtime updates reliable in 95% of runs",
        required: false,
        testIds: []
    },
    {
        id: "GATE_GRACEFUL_DEGRADATION",
        description: "System handles dependency failures gracefully",
        required: false,
        testIds: ["N5"]
    }
];

export interface TestResult {
    testId: string;
    passed: boolean;
    duration_ms: number;
    correlationId: string;
    errors?: string[];
}

/**
 * Evaluate all gates and return go/no-go decision.
 */
export function evaluateGates(results: TestResult[]): {
    go: boolean;
    summary: { gateId: string; passed: boolean; required: boolean }[];
    blockers: string[];
} {
    const resultMap = new Map(results.map(r => [r.testId, r]));
    const summary: { gateId: string; passed: boolean; required: boolean }[] = [];
    const blockers: string[] = [];

    for (const gate of ACCEPTANCE_GATES) {
        let gatePassed = true;

        if (gate.testIds.length > 0) {
            gatePassed = gate.testIds.every(id => {
                const result = resultMap.get(id);
                return result?.passed ?? false;
            });
        }

        summary.push({
            gateId: gate.id,
            passed: gatePassed,
            required: gate.required
        });

        if (!gatePassed && gate.required) {
            blockers.push(gate.id);
        }
    }

    return {
        go: blockers.length === 0,
        summary,
        blockers
    };
}

/**
 * Pilot checklist items.
 */
export const PILOT_CHECKLIST = [
    { step: 1, action: "Seed 1-3 real venues with complete content pack" },
    { step: 2, action: "Run in shadow mode first (UIPlan only, no submits)" },
    { step: 3, action: "Enable submits for staff-only test day" },
    { step: 4, action: "Enable for small guest cohort with monitoring alerts on" },
    { step: 5, action: "Monitor dashboards for 24h before full rollout" }
];
