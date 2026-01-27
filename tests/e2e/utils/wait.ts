import { Page, Locator, expect } from '@playwright/test';

/**
 * Wait Helpers for E2E Tests
 * 
 * Provides reliable waiting utilities to avoid flaky tests.
 */

// =============================================================================
// PAGE READY HELPERS
// =============================================================================

/**
 * Wait for page to be fully loaded and network to be idle.
 * 
 * @param page - Playwright page
 * @param timeout - Optional timeout in ms (default: 10000)
 */
export async function waitForPageReady(
    page: Page,
    timeout: number = 10000
): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
    // Small buffer for any React re-renders
    await page.waitForTimeout(100);
}

/**
 * Wait for navigation to complete after an action.
 * 
 * @param page - Playwright page
 * @param urlPattern - URL pattern to wait for (string or regex)
 * @param timeout - Optional timeout in ms (default: 10000)
 */
export async function waitForNavigation(
    page: Page,
    urlPattern: string | RegExp,
    timeout: number = 10000
): Promise<void> {
    await page.waitForURL(urlPattern, { timeout });
    await waitForPageReady(page);
}

// =============================================================================
// ELEMENT HELPERS
// =============================================================================

/**
 * Wait for a test ID to be visible on the page.
 * 
 * @param page - Playwright page
 * @param testId - The data-testid value
 * @param timeout - Optional timeout in ms (default: 10000)
 */
export async function waitForTestId(
    page: Page,
    testId: string,
    timeout: number = 10000
): Promise<Locator> {
    const locator = page.getByTestId(testId);
    await expect(locator).toBeVisible({ timeout });
    return locator;
}

/**
 * Wait for a test ID to be hidden/removed from the page.
 * Useful for waiting for modals to close, loaders to finish, etc.
 * 
 * @param page - Playwright page
 * @param testId - The data-testid value
 * @param timeout - Optional timeout in ms (default: 10000)
 */
export async function waitForTestIdHidden(
    page: Page,
    testId: string,
    timeout: number = 10000
): Promise<void> {
    const locator = page.getByTestId(testId);
    await expect(locator).toBeHidden({ timeout });
}

/**
 * Wait for text to appear on the page.
 * 
 * @param page - Playwright page
 * @param text - Text to wait for (string or regex)
 * @param timeout - Optional timeout in ms (default: 10000)
 */
export async function waitForText(
    page: Page,
    text: string | RegExp,
    timeout: number = 10000
): Promise<Locator> {
    const locator = page.getByText(text);
    await expect(locator.first()).toBeVisible({ timeout });
    return locator.first();
}

// =============================================================================
// LOADING STATE HELPERS
// =============================================================================

/**
 * Wait for any loading indicators to disappear.
 * Checks for common loading patterns (skeletons, spinners, etc.)
 * 
 * @param page - Playwright page
 * @param timeout - Optional timeout in ms (default: 15000)
 */
export async function waitForLoadingComplete(
    page: Page,
    timeout: number = 15000
): Promise<void> {
    // Wait for common loading indicators to disappear
    const loadingPatterns = [
        '[data-loading="true"]',
        '[class*="skeleton"]',
        '[class*="Skeleton"]',
        '[class*="spinner"]',
        '[class*="Spinner"]',
        '[aria-busy="true"]',
    ];

    for (const pattern of loadingPatterns) {
        const loadingElements = page.locator(pattern);
        const count = await loadingElements.count();

        if (count > 0) {
            await expect(loadingElements.first()).toBeHidden({ timeout });
        }
    }
}

// =============================================================================
// RETRY HELPERS
// =============================================================================

/**
 * Retry an action until it succeeds or times out.
 * Useful for actions that may fail due to timing issues.
 * 
 * @param action - Async function to retry
 * @param options - Retry options
 */
export async function retryAction<T>(
    action: () => Promise<T>,
    options: {
        maxAttempts?: number;
        delayMs?: number;
        onRetry?: (attempt: number, error: Error) => void;
    } = {}
): Promise<T> {
    const { maxAttempts = 3, delayMs = 500, onRetry } = options;

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await action();
        } catch (error) {
            lastError = error as Error;

            if (attempt < maxAttempts) {
                onRetry?.(attempt, lastError);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }

    throw lastError;
}

// =============================================================================
// SCREENSHOT HELPERS
// =============================================================================

/**
 * Take a screenshot with a standardized naming convention.
 * 
 * @param page - Playwright page
 * @param name - Screenshot name (will be prefixed with timestamp)
 * @param fullPage - Whether to capture full page (default: true)
 */
export async function takeScreenshot(
    page: Page,
    name: string,
    fullPage: boolean = true
): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({
        path: `test-results/${timestamp}-${name}.png`,
        fullPage,
    });
}
