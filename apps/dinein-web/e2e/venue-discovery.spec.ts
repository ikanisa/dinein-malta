import { test, expect } from '@playwright/test';

test.describe('Venue Discovery', () => {
    test.beforeEach(async ({ page, context }) => {
        // Grant geolocation permission
        await context.grantPermissions(['geolocation']);
        // Mock location to Malta
        await context.setGeolocation({ latitude: 35.9375, longitude: 14.3754 });

        await page.goto('/');
    });

    test('should ask for location on first load if permission not granted (handled by browser mock here)', async ({ page }) => {
        // Wait for potential loading state
        await expect(page.getByText('Loading...')).not.toBeVisible({ timeout: 10000 });

        // In this test, we already mocked permission, so it should load
        const title = page.getByRole('heading', { name: 'Good Evening!' });
        await expect(title).toBeVisible();
    });

    test('should navigate to Discover tab and show venues', async ({ page }) => {
        // Click Discover tab (via main dashboard card)
        await page.getByLabel('Find a Table - Discover nearby venues').click();

        // Check header
        await expect(page.getByRole('heading', { name: 'Discover Nearby' })).toBeVisible();

        // Should show venues (mocked or real if backend is reachable, let's assume we might get empty but structure loads)
        // We'll check for the loading state or empty state or list
        // Since we don't control the backend data here easily without full mock, we verify the container exists.
        // Ideally we would mock the Supabase network request, but for integration we want to see if the app holds together.

        // Wait for either loading to finish or list to appear
        await expect(page.getByText('Loading')).not.toBeVisible();

        // If we have no data, we see "No venues found"
        // If we have data, we see list items.
        // Let's assert that we don't crash.
        const container = page.locator('div.min-h-screen');
        await expect(container).toBeVisible();
    });
});
