/**
 * E2E Tests for Rollout Scenarios
 * 
 * Tests complete rollout scenarios including:
 * - Progressive rollout from off → full
 * - Emergency rollback
 * - Kill switch activation during operation
 * - Automatic fallback triggers
 */

import {
    assertEquals,
    assertExists,
} from "https://deno.land/std@0.168.0/testing/asserts.ts";
import {
    describe,
    it,
    beforeEach,
} from "https://deno.land/std@0.168.0/testing/bdd.ts";

// =============================================================================
// TYPES
// =============================================================================

type RolloutMode = 'off' | 'shadow_ui' | 'assisted' | 'full';

interface Venue {
    id: string;
    name: string;
    country: string;
}

interface RolloutState {
    venues: Map<string, RolloutMode>;
    killSwitches: Map<string, boolean>;
    kpis: Map<string, Record<string, number>>;
}

// =============================================================================
// SIMULATED ROLLOUT ENGINE
// =============================================================================

class RolloutSimulator {
    private state: RolloutState;

    constructor() {
        this.state = {
            venues: new Map(),
            killSwitches: new Map([
                ['disable_all_ai', false],
                ['disable_waiter', false],
                ['disable_ui_plan', false],
            ]),
            kpis: new Map(),
        };
    }

    // --- Venue Management ---

    addVenue(venue: Venue): void {
        this.state.venues.set(venue.id, 'off');
    }

    getMode(venueId: string): RolloutMode {
        return this.state.venues.get(venueId) ?? 'off';
    }

    setMode(venueId: string, mode: RolloutMode): boolean {
        // Check kill switch
        if (this.state.killSwitches.get('disable_all_ai')) {
            return false;
        }
        this.state.venues.set(venueId, mode);
        return true;
    }

    // --- Kill Switches ---

    activateKillSwitch(switchId: string): void {
        this.state.killSwitches.set(switchId, true);
    }

    deactivateKillSwitch(switchId: string): void {
        this.state.killSwitches.set(switchId, false);
    }

    isKillSwitchActive(switchId: string): boolean {
        return this.state.killSwitches.get(switchId) ?? false;
    }

    isAnyAIDisabled(): boolean {
        return this.state.killSwitches.get('disable_all_ai') ?? false;
    }

    // --- KPI Simulation ---

    setKPIs(venueId: string, kpis: Record<string, number>): void {
        this.state.kpis.set(venueId, kpis);
    }

    getKPIs(venueId: string): Record<string, number> | null {
        return this.state.kpis.get(venueId) ?? null;
    }

    // --- Operation Checks ---

    canProcessAgentChat(venueId: string): { allowed: boolean; reason?: string } {
        // Check kill switches
        if (this.isKillSwitchActive('disable_all_ai')) {
            return { allowed: false, reason: 'AI_DISABLED' };
        }
        if (this.isKillSwitchActive('disable_waiter')) {
            return { allowed: false, reason: 'WAITER_DISABLED' };
        }

        // Check venue mode
        const mode = this.getMode(venueId);
        if (mode === 'off' || mode === 'shadow_ui') {
            return { allowed: false, reason: 'WAITER_NOT_ENABLED' };
        }

        return { allowed: true };
    }

    canProcessUIPlan(venueId: string): { allowed: boolean; reason?: string } {
        // Check kill switches
        if (this.isKillSwitchActive('disable_all_ai')) {
            return { allowed: false, reason: 'AI_DISABLED' };
        }
        if (this.isKillSwitchActive('disable_ui_plan')) {
            return { allowed: false, reason: 'UI_PLAN_DISABLED' };
        }

        // UI Plan works in shadow_ui and above
        const mode = this.getMode(venueId);
        if (mode === 'off') {
            return { allowed: false, reason: 'UI_PLAN_NOT_ENABLED' };
        }

        return { allowed: true };
    }

    // --- Automatic Fallback ---

    checkAndApplyFallback(venueId: string): { action: 'none' | 'fallback'; reason?: string } {
        const kpis = this.getKPIs(venueId);
        if (!kpis) return { action: 'none' };

        // Critical thresholds
        if (kpis.tenant_mismatch_count > 0) {
            this.setMode(venueId, 'shadow_ui');
            return { action: 'fallback', reason: 'Tenant mismatch detected' };
        }
        if (kpis.approval_bypass_attempts > 0) {
            this.setMode(venueId, 'shadow_ui');
            return { action: 'fallback', reason: 'Approval bypass detected' };
        }
        if (kpis.tool_error_rate > 0.10) {
            this.setMode(venueId, 'shadow_ui');
            return { action: 'fallback', reason: 'Tool error rate critical' };
        }

        return { action: 'none' };
    }
}

// =============================================================================
// TESTS
// =============================================================================

describe("Progressive Rollout Scenario", () => {
    let sim: RolloutSimulator;
    const pilotVenue: Venue = { id: 'venue-pilot', name: 'Pilot Bar', country: 'RW' };

    beforeEach(() => {
        sim = new RolloutSimulator();
        sim.addVenue(pilotVenue);
    });

    it("should start with mode=off", () => {
        assertEquals(sim.getMode(pilotVenue.id), 'off');
    });

    it("should progress through all modes", () => {
        // Phase 1: Enable shadow_ui
        sim.setMode(pilotVenue.id, 'shadow_ui');
        assertEquals(sim.getMode(pilotVenue.id), 'shadow_ui');

        // UI Plan should work
        let uiPlanCheck = sim.canProcessUIPlan(pilotVenue.id);
        assertEquals(uiPlanCheck.allowed, true);

        // Waiter should NOT work yet
        let waiterCheck = sim.canProcessAgentChat(pilotVenue.id);
        assertEquals(waiterCheck.allowed, false);

        // Phase 2: Enable assisted
        sim.setMode(pilotVenue.id, 'assisted');
        assertEquals(sim.getMode(pilotVenue.id), 'assisted');

        // Both should work
        uiPlanCheck = sim.canProcessUIPlan(pilotVenue.id);
        waiterCheck = sim.canProcessAgentChat(pilotVenue.id);
        assertEquals(uiPlanCheck.allowed, true);
        assertEquals(waiterCheck.allowed, true);

        // Phase 3: Enable full
        sim.setMode(pilotVenue.id, 'full');
        assertEquals(sim.getMode(pilotVenue.id), 'full');
    });
});

describe("Emergency Rollback Scenario", () => {
    let sim: RolloutSimulator;
    const venue: Venue = { id: 'venue-1', name: 'Test Venue', country: 'MT' };

    beforeEach(() => {
        sim = new RolloutSimulator();
        sim.addVenue(venue);
        sim.setMode(venue.id, 'full');
    });

    it("should immediately disable AI when kill switch activated", () => {
        // Verify working initially
        assertEquals(sim.canProcessAgentChat(venue.id).allowed, true);

        // Activate kill switch
        sim.activateKillSwitch('disable_all_ai');

        // Should be blocked immediately
        const result = sim.canProcessAgentChat(venue.id);
        assertEquals(result.allowed, false);
        assertEquals(result.reason, 'AI_DISABLED');
    });

    it("should allow waiter-specific disable", () => {
        // Activate waiter-only switch
        sim.activateKillSwitch('disable_waiter');

        // Waiter blocked
        const waiterResult = sim.canProcessAgentChat(venue.id);
        assertEquals(waiterResult.allowed, false);
        assertEquals(waiterResult.reason, 'WAITER_DISABLED');

        // UI Plan still works
        const uiResult = sim.canProcessUIPlan(venue.id);
        assertEquals(uiResult.allowed, true);
    });

    it("should restore operations after switch deactivation", () => {
        sim.activateKillSwitch('disable_all_ai');
        assertEquals(sim.canProcessAgentChat(venue.id).allowed, false);

        sim.deactivateKillSwitch('disable_all_ai');
        assertEquals(sim.canProcessAgentChat(venue.id).allowed, true);
    });
});

describe("Automatic Fallback Scenario", () => {
    let sim: RolloutSimulator;
    const venue: Venue = { id: 'venue-fail', name: 'Failing Venue', country: 'RW' };

    beforeEach(() => {
        sim = new RolloutSimulator();
        sim.addVenue(venue);
        sim.setMode(venue.id, 'full');
    });

    it("should fallback on tenant mismatch", () => {
        sim.setKPIs(venue.id, {
            tool_error_rate: 0.01,
            uiplan_valid_rate: 0.99,
            tenant_mismatch_count: 1, // Security violation!
            approval_bypass_attempts: 0,
        });

        const result = sim.checkAndApplyFallback(venue.id);

        assertEquals(result.action, 'fallback');
        assertEquals(result.reason, 'Tenant mismatch detected');
        assertEquals(sim.getMode(venue.id), 'shadow_ui');
    });

    it("should fallback on approval bypass", () => {
        sim.setKPIs(venue.id, {
            tool_error_rate: 0.01,
            uiplan_valid_rate: 0.99,
            tenant_mismatch_count: 0,
            approval_bypass_attempts: 1, // Security violation!
        });

        const result = sim.checkAndApplyFallback(venue.id);

        assertEquals(result.action, 'fallback');
        assertEquals(result.reason, 'Approval bypass detected');
    });

    it("should fallback on critical error rate", () => {
        sim.setKPIs(venue.id, {
            tool_error_rate: 0.15, // 15% > 10% threshold
            uiplan_valid_rate: 0.99,
            tenant_mismatch_count: 0,
            approval_bypass_attempts: 0,
        });

        const result = sim.checkAndApplyFallback(venue.id);

        assertEquals(result.action, 'fallback');
        assertEquals(result.reason, 'Tool error rate critical');
    });

    it("should not fallback with good KPIs", () => {
        sim.setKPIs(venue.id, {
            tool_error_rate: 0.01,
            uiplan_valid_rate: 0.99,
            tenant_mismatch_count: 0,
            approval_bypass_attempts: 0,
        });

        const result = sim.checkAndApplyFallback(venue.id);

        assertEquals(result.action, 'none');
        assertEquals(sim.getMode(venue.id), 'full'); // Unchanged
    });
});

describe("Kill Switch During Mode Change", () => {
    let sim: RolloutSimulator;
    const venue: Venue = { id: 'venue-locked', name: 'Locked Venue', country: 'RW' };

    beforeEach(() => {
        sim = new RolloutSimulator();
        sim.addVenue(venue);
        sim.activateKillSwitch('disable_all_ai');
    });

    it("should prevent mode changes when kill switch active", () => {
        // Try to change mode
        const success = sim.setMode(venue.id, 'shadow_ui');

        assertEquals(success, false);
        assertEquals(sim.getMode(venue.id), 'off'); // Unchanged
    });
});

describe("Multi-Venue Rollout Scenario", () => {
    let sim: RolloutSimulator;
    const venues: Venue[] = [
        { id: 'venue-rw-1', name: 'Rwanda Bar 1', country: 'RW' },
        { id: 'venue-rw-2', name: 'Rwanda Bar 2', country: 'RW' },
        { id: 'venue-mt-1', name: 'Malta Bar 1', country: 'MT' },
    ];

    beforeEach(() => {
        sim = new RolloutSimulator();
        venues.forEach(v => sim.addVenue(v));
    });

    it("should support independent venue modes", () => {
        sim.setMode('venue-rw-1', 'full');
        sim.setMode('venue-rw-2', 'assisted');
        sim.setMode('venue-mt-1', 'shadow_ui');

        assertEquals(sim.getMode('venue-rw-1'), 'full');
        assertEquals(sim.getMode('venue-rw-2'), 'assisted');
        assertEquals(sim.getMode('venue-mt-1'), 'shadow_ui');

        // Each has different capabilities
        assertEquals(sim.canProcessAgentChat('venue-rw-1').allowed, true);
        assertEquals(sim.canProcessAgentChat('venue-rw-2').allowed, true);
        assertEquals(sim.canProcessAgentChat('venue-mt-1').allowed, false);
    });

    it("should apply global kill switch to all venues", () => {
        sim.setMode('venue-rw-1', 'full');
        sim.setMode('venue-rw-2', 'full');
        sim.setMode('venue-mt-1', 'full');

        sim.activateKillSwitch('disable_all_ai');

        // All blocked
        assertEquals(sim.canProcessAgentChat('venue-rw-1').allowed, false);
        assertEquals(sim.canProcessAgentChat('venue-rw-2').allowed, false);
        assertEquals(sim.canProcessAgentChat('venue-mt-1').allowed, false);
    });
});
