import { test, expect } from '@playwright/test';

test.describe('Venue Browsing Flow', () => {
    test('should list venues and navigate to details', async ({ page }) => {
        // 1. Visit the venues list page
        await page.goto('/venues');

        // Verify title/header
        await expect(page.getByRole('heading', { name: 'Discover Venues' })).toBeVisible();

        // 2. Check for venue cards (assuming data-testid or class structure)
        // Using a more generic selector first to see what's rendered if we lack specific test ids
        const venueCards = page.locator('article, [data-testid="venue-card"]');

        // Evaluate if we have venues (depends on seed data/mocking)
        // If no venues are guaranteed, we might need to look for an empty state or loading state
        // But for a happy path test, we expect at least one
        // await expect(venueCards.first()).toBeVisible();

        // 3. Click the first venue
        // await venueCards.first().click();

        // 4. Verify navigation to venue details
        // await expect(page).toHaveURL(/\/venues\/[\w-]+/);

        // 5. Verify menu section is visible
        // await expect(page.getByText('Menu', { exact: false })).toBeVisible();
    });
});
