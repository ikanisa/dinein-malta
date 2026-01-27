import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for DineIn E2E Tests
 * 
 * Supports multiple projects (customer, venue, admin) with environment-based URLs.
 * 
 * Usage:
 *   pnpm e2e                    # Run all tests
 *   pnpm e2e --project=customer # Run customer tests only
 *   pnpm e2e --headed           # Run with browser visible
 */

const getBaseUrl = (app: 'customer' | 'venue' | 'admin') => {
    const isStaging = process.env.E2E_ENV === 'staging';

    if (isStaging) {
        // Staging URLs - update these with your actual staging deployments
        const stagingUrls = {
            customer: process.env.CUSTOMER_STAGING_URL || 'https://dinein-customer.pages.dev',
            venue: process.env.VENUE_STAGING_URL || 'https://dinein-venue.pages.dev',
            admin: process.env.ADMIN_STAGING_URL || 'https://dinein-admin.pages.dev',
        };
        return stagingUrls[app];
    }

    // Local URLs
    const localUrls = {
        customer: 'http://localhost:5173',
        venue: 'http://localhost:5174',
        admin: 'http://localhost:5175',
    };
    return localUrls[app];
};

export default defineConfig({
    testDir: './specs',
    fullyParallel: false, // Run sequentially for determinism
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0, // Limited retries to catch flakiness
    workers: 1, // Single worker for deterministic tests
    reporter: [
        ['html', { open: 'never' }],
        ['list'],
    ],

    // Global settings
    use: {
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    // Global setup - fetches real venue data from Supabase
    globalSetup: require.resolve('./global-setup'),

    // Output directories
    outputDir: './test-results',

    projects: [
        // Customer App Tests
        {
            name: 'customer',
            testMatch: /01_customer.*\.spec\.ts$/,
            use: {
                ...devices['Pixel 5'], // Mobile-first
                baseURL: getBaseUrl('customer'),
            },
        },

        // Venue App Tests
        {
            name: 'venue',
            testMatch: /02_venue.*\.spec\.ts$/,
            use: {
                ...devices['Pixel 5'], // Mobile-first
                baseURL: getBaseUrl('venue'),
            },
        },

        // Admin App Tests
        {
            name: 'admin',
            testMatch: /03_admin.*\.spec\.ts$/,
            use: {
                ...devices['Desktop Chrome'], // Admin typically desktop
                baseURL: getBaseUrl('admin'),
            },
        },

        // All tests on mobile
        {
            name: 'mobile',
            use: {
                ...devices['Pixel 5'],
            },
        },
    ],

    // No webServer config - tests expect apps to be running already
    // Run: pnpm dev:customer, pnpm dev:venue, pnpm dev:admin before tests
});
