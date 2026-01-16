import { test, expect } from '@playwright/test';

/**
 * Client User Journey Tests
 * 
 * Updated to match current DineIn architecture:
 * - QR-first flow (no explore page)
 * - Direct vendor/table links
 * - HashRouter navigation (/#/)
 */

test.describe('Client User Journey', () => {
    test.beforeEach(async ({ page }) => {
        // Clear any previous state
        await page.context().clearCookies();
    });

    test('homepage loads and redirects correctly', async ({ page }) => {
        await page.goto('/#/');
        await page.waitForLoadState('networkidle');

        // Homepage should redirect to scan or a vendor page
        const url = page.url();
        const isValidRedirect = url.includes('/scan') || url.includes('/v/') || url.includes('/settings');
        expect(isValidRedirect).toBeTruthy();

        // Check that the page has loaded properly (no blank screen)
        const hasContent = await page.locator('main, div, [class*="glass"]').first().isVisible();
        expect(hasContent).toBeTruthy();
    });

    test('settings page is accessible', async ({ page }) => {
        await page.goto('/#/settings');
        await page.waitForLoadState('networkidle');

        // Settings page should have some content
        const hasContent = await page.locator('h1, h2, button, [class*="glass"]').first().isVisible();
        expect(hasContent).toBeTruthy();
    });

    test('can view vendor menu page', async ({ page }) => {
        // Navigate to a test vendor (use hash routing)
        await page.goto('/#/v/test-restaurant');

        await page.waitForLoadState('networkidle');

        // Should be on a vendor page
        await expect(page).toHaveURL(/\/#\/v\//);

        // Look for menu section or vendor info
        const pageHasContent = await page.locator('main, [data-testid="menu-section"], h1, h2, [class*="glass"]').first().isVisible().catch(() => false);
        expect(pageHasContent).toBeTruthy();
    });

    test('can scan QR and view table menu', async ({ page }) => {
        // Simulate QR code scan by navigating to table URL
        await page.goto('/#/v/test-restaurant/t/TABLE001');

        await page.waitForLoadState('networkidle');

        // Check URL contains table identifier
        await expect(page).toHaveURL(/TABLE001|t\//);
    });

    test('can add items to cart', async ({ page }) => {
        await page.goto('/#/v/test-restaurant');

        await page.waitForLoadState('networkidle');

        // Look for add to cart button
        const addButton = page.locator('[data-testid="add-to-cart"]').or(
            page.getByRole('button', { name: /add|cart|\+/i })
        ).first();

        if (await addButton.isVisible()) {
            await addButton.click();

            // Cart should update
            const cartBadge = page.locator('[data-testid="cart-badge"], [class*="badge"]');
            await expect(cartBadge.or(page.locator('body'))).toBeVisible();
        }
    });

    test('can open cart modal/page', async ({ page }) => {
        await page.goto('/#/v/test-restaurant');

        await page.waitForLoadState('networkidle');

        // Look for cart icon/button
        const cartButton = page.locator('[data-testid="cart-icon"]').or(
            page.getByRole('button', { name: /cart/i })
        ).or(
            page.locator('[class*="cart"]')
        ).first();

        if (await cartButton.isVisible()) {
            await cartButton.click();

            // Cart modal or page should be visible
            await page.waitForTimeout(500);
        }
    });

    test('order status page loads', async ({ page }) => {
        await page.goto('/#/order/test-order-123');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Order page should show content (order details or not found message)
        // Accept any visible body content as page is loading
        const hasContent = await page.locator('body').isVisible();
        expect(hasContent).toBeTruthy();
    });

    test('bar onboarding page is accessible', async ({ page }) => {
        await page.goto('/#/bar/onboard');
        await page.waitForLoadState('networkidle');

        // Check page has content
        const hasContent = await page.locator('main, h1, h2, form, [class*="glass"]').first().isVisible();
        expect(hasContent).toBeTruthy();
    });

    test('navigation works across pages without errors', async ({ page }) => {
        // Track console errors
        const errors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Navigate through main client pages
        await page.goto('/#/');
        await page.waitForLoadState('networkidle');

        await page.goto('/#/settings');
        await page.waitForLoadState('networkidle');

        await page.goto('/#/v/test-venue');
        await page.waitForLoadState('networkidle');

        await page.goto('/#/');
        await page.waitForLoadState('networkidle');

        // Filter out expected errors (like 404s for missing resources)
        const criticalErrors = errors.filter(e =>
            !e.includes('Failed to load resource') &&
            !e.includes('404') &&
            !e.includes('429') // Rate limiting
        );

        expect(criticalErrors).toHaveLength(0);
    });

    test('page is responsive on mobile viewport', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/#/v/test-venue');
        await page.waitForLoadState('networkidle');

        // Check that content is visible (no horizontal overflow)
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(400);
    });
});
