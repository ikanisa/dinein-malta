import { test, expect } from '@playwright/test';

test.describe('Admin Portal', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/admin');
        await page.waitForLoadState('networkidle');
    });

    test('loads admin dashboard', async ({ page }) => {
        // Check dashboard header
        await expect(page.locator('text=Admin Console')).toBeVisible();
        await expect(page.locator('text=Platform Status')).toBeVisible();
    });

    test('shows platform stats', async ({ page }) => {
        await expect(page.locator('text=Total Vendors')).toBeVisible();
        await expect(page.locator('text=Active Users')).toBeVisible();
    });

    test('shows pending approvals', async ({ page }) => {
        await expect(page.locator('text=Pending Approvals')).toBeVisible();
    });

    test('shows recent activity', async ({ page }) => {
        await expect(page.locator('text=Recent Activity')).toBeVisible();
    });

    test('shows quick actions', async ({ page }) => {
        await expect(page.locator('text=Quick Actions')).toBeVisible();
        await expect(page.locator('text=Add Vendor')).toBeVisible();
        await expect(page.locator('text=Analytics')).toBeVisible();
    });
});
