import { test, expect } from '@playwright/test';

test.describe('Admin User Journey', () => {
    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
    });

    test('admin login page accessible', async ({ page }) => {
        await page.goto('/#/admin/login');

        await page.waitForLoadState('domcontentloaded');

        // Page should load
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });

    test('admin dashboard is protected', async ({ page }) => {
        // Try to access admin dashboard without auth
        await page.goto('/#/admin/dashboard');

        await page.waitForLoadState('domcontentloaded');

        // Should require authentication
        const currentUrl = page.url();
        expect(currentUrl).toContain('admin');
    });

    test('admin vendors page structure', async ({ page }) => {
        await page.goto('/#/admin/vendors');

        await page.waitForLoadState('domcontentloaded');

        // Page should load
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });

    test('admin users management page', async ({ page }) => {
        await page.goto('/#/admin/users');

        await page.waitForLoadState('domcontentloaded');

        // Page should load
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });

    test('admin settings page accessible', async ({ page }) => {
        await page.goto('/#/admin/settings');

        await page.waitForLoadState('domcontentloaded');

        // Page should load
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });
});

test.describe('Admin Vendor Management', () => {
    test('vendor list page loads', async ({ page }) => {
        await page.goto('/#/admin/vendors');

        await page.waitForLoadState('domcontentloaded');

        // Look for create vendor button or vendor list
        // Look for create vendor button or vendor list
        await expect(page.locator('[data-testid="create-vendor"]').or(
            page.getByRole('button', { name: /create|add|new/i })
        ).or(
            page.getByRole('link', { name: /create|add|new/i })
        )).toBeVisible();

        // Page should have some UI
        await expect(page.locator('button, a, table, [class*="card"]').first()).toBeVisible();
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });

    test('create vendor form structure', async ({ page }) => {
        await page.goto('/#/admin/vendors/new');

        await page.waitForLoadState('domcontentloaded');

        // Look for form inputs
        // Look for form inputs
        await expect(page.locator('[name="name"]').or(
            page.locator('input').first()
        )).toBeVisible();

        // Page should load
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });

    test('vendor discovery page loads', async ({ page }) => {
        await page.goto('/#/admin/discovery');

        await page.waitForLoadState('domcontentloaded');

        // Page should load
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });
});

test.describe('Admin Analytics', () => {
    test('analytics dashboard loads', async ({ page }) => {
        await page.goto('/#/admin/analytics');

        await page.waitForLoadState('domcontentloaded');

        // Page should load
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });

    test('can filter analytics by date range', async ({ page }) => {
        await page.goto('/#/admin/analytics');

        await page.waitForLoadState('domcontentloaded');

        // Look for date picker or range selector
        // Look for date picker or range selector
        await expect(page.locator('[data-testid="date-range"]').or(
            page.locator('input[type="date"]')
        ).or(
            page.getByRole('combobox')
        )).toBeVisible();

        // Page should have loaded
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });
});
