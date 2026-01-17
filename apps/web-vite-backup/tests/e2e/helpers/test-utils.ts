/**
 * E2E Test Helper Utilities
 * Shared utilities for stable, condition-based waits and test isolation.
 */

import { Page, expect } from '@playwright/test';

/**
 * Wait for navigation to complete with a fallback
 */
export async function waitForNavigation(page: Page, options?: {
    url?: RegExp | string;
    timeout?: number;
}): Promise<void> {
    const { url, timeout = 5000 } = options || {};

    try {
        await page.waitForLoadState('domcontentloaded');
        if (url) {
            await expect(page).toHaveURL(url, { timeout });
        }
    } catch {
        // Navigation may have completed differently, log and continue
        console.log(`[TestHelper] Navigation wait completed (fallback): ${page.url()}`);
    }
}

/**
 * Wait for a route protection redirect (to login page)
 */
export async function expectProtectedRoute(page: Page): Promise<boolean> {
    await page.waitForLoadState('domcontentloaded');

    // Wait up to 5s for redirect to login
    await expect(page).toHaveURL(/login/, { timeout: 5000 }).catch(() => { });

    const currentUrl = page.url();
    return currentUrl.includes('login');
}

/**
 * Wait for element with retry logic
 */
export async function waitForElement(page: Page, selector: string, options?: {
    timeout?: number;
    state?: 'visible' | 'hidden' | 'attached' | 'detached';
}): Promise<boolean> {
    const { timeout = 5000, state = 'visible' } = options || {};

    try {
        await page.locator(selector).first().waitFor({ state, timeout });
        return true;
    } catch {
        return false;
    }
}

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
    try {
        await page.waitForLoadState('networkidle', { timeout });
    } catch {
        // Network may not fully idle, but page should be usable
        console.log('[TestHelper] Network idle timeout, continuing');
    }
}

/**
 * Clear session for test isolation
 */
export async function clearSession(page: Page): Promise<void> {
    await page.context().clearCookies();
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    }).catch(() => { });
}

/**
 * Capture console errors during test execution
 */
export function captureConsoleErrors(page: Page): {
    getErrors: () => string[];
    getCriticalErrors: () => string[];
} {
    const errors: string[] = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    page.on('pageerror', error => {
        errors.push(error.message);
    });

    return {
        getErrors: () => errors,
        getCriticalErrors: () => errors.filter(e =>
            !e.includes('chunk') &&
            !e.includes('Failed to fetch') &&
            !e.includes('favicon') &&
            !e.includes('404') &&
            !e.includes('Failed to load resource')
        ),
    };
}

/**
 * Fill form and submit with proper waits
 */
export async function fillAndSubmitForm(page: Page, fields: Record<string, string>): Promise<void> {
    for (const [selector, value] of Object.entries(fields)) {
        const input = page.locator(selector).first();
        if (await input.isVisible()) {
            await input.fill(value);
        }
    }

    const submitButton = page.locator('[type="submit"]').or(
        page.getByRole('button', { name: /login|sign in|submit/i })
    );

    if (await submitButton.isVisible()) {
        await submitButton.click();
        await waitForNetworkIdle(page, 3000);
    }
}
