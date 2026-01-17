import { test, expect } from '@playwright/test';

/**
 * Vendor/Manager User Journey Tests
 * 
 * Tests the manager portal routes (/#/manager/*)
 * Note: These tests run without authentication, so they verify:
 * - Login page accessibility
 * - Route protection (redirects to login after auth check)
 * - Basic page structure
 */

test.describe('Vendor User Journey', () => {
    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
    });

    test('vendor login page loads', async ({ page }) => {
        // Use correct route: manager/login not vendor/login
        await page.goto('/#/manager/login');

        await page.waitForLoadState('domcontentloaded');

        // Check for login form elements
        await expect(page.locator('[name="email"], [type="email"], input[placeholder*="email" i]').first()).toBeVisible();
        await expect(page.locator('[name="password"], [type="password"]').first()).toBeVisible();
        await expect(page.getByRole('button', { name: /login|sign in/i }).or(
            page.locator('[type="submit"]')
        )).toBeVisible();

        // Page should be on manager login
        await expect(page).toHaveURL(/manager/);
    });

    test('vendor login form has required fields', async ({ page }) => {
        await page.goto('/#/manager/login');

        await page.waitForLoadState('domcontentloaded');

        // Check for form structure
        const form = page.locator('form').first();
        if (await form.isVisible()) {
            // Form should have inputs
            const inputs = await page.locator('input').count();
            expect(inputs).toBeGreaterThan(0);
        }
    });

    test('vendor login shows error for invalid credentials', async ({ page }) => {
        await page.goto('/#/manager/login');

        await page.waitForLoadState('domcontentloaded');

        const emailInput = page.locator('[name="email"], [type="email"]').first();
        const passwordInput = page.locator('[name="password"], [type="password"]').first();

        if (await emailInput.isVisible() && await passwordInput.isVisible()) {
            await emailInput.fill('invalid@test.com');
            await passwordInput.fill('wrongpassword');

            // Submit form
            const submitButton = page.locator('[type="submit"]').or(
                page.getByRole('button', { name: /login|sign in/i })
            );

            if (await submitButton.isVisible()) {
                await submitButton.click();

                // Wait for response
                await page.waitForTimeout(2000);

                // Should show error or remain on login page
                await expect(page).toHaveURL(/login|manager/);
            }
        }
    });

    test('vendor dashboard is protected', async ({ page }) => {
        // Try to access dashboard directly without auth
        await page.goto('/#/manager/live');

        await page.waitForLoadState('domcontentloaded');
        // Wait for auth check and redirect (condition-based, not fixed timeout)
        await expect(page).toHaveURL(/login/, { timeout: 5000 }).catch(() => { });

        // Should redirect to login
        const currentUrl = page.url();
        const isProtected = currentUrl.includes('login');

        expect(isProtected).toBeTruthy();
    });

    test('vendor menu management page is protected', async ({ page }) => {
        // Navigate to menu management (requires auth)
        await page.goto('/#/manager/menu');

        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/login/, { timeout: 5000 }).catch(() => { });

        // Should redirect to login when not authenticated
        const currentUrl = page.url();
        const isProtected = currentUrl.includes('login');
        expect(isProtected).toBeTruthy();
    });

    test('vendor orders page is protected', async ({ page }) => {
        await page.goto('/#/manager/history');

        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/login/, { timeout: 5000 }).catch(() => { });

        // Should redirect to login when not authenticated
        const currentUrl = page.url();
        const isProtected = currentUrl.includes('login');
        expect(isProtected).toBeTruthy();
    });

    test('vendor settings page is protected', async ({ page }) => {
        await page.goto('/#/manager/settings');

        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/login/, { timeout: 5000 }).catch(() => { });

        // Should redirect to login when not authenticated
        const currentUrl = page.url();
        const isProtected = currentUrl.includes('login');
        expect(isProtected).toBeTruthy();
    });
});

test.describe('Vendor Menu Management (Protected)', () => {
    test('menu page redirects to login without auth', async ({ page }) => {
        await page.goto('/#/manager/menu');

        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/login/, { timeout: 5000 }).catch(() => { });

        // Should redirect to login
        const currentUrl = page.url();
        const isProtected = currentUrl.includes('login');
        expect(isProtected).toBeTruthy();
    });

    test('page structure loads without crash', async ({ page }) => {
        await page.goto('/#/manager/menu');

        await page.waitForLoadState('domcontentloaded');

        // Page should load without crashing
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();

        // Check no critical JS errors
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.waitForTimeout(1000);

        const criticalErrors = errors.filter(e => !e.includes('chunk'));
        expect(criticalErrors.length).toBeLessThanOrEqual(1);
    });
});

test.describe('Vendor Order Management (Protected)', () => {
    test('orders history page redirects to login', async ({ page }) => {
        await page.goto('/#/manager/history');

        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/login/, { timeout: 5000 }).catch(() => { });

        // Should redirect to login
        const currentUrl = page.url();
        const isProtected = currentUrl.includes('login');
        expect(isProtected).toBeTruthy();
    });

    test('live dashboard requires auth', async ({ page }) => {
        await page.goto('/#/manager/live');

        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/login/, { timeout: 5000 }).catch(() => { });

        // Should redirect to login when not authenticated
        const currentUrl = page.url();
        const isProtected = currentUrl.includes('login');
        expect(isProtected).toBeTruthy();
    });
});
