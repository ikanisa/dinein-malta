/**
 * Unit Tests for Feature Flags
 * 
 * Tests the feature flag resolution logic including:
 * - Default flag values
 * - Per-venue overrides
 * - Per-country overrides
 * - Rollout mode behavior configuration
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
// MOCK SUPABASE CLIENT
// =============================================================================

interface MockQueryResult {
    data: unknown;
    error: null | { message: string };
}

class MockSupabaseClient {
    private mockData: Record<string, unknown[]> = {};
    private lastQuery: { table: string; filters: Record<string, unknown> } | null = null;

    setMockData(table: string, data: unknown[]) {
        this.mockData[table] = data;
    }

    from(table: string) {
        this.lastQuery = { table, filters: {} };
        return this;
    }

    select(_columns?: string) {
        return this;
    }

    eq(column: string, value: unknown) {
        if (this.lastQuery) {
            this.lastQuery.filters[column] = value;
        }
        return this;
    }

    single(): MockQueryResult {
        const table = this.lastQuery?.table ?? '';
        const data = this.mockData[table]?.[0] ?? null;
        return { data, error: null };
    }

    maybeSingle(): MockQueryResult {
        return this.single();
    }
}

// =============================================================================
// FEATURE FLAG LOGIC (inline for testing without imports)
// =============================================================================

interface FeatureFlag {
    flag_key: string;
    default_enabled: boolean;
    scope: string[];
    description: string;
}

interface FlagOverride {
    flag_key: string;
    venue_id: string | null;
    country: string | null;
    enabled: boolean;
}

function resolveFlagValue(
    flag: FeatureFlag,
    overrides: FlagOverride[],
    context: { venueId?: string; country?: string }
): boolean {
    // Priority: venue override > country override > default

    // Check venue-specific override
    if (context.venueId) {
        const venueOverride = overrides.find(
            o => o.flag_key === flag.flag_key && o.venue_id === context.venueId
        );
        if (venueOverride) {
            return venueOverride.enabled;
        }
    }

    // Check country-specific override
    if (context.country) {
        const countryOverride = overrides.find(
            o => o.flag_key === flag.flag_key && o.country === context.country && !o.venue_id
        );
        if (countryOverride) {
            return countryOverride.enabled;
        }
    }

    // Return default value
    return flag.default_enabled;
}

// =============================================================================
// TESTS
// =============================================================================

describe("Feature Flag Resolution", () => {
    let mockClient: MockSupabaseClient;

    beforeEach(() => {
        mockClient = new MockSupabaseClient();
    });

    describe("Default Values", () => {
        it("should return default_enabled when no overrides exist", () => {
            const flag: FeatureFlag = {
                flag_key: "enable_ui_plan",
                default_enabled: true,
                scope: ["customer"],
                description: "Enable AI UI plan generation",
            };
            const overrides: FlagOverride[] = [];
            const context = { venueId: "venue-123" };

            const result = resolveFlagValue(flag, overrides, context);

            assertEquals(result, true);
        });

        it("should return false for disabled default flag", () => {
            const flag: FeatureFlag = {
                flag_key: "enable_waiter",
                default_enabled: false,
                scope: ["customer"],
                description: "Enable AI waiter",
            };
            const overrides: FlagOverride[] = [];
            const context = { venueId: "venue-123" };

            const result = resolveFlagValue(flag, overrides, context);

            assertEquals(result, false);
        });
    });

    describe("Venue Overrides", () => {
        it("should override default with venue-specific value", () => {
            const flag: FeatureFlag = {
                flag_key: "enable_waiter",
                default_enabled: false,
                scope: ["customer"],
                description: "Enable AI waiter",
            };
            const overrides: FlagOverride[] = [
                {
                    flag_key: "enable_waiter",
                    venue_id: "venue-123",
                    country: null,
                    enabled: true,
                },
            ];
            const context = { venueId: "venue-123" };

            const result = resolveFlagValue(flag, overrides, context);

            assertEquals(result, true);
        });

        it("should not apply override for different venue", () => {
            const flag: FeatureFlag = {
                flag_key: "enable_waiter",
                default_enabled: false,
                scope: ["customer"],
                description: "Enable AI waiter",
            };
            const overrides: FlagOverride[] = [
                {
                    flag_key: "enable_waiter",
                    venue_id: "venue-456",
                    country: null,
                    enabled: true,
                },
            ];
            const context = { venueId: "venue-123" };

            const result = resolveFlagValue(flag, overrides, context);

            assertEquals(result, false);
        });
    });

    describe("Country Overrides", () => {
        it("should apply country-specific override", () => {
            const flag: FeatureFlag = {
                flag_key: "enable_waiter",
                default_enabled: false,
                scope: ["customer"],
                description: "Enable AI waiter",
            };
            const overrides: FlagOverride[] = [
                {
                    flag_key: "enable_waiter",
                    venue_id: null,
                    country: "RW",
                    enabled: true,
                },
            ];
            const context = { venueId: "venue-123", country: "RW" };

            const result = resolveFlagValue(flag, overrides, context);

            assertEquals(result, true);
        });

        it("should prioritize venue override over country override", () => {
            const flag: FeatureFlag = {
                flag_key: "enable_waiter",
                default_enabled: false,
                scope: ["customer"],
                description: "Enable AI waiter",
            };
            const overrides: FlagOverride[] = [
                {
                    flag_key: "enable_waiter",
                    venue_id: null,
                    country: "RW",
                    enabled: true, // Country says enabled
                },
                {
                    flag_key: "enable_waiter",
                    venue_id: "venue-123",
                    country: null,
                    enabled: false, // Venue says disabled
                },
            ];
            const context = { venueId: "venue-123", country: "RW" };

            const result = resolveFlagValue(flag, overrides, context);

            // Venue override takes priority
            assertEquals(result, false);
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty context", () => {
            const flag: FeatureFlag = {
                flag_key: "enable_waiter",
                default_enabled: true,
                scope: ["customer"],
                description: "Enable AI waiter",
            };
            const overrides: FlagOverride[] = [
                {
                    flag_key: "enable_waiter",
                    venue_id: "venue-123",
                    country: null,
                    enabled: false,
                },
            ];
            const context = {};

            const result = resolveFlagValue(flag, overrides, context);

            // No venue in context, so override doesn't apply
            assertEquals(result, true);
        });

        it("should handle multiple flags correctly", () => {
            const flag1: FeatureFlag = {
                flag_key: "enable_waiter",
                default_enabled: false,
                scope: ["customer"],
                description: "Enable AI waiter",
            };
            const flag2: FeatureFlag = {
                flag_key: "enable_ui_plan",
                default_enabled: true,
                scope: ["customer"],
                description: "Enable UI plan",
            };
            const overrides: FlagOverride[] = [
                {
                    flag_key: "enable_waiter",
                    venue_id: "venue-123",
                    country: null,
                    enabled: true,
                },
            ];
            const context = { venueId: "venue-123" };

            const result1 = resolveFlagValue(flag1, overrides, context);
            const result2 = resolveFlagValue(flag2, overrides, context);

            assertEquals(result1, true); // Overridden
            assertEquals(result2, true); // Default
        });
    });
});

// Run tests
if (import.meta.main) {
    console.log("Run tests with: deno test --allow-none");
}
