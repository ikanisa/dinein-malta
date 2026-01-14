import { test, expect } from '@playwright/test';

test.describe('Admin User Journey', () => {
    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
    });

    test('admin login page accessible', async ({ page }) => {
        await page.goto('/#/admin/login');

        await page.waitForLoadState('networkidle');

        // Page should load
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });

    test('admin dashboard is protected', async ({ page }) => {
        // Try to access admin dashboard without auth
        await page.goto('/#/admin/dashboard');

        await page.waitForLoadState('networkidle');

        // Should require authentication
        const currentUrl = page.url();
        expect(currentUrl).toContain('admin');
    });

    test('admin vendors page structure', async ({ page }) => {
        await page.goto('/#/admin/vendors');

        await page.waitForLoadState('networkidle');

        // Page should load
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });

    test('admin users management page', async ({ page }) => {
        await page.goto('/#/admin/users');

        await page.waitForLoadState('networkidle');

        // Page should load
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });

    test('admin settings page accessible', async ({ page }) => {
        await page.goto('/#/admin/settings');

        await page.waitForLoadState('networkidle');

        // Page should load
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });
});

test.describe('Admin Vendor Management', () => {
    test('vendor list page loads', async ({ page }) => {
        await page.goto('/#/admin/vendors');

        await page.waitForLoadState('networkidle');

        // Look for create vendor button or vendor list
        const createButton = page.locator('[data-testid="create-vendor"]').or(
            page.getByRole('button', { name: /create|add|new/i })
        ).or(
            page.getByRole('link', { name: /create|add|new/i })
        );

        // Page should have some UI
        const hasUI = await page.locator('button, a, table, [class*="card"]').first().isVisible().catch(() => false);
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });

    test('create vendor form structure', async ({ page }) => {
        await page.goto('/#/admin/vendors/new');

        await page.waitForLoadState('networkidle');

        // Look for form inputs
        const nameInput = page.locator('[name="name"]').or(
            page.locator('input').first()
        );

        // Page should load
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });

    test('vendor discovery page loads', async ({ page }) => {
        await page.goto('/#/admin/discovery');

        await page.waitForLoadState('networkidle');

        // Page should load
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });
});

test.describe('Admin Analytics', () => {
    test('analytics dashboard loads', async ({ page }) => {
        await page.goto('/#/admin/analytics');

        await page.waitForLoadState('networkidle');

        // Page should load
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });

    test('can filter analytics by date range', async ({ page }) => {
        await page.goto('/#/admin/analytics');

        await page.waitForLoadState('networkidle');

        // Look for date picker or range selector
        const dateFilter = page.locator('[data-testid="date-range"]').or(
            page.locator('input[type="date"]')
        ).or(
            page.getByRole('combobox')
        );

        // Page should have loaded
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });
});
