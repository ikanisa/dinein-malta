import { test, expect } from '@playwright/test';

/**
 * Admin User Journey Tests
 * 
 * Tests the admin portal routes (/#/admin/*)
 * Note: These tests run without authentication, so they verify:
 * - Login page accessibility
 * - Route protection (redirects to login after auth check)
 * - Basic page structure without crash
 */

test.describe('Admin User Journey', () => {
    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
    });

    test('admin login page accessible', async ({ page }) => {
        await page.goto('/#/admin/login');

        await page.waitForLoadState('domcontentloaded');

        // Page should load and show login UI (Google OAuth for admin)
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();

        // Should have some form of login UI (Google auth button or similar)
        const hasLoginUI = await page.locator('button, form, [class*="login"], [class*="auth"], [class*="google"]').first().isVisible().catch(() => false);
        expect(hasLoginUI).toBeTruthy();
    });

    test('admin dashboard is protected', async ({ page }) => {
        // Try to access admin dashboard without auth
        await page.goto('/#/admin/dashboard');

        // Wait for auth check and redirect - may show loading first
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/login/, { timeout: 5000 }).catch(() => { });

        // Should redirect to login
        const currentUrl = page.url();
        const isProtected = currentUrl.includes('login');
        expect(isProtected).toBeTruthy();
    });

    test('admin vendors page is protected', async ({ page }) => {
        await page.goto('/#/admin/vendors');

        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/login/, { timeout: 5000 }).catch(() => { });

        // Should redirect to login when not authenticated
        const currentUrl = page.url();
        const isProtected = currentUrl.includes('login');
        expect(isProtected).toBeTruthy();
    });

    test('admin users management page is protected', async ({ page }) => {
        await page.goto('/#/admin/users');

        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/login/, { timeout: 5000 }).catch(() => { });

        // Should redirect to login when not authenticated
        const currentUrl = page.url();
        const isProtected = currentUrl.includes('login');
        expect(isProtected).toBeTruthy();
    });

    test('admin orders page is protected', async ({ page }) => {
        await page.goto('/#/admin/orders');

        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/login/, { timeout: 5000 }).catch(() => { });

        // Should redirect to login when not authenticated
        const currentUrl = page.url();
        const isProtected = currentUrl.includes('login');
        expect(isProtected).toBeTruthy();
    });

    test('admin system page is protected', async ({ page }) => {
        await page.goto('/#/admin/system');

        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/login/, { timeout: 5000 }).catch(() => { });

        // Should redirect to login when not authenticated
        const currentUrl = page.url();
        const isProtected = currentUrl.includes('login');
        expect(isProtected).toBeTruthy();
    });
});

test.describe('Admin Route Protection Verification', () => {
    const protectedAdminRoutes = [
        '/#/admin/dashboard',
        '/#/admin/vendors',
        '/#/admin/users',
        '/#/admin/orders',
        '/#/admin/system',
    ];



    test('admin login page does not redirect', async ({ page }) => {
        await page.goto('/#/admin/login');
        await page.waitForLoadState('domcontentloaded');

        // Login page should stay on login
        const currentUrl = page.url();
        expect(currentUrl).toContain('admin/login');
    });
});

test.describe('Admin Page Load Stability', () => {
    test('login page loads without JS errors', async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));

        await page.goto('/#/admin/login');
        await page.waitForLoadState('domcontentloaded');

        // Allow for expected chunk loading errors but no critical errors
        const criticalErrors = errors.filter(e =>
            !e.includes('chunk') &&
            !e.includes('Failed to fetch')
        );

        expect(criticalErrors.length).toBe(0);
    });

    test('protected route handles redirect gracefully', async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));

        await page.goto('/#/admin/dashboard');
        await page.waitForLoadState('domcontentloaded');
        await expect(page).toHaveURL(/login/, { timeout: 5000 }).catch(() => { });

        // Should not have any console errors during redirect
        const criticalErrors = errors.filter(e =>
            !e.includes('chunk') &&
            !e.includes('Failed to fetch')
        );

        expect(criticalErrors.length).toBe(0);
    });
});
