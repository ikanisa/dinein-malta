/**
 * E2E Test Selectors
 * 
 * Re-exports test IDs from @dinein/core for use in Playwright tests.
 * Use getByTestId() in tests for reliable, stable selectors.
 */

import { TESTIDS } from '@dinein/core';

export { TESTIDS };

// Convenience exports for direct access
export const CUSTOMER = TESTIDS.CUSTOMER;
export const VENUE = TESTIDS.VENUE;
export const ADMIN = TESTIDS.ADMIN;

/**
 * Helper to create a testid selector string for Playwright.
 * Use this when you need the raw selector string.
 * 
 * @example
 * const selector = testIdSelector(CUSTOMER.VENUE_MENU.PAGE);
 * // Returns: '[data-testid="venue-menu:page"]'
 */
export function testIdSelector(testId: string): string {
    return `[data-testid="${testId}"]`;
}
