import { test, expect } from '@playwright/test';

test.describe('UI Migration Verification', () => {

    test.beforeEach(async ({ page }) => {
        // Listen for console logs
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));

        // Dismiss PWA install prompt to avoid blocking UI
        await page.addInitScript(() => {
            window.localStorage.setItem('pwa-install-dismissed', Date.now().toString());
        });

        // Mock Supabase Vendors Response globally
        await page.route('**/rest/v1/vendors*', async route => {
            const json = [
                {
                    id: '1',
                    name: 'The Glass Bistro',
                    slug: 'glass-bistro',
                    address: '123 Marina',
                    rating: 4.8,
                    review_count: 120,
                    status: 'active',
                    country: 'MT'
                }
            ];
            await route.fulfill({ json });
        });

        // Mock empty/success for other potential calls
        await page.route('**/rest/v1/profiles*', async route => route.fulfill({ json: { country_code: 'MT' } }));
        await page.route('**/rest/v1/rpc/*', async route => route.fulfill({ json: [] }));
    });

    test('Home Screen loads with Glass UI', async ({ page }) => {
        await page.goto('/');

        // Check for Header
        await expect(page.locator('header')).toBeVisible();
        await expect(page.getByPlaceholder('Find restaurants, food, drinks...')).toBeVisible();

        // Check for Venues (Glass Cards) using the mocked name
        const venueCards = page.locator('.group').filter({ hasText: 'The Glass Bistro' });
        await expect(venueCards.first()).toBeVisible();

        // Check for Bottom Nav presence
        await expect(page.getByTestId('nav-discover')).toBeVisible();
    });

    test('Venue Discovery loads', async ({ page }) => {
        await page.goto('/');
        // Use dispatchEvent to bypass viewport/overlay checks for fixed elements
        await page.getByTestId('nav-discover').dispatchEvent('click');

        // Check if search bar exists
        await expect(page.getByPlaceholder('Search venues...')).toBeVisible();
    });

    test('Reservations UI loads', async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('nav-reservations').dispatchEvent('click');

        // Check for "Bookings" header or content
        await expect(page.getByRole('heading', { name: 'Bookings' })).toBeVisible();
        await expect(page.getByText('Upcoming')).toBeVisible();
    });

    test('Settings UI loads', async ({ page }) => {
        await page.goto('/');
        await page.getByTestId('nav-profile').dispatchEvent('click');

        await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    });

});
