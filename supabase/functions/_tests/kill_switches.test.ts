/**
 * Unit Tests for Kill Switches
 * 
 * Tests the kill switch activation logic including:
 * - Check if switch is active
 * - Scoped kill switch behavior
 * - Multiple switch evaluation
 */

import {
    assertEquals,
} from "https://deno.land/std@0.168.0/testing/asserts.ts";
import {
    describe,
    it,
} from "https://deno.land/std@0.168.0/testing/bdd.ts";

// =============================================================================
// KILL SWITCH LOGIC (inline for testing)
// =============================================================================

interface KillSwitch {
    id: string;
    description: string;
    is_active: boolean;
    scope: string;
    activated_at: string | null;
    reason: string | null;
}

function isKillSwitchActive(
    switches: KillSwitch[],
    switchId: string
): { active: boolean; reason: string | null } {
    const sw = switches.find(s => s.id === switchId);
    if (!sw) {
        return { active: false, reason: null };
    }
    return { active: sw.is_active, reason: sw.reason };
}

function getActiveSwitchesForScope(
    switches: KillSwitch[],
    scope: string
): KillSwitch[] {
    return switches.filter(
        s => s.is_active && (s.scope === 'global' || s.scope === scope)
    );
}

function shouldBlockOperation(
    switches: KillSwitch[],
    operation: string
): { blocked: boolean; reason: string | null } {
    // Map operations to switch IDs
    const operationToSwitch: Record<string, string[]> = {
        'agent_chat': ['disable_all_ai', 'disable_waiter'],
        'ui_plan': ['disable_all_ai', 'disable_ui_plan'],
        'order_submit': ['disable_all_ai', 'disable_waiter'],
    };

    const relevantSwitches = operationToSwitch[operation] ?? ['disable_all_ai'];

    for (const switchId of relevantSwitches) {
        const result = isKillSwitchActive(switches, switchId);
        if (result.active) {
            return { blocked: true, reason: result.reason };
        }
    }

    return { blocked: false, reason: null };
}

// =============================================================================
// TESTS
// =============================================================================

describe("Kill Switch Activation", () => {
    describe("isKillSwitchActive", () => {
        it("should return active=true for activated switch", () => {
            const switches: KillSwitch[] = [
                {
                    id: "disable_all_ai",
                    description: "Disable all AI",
                    is_active: true,
                    scope: "global",
                    activated_at: "2026-01-28T12:00:00Z",
                    reason: "Emergency shutdown",
                },
            ];

            const result = isKillSwitchActive(switches, "disable_all_ai");

            assertEquals(result.active, true);
            assertEquals(result.reason, "Emergency shutdown");
        });

        it("should return active=false for inactive switch", () => {
            const switches: KillSwitch[] = [
                {
                    id: "disable_all_ai",
                    description: "Disable all AI",
                    is_active: false,
                    scope: "global",
                    activated_at: null,
                    reason: null,
                },
            ];

            const result = isKillSwitchActive(switches, "disable_all_ai");

            assertEquals(result.active, false);
            assertEquals(result.reason, null);
        });

        it("should return active=false for non-existent switch", () => {
            const switches: KillSwitch[] = [];

            const result = isKillSwitchActive(switches, "unknown_switch");

            assertEquals(result.active, false);
            assertEquals(result.reason, null);
        });
    });

    describe("getActiveSwitchesForScope", () => {
        it("should return global switches for any scope", () => {
            const switches: KillSwitch[] = [
                {
                    id: "disable_all_ai",
                    description: "Disable all AI",
                    is_active: true,
                    scope: "global",
                    activated_at: "2026-01-28T12:00:00Z",
                    reason: "Test",
                },
            ];

            const result = getActiveSwitchesForScope(switches, "customer");

            assertEquals(result.length, 1);
            assertEquals(result[0].id, "disable_all_ai");
        });

        it("should return scope-specific switches", () => {
            const switches: KillSwitch[] = [
                {
                    id: "disable_waiter",
                    description: "Disable waiter",
                    is_active: true,
                    scope: "customer",
                    activated_at: "2026-01-28T12:00:00Z",
                    reason: "Waiter issues",
                },
                {
                    id: "disable_manager_ai",
                    description: "Disable manager AI",
                    is_active: true,
                    scope: "venue",
                    activated_at: "2026-01-28T12:00:00Z",
                    reason: "Manager issues",
                },
            ];

            const customerResult = getActiveSwitchesForScope(switches, "customer");
            const venueResult = getActiveSwitchesForScope(switches, "venue");

            assertEquals(customerResult.length, 1);
            assertEquals(customerResult[0].id, "disable_waiter");
            assertEquals(venueResult.length, 1);
            assertEquals(venueResult[0].id, "disable_manager_ai");
        });

        it("should not return inactive switches", () => {
            const switches: KillSwitch[] = [
                {
                    id: "disable_all_ai",
                    description: "Disable all AI",
                    is_active: false,
                    scope: "global",
                    activated_at: null,
                    reason: null,
                },
            ];

            const result = getActiveSwitchesForScope(switches, "customer");

            assertEquals(result.length, 0);
        });
    });

    describe("shouldBlockOperation", () => {
        it("should block agent_chat when disable_all_ai is active", () => {
            const switches: KillSwitch[] = [
                {
                    id: "disable_all_ai",
                    description: "Disable all AI",
                    is_active: true,
                    scope: "global",
                    activated_at: "2026-01-28T12:00:00Z",
                    reason: "Full shutdown",
                },
            ];

            const result = shouldBlockOperation(switches, "agent_chat");

            assertEquals(result.blocked, true);
            assertEquals(result.reason, "Full shutdown");
        });

        it("should block agent_chat when disable_waiter is active", () => {
            const switches: KillSwitch[] = [
                {
                    id: "disable_waiter",
                    description: "Disable waiter",
                    is_active: true,
                    scope: "customer",
                    activated_at: "2026-01-28T12:00:00Z",
                    reason: "Waiter only shutdown",
                },
            ];

            const result = shouldBlockOperation(switches, "agent_chat");

            assertEquals(result.blocked, true);
            assertEquals(result.reason, "Waiter only shutdown");
        });

        it("should not block ui_plan when only disable_waiter is active", () => {
            const switches: KillSwitch[] = [
                {
                    id: "disable_waiter",
                    description: "Disable waiter",
                    is_active: true,
                    scope: "customer",
                    activated_at: "2026-01-28T12:00:00Z",
                    reason: "Waiter only shutdown",
                },
            ];

            const result = shouldBlockOperation(switches, "ui_plan");

            assertEquals(result.blocked, false);
        });

        it("should not block operation when no switches active", () => {
            const switches: KillSwitch[] = [
                {
                    id: "disable_all_ai",
                    description: "Disable all AI",
                    is_active: false,
                    scope: "global",
                    activated_at: null,
                    reason: null,
                },
            ];

            const result = shouldBlockOperation(switches, "agent_chat");

            assertEquals(result.blocked, false);
        });
    });
});

describe("Kill Switch Edge Cases", () => {
    it("should handle empty switch list", () => {
        const switches: KillSwitch[] = [];

        const result = shouldBlockOperation(switches, "agent_chat");

        assertEquals(result.blocked, false);
    });

    it("should handle unknown operation", () => {
        const switches: KillSwitch[] = [
            {
                id: "disable_all_ai",
                description: "Disable all AI",
                is_active: true,
                scope: "global",
                activated_at: "2026-01-28T12:00:00Z",
                reason: "Shutdown",
            },
        ];

        // Unknown operation should still check disable_all_ai
        const result = shouldBlockOperation(switches, "unknown_operation");

        assertEquals(result.blocked, true);
    });
});
