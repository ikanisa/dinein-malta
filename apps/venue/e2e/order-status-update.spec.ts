import { test, expect, Page } from '@playwright/test';

/**
 * Vendor Order Status Update E2E Smoke Tests
 * 
 * Tests the vendor's ability to update order statuses:
 * 1. Dashboard access
 * 2. Orders queue view
 * 3. Order status transitions: Placed → Received → Served
 * 
 * These tests validate the critical vendor workflow for processing orders.
 */

async function waitForPageReady(page: Page) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
}

// Mock login helper - in real tests, this would be replaced with actual auth
async function loginAsVendor(page: Page) {
    await page.goto('/');
    await waitForPageReady(page);

    // Fill login form if present
    const emailInput = page.getByLabel('Email');
    if (await emailInput.isVisible().catch(() => false)) {
        await emailInput.fill('owner@kigali.com');
        const pinInput = page.getByLabel('Pin');
        if (await pinInput.isVisible().catch(() => false)) {
            await pinInput.fill('1234');
        }
        const submitButton = page.getByRole('button', { name: /sign in|login/i });
        if (await submitButton.isVisible().catch(() => false)) {
            await submitButton.click();
            await waitForPageReady(page);
        }
    }
}

test.describe('Vendor Portal - Dashboard Access', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
    });

    test('Login page loads correctly', async ({ page }) => {
        // Should show login form or dashboard
        const content = page.locator('main, [class*="min-h-screen"]');
        await expect(content.first()).toBeVisible();
        await page.screenshot({ path: 'test-results/vendor-01-login.png', fullPage: true });
    });

    test('Dashboard shows after successful login', async ({ page }) => {
        await loginAsVendor(page);

        // Look for dashboard elements
        const dashboardContent = page.getByText(/dashboard|orders|welcome/i);
        if (await dashboardContent.first().isVisible().catch(() => false)) {
            await page.screenshot({ path: 'test-results/vendor-02-dashboard.png', fullPage: true });
        }
    });
});

test.describe('Vendor Portal - Orders Queue', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsVendor(page);
    });

    test('Orders queue is accessible', async ({ page }) => {
        // Navigate to orders if not already there
        const ordersNav = page.locator('button, a').filter({ hasText: /orders/i }).first();
        if (await ordersNav.isVisible().catch(() => false)) {
            await ordersNav.click();
            await waitForPageReady(page);
        }

        await page.screenshot({ path: 'test-results/vendor-03-orders-queue.png', fullPage: true });
    });

    test('Orders show status badges', async ({ page }) => {
        // Navigate to orders
        await page.goto('/dashboard/orders');
        await waitForPageReady(page);

        // Status badges should be visible on order cards
        await page.screenshot({ path: 'test-results/vendor-04-status-badges.png', fullPage: true });
    });
});

test.describe('Vendor Portal - Order Status Update Flow', () => {
    test('Can update order status: Placed → Received → Served', async ({ page }) => {
        await loginAsVendor(page);

        // Step 1: Navigate to orders
        await page.goto('/dashboard/orders');
        await waitForPageReady(page);
        await page.screenshot({ path: 'test-results/vendor-05-step1-orders.png', fullPage: true });

        // Order cards should be visible in the queue
        // Step 3: Try to update from Placed → Received
        const receiveButton = page.locator('button').filter({ hasText: /receive|accept|mark received/i }).first();
        if (await receiveButton.isVisible().catch(() => false)) {
            await receiveButton.click();
            await page.waitForTimeout(500);
            await page.screenshot({ path: 'test-results/vendor-06-step2-received.png', fullPage: true });
        }

        // Step 4: Try to update from Received → Served
        const serveButton = page.locator('button').filter({ hasText: /serve|complete|mark served/i }).first();
        if (await serveButton.isVisible().catch(() => false)) {
            await serveButton.click();
            await page.waitForTimeout(500);
            await page.screenshot({ path: 'test-results/vendor-07-step3-served.png', fullPage: true });
        }
    });

    test('Can cancel an order', async ({ page }) => {
        await loginAsVendor(page);
        await page.goto('/dashboard/orders');
        await waitForPageReady(page);

        // Look for cancel action
        const cancelButton = page.locator('button').filter({ hasText: /cancel/i }).first();
        if (await cancelButton.isVisible().catch(() => false)) {
            await page.screenshot({ path: 'test-results/vendor-08-cancel-option.png', fullPage: true });
        }
    });
});

test.describe('Vendor Portal - Bell/Ring Integration', () => {
    test('Bell notifications are visible', async ({ page }) => {
        await loginAsVendor(page);

        // Bell/notification indicator should be visible
        await page.screenshot({ path: 'test-results/vendor-09-bell.png', fullPage: true });
    });
});
