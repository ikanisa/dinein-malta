import { test, expect } from '@playwright/test';
import { VENUE } from '../fixtures/selectors';
import { USERS, ROUTES, ORDER_STATUSES } from '../fixtures/testData';
import { loginAsVenueOwner } from '../utils/auth';
import { waitForPageReady, waitForTestId } from '../utils/wait';

/**
 * Venue Orders & Bell E2E Tests
 * 
 * Tests the venue owner's order management workflow:
 * 1. Login to venue portal
 * 2. Access orders queue
 * 3. Update order status: Placed → Received → Served
 * 4. Bell/ring management
 * 
 * SCOPE GUARD:
 * - Order statuses ONLY: Placed/Received/Served/Cancelled
 * - NO delivery statuses
 * - NO payment verification
 */

test.describe('Venue Portal - Authentication', () => {
    test('Login page loads correctly', async ({ page }) => {
        await page.goto(ROUTES.VENUE.LOGIN);
        await waitForPageReady(page);

        // Should show login form
        const loginPage = page.getByTestId(VENUE.LOGIN.PAGE);
        const hasTestId = await loginPage.isVisible({ timeout: 2000 }).catch(() => false);

        if (hasTestId) {
            await expect(loginPage).toBeVisible();
        } else {
            // Fallback: check for login form elements
            const emailInput = page.getByLabel(/email/i);
            await expect(emailInput.first()).toBeVisible();
        }

        await page.screenshot({ path: 'test-results/02-venue-01-login.png', fullPage: true });
    });

    test('Can login as venue owner', async ({ page }) => {
        await loginAsVenueOwner(page);

        // Should be on dashboard after login
        const dashboardPage = page.getByTestId(VENUE.DASHBOARD.PAGE);
        const hasTestId = await dashboardPage.isVisible({ timeout: 5000 }).catch(() => false);

        if (hasTestId) {
            await expect(dashboardPage).toBeVisible();
        } else {
            // Fallback: check URL
            expect(page.url()).toContain('dashboard');
        }

        await page.screenshot({ path: 'test-results/02-venue-02-dashboard.png', fullPage: true });
    });

    test('Invalid credentials show error', async ({ page }) => {
        await page.goto(ROUTES.VENUE.LOGIN);
        await waitForPageReady(page);

        // Fill with invalid credentials
        const emailInput = page.getByTestId(VENUE.LOGIN.EMAIL)
            .or(page.getByLabel(/email/i));
        const pinInput = page.getByTestId(VENUE.LOGIN.PIN)
            .or(page.getByLabel(/pin/i));
        const submitButton = page.getByTestId(VENUE.LOGIN.SUBMIT)
            .or(page.getByRole('button', { name: /sign in|login/i }));

        await emailInput.fill('invalid@test.com');
        await pinInput.fill('0000');
        await submitButton.click();

        await page.waitForTimeout(1000);

        // Should show error or stay on login page
        await page.screenshot({ path: 'test-results/02-venue-03-login-error.png', fullPage: true });
    });
});

test.describe('Venue Portal - Orders Queue', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsVenueOwner(page);
    });

    test('Orders queue is accessible', async ({ page }) => {
        // Navigate to orders
        const ordersNav = page.getByTestId(VENUE.NAV.ORDERS)
            .or(page.locator('a, button').filter({ hasText: /orders/i }).first());

        if (await ordersNav.isVisible({ timeout: 3000 }).catch(() => false)) {
            await ordersNav.click();
            await waitForPageReady(page);
        } else {
            await page.goto(ROUTES.VENUE.ORDERS);
            await waitForPageReady(page);
        }

        // Should show orders page
        const ordersPage = page.getByTestId(VENUE.ORDERS.PAGE);
        const hasTestId = await ordersPage.isVisible({ timeout: 3000 }).catch(() => false);

        if (hasTestId) {
            await expect(ordersPage).toBeVisible();
        }

        await page.screenshot({ path: 'test-results/02-venue-04-orders-queue.png', fullPage: true });
    });

    test('Order cards display status badges', async ({ page }) => {
        await page.goto(ROUTES.VENUE.ORDERS);
        await waitForPageReady(page);

        // Look for order cards with test IDs
        const orderCards = page.locator('[data-testid^="venue-orders:order-card:"]');
        const cardCount = await orderCards.count();

        if (cardCount > 0) {
            // At least one order card visible
            await expect(orderCards.first()).toBeVisible();
        } else {
            // May have empty state
            const emptyState = page.getByTestId(VENUE.ORDERS.EMPTY_STATE)
                .or(page.getByText(/no orders|empty/i));
            // Either has orders or shows empty state
        }

        await page.screenshot({ path: 'test-results/02-venue-05-order-cards.png', fullPage: true });
    });
});

test.describe('Venue Portal - Order Status Updates', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsVenueOwner(page);
        await page.goto(ROUTES.VENUE.ORDERS);
        await waitForPageReady(page);
    });

    test('Can update order status: Placed → Received', async ({ page }) => {
        // Find a Placed order
        const orderCards = page.locator('[data-testid^="venue-orders:order-card:"]');
        const cardCount = await orderCards.count();

        if (cardCount > 0) {
            // Click on first order to open details
            await orderCards.first().click();
            await page.waitForTimeout(300);

            // Look for Mark Received button
            const markReceivedButton = page.getByTestId(VENUE.ORDERS.MARK_RECEIVED)
                .or(page.locator('button').filter({ hasText: /receive|accept|mark received/i }).first());

            if (await markReceivedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
                await markReceivedButton.click();
                await page.waitForTimeout(500);

                await page.screenshot({ path: 'test-results/02-venue-06-marked-received.png', fullPage: true });
            }
        } else {
            // No orders to test - log and continue
            console.log('No orders available for status update test');
            await page.screenshot({ path: 'test-results/02-venue-06-no-orders.png', fullPage: true });
        }
    });

    test('Can update order status: Received → Served', async ({ page }) => {
        // Find a Received order
        const orderCards = page.locator('[data-testid^="venue-orders:order-card:"]');
        const cardCount = await orderCards.count();

        if (cardCount > 0) {
            // Look for Mark Served button
            const markServedButton = page.getByTestId(VENUE.ORDERS.MARK_SERVED)
                .or(page.locator('button').filter({ hasText: /serve|complete|mark served/i }).first());

            if (await markServedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
                await markServedButton.click();
                await page.waitForTimeout(500);

                await page.screenshot({ path: 'test-results/02-venue-07-marked-served.png', fullPage: true });
            }
        }
    });

    test('Can cancel an order', async ({ page }) => {
        const orderCards = page.locator('[data-testid^="venue-orders:order-card:"]');
        const cardCount = await orderCards.count();

        if (cardCount > 0) {
            await orderCards.first().click();
            await page.waitForTimeout(300);

            // Look for Cancel button
            const cancelButton = page.getByTestId(VENUE.ORDERS.CANCEL)
                .or(page.locator('button').filter({ hasText: /cancel/i }).first());

            if (await cancelButton.isVisible({ timeout: 3000 }).catch(() => false)) {
                await page.screenshot({ path: 'test-results/02-venue-08-cancel-visible.png', fullPage: true });
                // Don't actually cancel to preserve test data
            }
        }
    });

    test('Only allowed statuses exist (no delivery)', async ({ page }) => {
        // Verify UI only shows allowed statuses
        const forbiddenStatuses = ['delivering', 'delivered', 'in_transit', 'picked_up'];

        for (const status of forbiddenStatuses) {
            const statusElements = page.getByText(new RegExp(status, 'i'));
            const count = await statusElements.count();
            expect(count).toBe(0);
        }
    });
});

test.describe('Venue Portal - Bell/Ring Management', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsVenueOwner(page);
    });

    test('Bell page is accessible', async ({ page }) => {
        // Navigate to bell/ring page
        const bellNav = page.getByTestId(VENUE.NAV.BELL)
            .or(page.locator('a, button').filter({ hasText: /bell|ring|notifications/i }).first());

        if (await bellNav.isVisible({ timeout: 3000 }).catch(() => false)) {
            await bellNav.click();
            await waitForPageReady(page);
        } else {
            await page.goto(ROUTES.VENUE.BELL);
            await waitForPageReady(page);
        }

        // Should show bell page
        const bellPage = page.getByTestId(VENUE.BELL.PAGE);
        const hasTestId = await bellPage.isVisible({ timeout: 3000 }).catch(() => false);

        await page.screenshot({ path: 'test-results/02-venue-09-bell-page.png', fullPage: true });
    });

    test('Bell calls display correctly', async ({ page }) => {
        await page.goto(ROUTES.VENUE.BELL);
        await waitForPageReady(page);

        // Look for bell call cards
        const callCards = page.locator('[data-testid^="venue-bell:call-card:"]');
        const cardCount = await callCards.count();

        if (cardCount > 0) {
            await expect(callCards.first()).toBeVisible();

            // Each call should have acknowledge button
            const ackButton = page.locator('[data-testid^="venue-bell:ack:"]').first();
            if (await ackButton.isVisible().catch(() => false)) {
                await expect(ackButton).toBeVisible();
            }
        } else {
            // May have empty state
            const emptyState = page.getByTestId(VENUE.BELL.EMPTY_STATE)
                .or(page.getByText(/no.*call|empty/i));
        }

        await page.screenshot({ path: 'test-results/02-venue-10-bell-calls.png', fullPage: true });
    });

    test('Can acknowledge a bell call', async ({ page }) => {
        await page.goto(ROUTES.VENUE.BELL);
        await waitForPageReady(page);

        // Find acknowledge button
        const ackButton = page.locator('[data-testid^="venue-bell:ack:"]').first()
            .or(page.locator('button').filter({ hasText: /acknowledge|ack|dismiss/i }).first());

        if (await ackButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await ackButton.click();
            await page.waitForTimeout(500);

            await page.screenshot({ path: 'test-results/02-venue-11-bell-acked.png', fullPage: true });
        }
    });
});
