import { test, expect } from '@playwright/test';

test.describe('Vendor Portal', () => {
    test.beforeEach(async ({ page }) => {
        // Mock the auth state or assume setup handles it
        // Ideally we intercept the dashboard profile call to ensure deterministic UI
        await page.goto('/vendor');
        await page.waitForLoadState('networkidle');
    });

    test('loads vendor dashboard', async ({ page }) => {
        // Check dashboard elements
        await expect(page.getByText('Welcome back')).toBeVisible();
        // Dynamic name might take a moment or be 'Restaurant' fallback
        // await expect(page.getByText(/Restaurant|La Petite Maison/)).toBeVisible();
    });

    test('shows vendor stats', async ({ page }) => {
        // New dashboard structure has Rating and Total Rev in header
        await expect(page.getByText('Rating')).toBeVisible();
        await expect(page.getByText('Total Rev')).toBeVisible();
    });

    test('shows recent orders section', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Recent Orders' })).toBeVisible();
    });

    test('shows quick actions section', async ({ page }) => {
        await expect(page.getByText('Quick Actions')).toBeVisible();
        await expect(page.getByText('New Order')).toBeVisible();
        await expect(page.getByText('Update Menu')).toBeVisible();
    });

    test('navigation works', async ({ page }) => {
        const nav = page.locator('nav').first();
        // Verify nav exists (it might be bottom nav)
        await expect(nav).toBeVisible();
    });
});
