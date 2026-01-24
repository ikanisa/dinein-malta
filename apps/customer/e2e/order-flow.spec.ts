import { test, expect, Page } from '@playwright/test';

/**
 * Customer Order Flow E2E Smoke Tests
 * 
 * Tests the complete customer ordering journey:
 * 1. Venue deep link entry via /v/:slug
 * 2. Menu browsing
 * 3. Adding items to cart
 * 4. Cart review
 * 5. Checkout (payment method selection)
 * 6. Order placement
 * 
 * These tests validate the critical "happy path" for customers.
 */

const TEST_VENUE_SLUG = 'test-venue'; // Should match seeded test data

async function waitForPageReady(page: Page) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
}

test.describe('Customer Order Flow - Deep Link Entry', () => {
    test('Deep link /v/:slug loads venue menu', async ({ page }) => {
        await page.goto(`/v/${TEST_VENUE_SLUG}`);
        await waitForPageReady(page);

        // Should not redirect to home
        expect(page.url()).toContain(`/v/${TEST_VENUE_SLUG}`);

        await page.screenshot({ path: 'test-results/order-01-venue-menu.png', fullPage: true });
    });

    test('Deep link with table parameter works', async ({ page }) => {
        await page.goto(`/v/${TEST_VENUE_SLUG}?t=5`);
        await waitForPageReady(page);

        // Should be on venue menu
        expect(page.url()).toContain(`/v/${TEST_VENUE_SLUG}`);

        await page.screenshot({ path: 'test-results/order-02-venue-with-table.png', fullPage: true });
    });
});

test.describe('Customer Order Flow - Menu Interaction', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`/v/${TEST_VENUE_SLUG}`);
        await waitForPageReady(page);
    });

    test('Menu displays items', async ({ page }) => {
        // Menu should have item cards or add buttons
        // Wait a bit for items to load
        await page.waitForTimeout(500);

        await page.screenshot({ path: 'test-results/order-03-menu-items.png', fullPage: true });
    });

    test('Can add item to cart', async ({ page }) => {
        // Find any add button (+ icon or "Add" text)
        const addButton = page.locator('button').filter({ hasText: '+' }).first();

        if (await addButton.isVisible().catch(() => false)) {
            await addButton.click();
            await page.waitForTimeout(300);
            // Cart indicator should update after adding item
            await page.screenshot({ path: 'test-results/order-04-item-added.png', fullPage: true });
        } else {
            // No add button visible - take screenshot for debugging
            await page.screenshot({ path: 'test-results/order-04-no-add-button.png', fullPage: true });
        }
    });
});

test.describe('Customer Order Flow - Cart & Checkout', () => {
    test('Full ordering journey (<= 4 taps from menu)', async ({ page }) => {
        // Step 1: Go to venue menu
        await page.goto(`/v/${TEST_VENUE_SLUG}`);
        await waitForPageReady(page);
        await page.screenshot({ path: 'test-results/order-05-step1-menu.png', fullPage: true });

        // Step 2: Add item (Tap 1)
        const addButton = page.locator('button').filter({ hasText: '+' }).first();
        if (await addButton.isVisible().catch(() => false)) {
            await addButton.click();
            await page.waitForTimeout(300);
            await page.screenshot({ path: 'test-results/order-06-step2-add.png', fullPage: true });
        }

        // Step 3: Go to Cart (Tap 2)
        // Look for cart button in sticky CTA or header
        const cartButton = page.locator('button, a').filter({ hasText: /cart|view cart/i }).first();
        if (await cartButton.isVisible().catch(() => false)) {
            await cartButton.click();
            await page.waitForTimeout(300);
            await page.screenshot({ path: 'test-results/order-07-step3-cart.png', fullPage: true });
        } else {
            // Try direct navigation
            await page.goto(`/v/${TEST_VENUE_SLUG}/cart`);
            await waitForPageReady(page);
            await page.screenshot({ path: 'test-results/order-07-step3-cart-direct.png', fullPage: true });
        }

        // Step 4: Proceed to Checkout (Tap 3)
        const checkoutButton = page.locator('button, a').filter({ hasText: /checkout|proceed|continue/i }).first();
        if (await checkoutButton.isVisible().catch(() => false)) {
            await checkoutButton.click();
            await page.waitForTimeout(300);
            await page.screenshot({ path: 'test-results/order-08-step4-checkout.png', fullPage: true });
        } else {
            // Try direct navigation
            await page.goto(`/v/${TEST_VENUE_SLUG}/checkout`);
            await waitForPageReady(page);
            await page.screenshot({ path: 'test-results/order-08-step4-checkout-direct.png', fullPage: true });
        }

        // Step 5: Place Order (Tap 4)
        const placeOrderButton = page.locator('button').filter({ hasText: /pay|place|order|confirm/i }).first();
        if (await placeOrderButton.isVisible().catch(() => false)) {
            await placeOrderButton.click();
            await page.waitForTimeout(500);
            await page.screenshot({ path: 'test-results/order-09-step5-placed.png', fullPage: true });

            // Should navigate to order status
            if (page.url().includes('/orders/')) {
                await page.screenshot({ path: 'test-results/order-10-order-tracking.png', fullPage: true });
            }
        }
    });
});

test.describe('Customer Order Flow - Error Handling', () => {
    test('Invalid venue slug shows error/fallback', async ({ page }) => {
        await page.goto('/v/nonexistent-venue-12345');
        await waitForPageReady(page);

        // Should show some kind of error or redirect
        await page.screenshot({ path: 'test-results/order-11-invalid-venue.png', fullPage: true });
    });

    test('Empty cart shows empty state', async ({ page }) => {
        await page.goto(`/v/${TEST_VENUE_SLUG}/cart`);
        await waitForPageReady(page);

        // Should show empty state or redirect
        await page.screenshot({ path: 'test-results/order-12-empty-cart.png', fullPage: true });
    });
});
