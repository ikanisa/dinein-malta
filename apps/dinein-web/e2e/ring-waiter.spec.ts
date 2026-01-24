import { test, expect, Page } from '@playwright/test';

/**
 * Ring Waiter Feature Tests
 */

async function waitForPageReady(page: Page) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
}

test.describe('Ring Waiter Feature', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
    });

    test('Ring Waiter button is visible on home screen', async ({ page }) => {
        // Look for the Ring Waiter button
        const ringButton = page.getByText('Ring Waiter', { exact: false });
        await expect(ringButton).toBeVisible();
        await page.screenshot({ path: 'test-results/ring-01-button-visible.png', fullPage: true });
    });

    test('Ring Waiter modal opens on tap', async ({ page }) => {
        // Click the Ring Waiter button using standard click
        const ringButton = page.getByText('Ring Waiter', { exact: false });
        // Ensure it's stable
        await ringButton.waitFor({ state: 'visible' });
        await ringButton.click();
        await page.waitForTimeout(1000); // Wait longer for animation

        // Modal should be visible
        const modal = page.getByText('Enter your table number', { exact: false });
        await expect(modal).toBeVisible();
        await page.screenshot({ path: 'test-results/ring-02-modal-open.png', fullPage: true });
    });

    test('Can enter table number and see reason options', async ({ page }) => {
        // Open modal
        const ringButton = page.getByText('Ring Waiter', { exact: false });
        await ringButton.waitFor({ state: 'visible' });
        await ringButton.click();
        await page.waitForTimeout(1000);

        // Enter table number
        const tableInput = page.locator('input[type="number"]');
        await tableInput.fill('5');
        await page.screenshot({ path: 'test-results/ring-03-table-entered.png', fullPage: true });

        // Click Continue using dispatchEvent for fixed position elements
        const continueBtn = page.getByRole('button', { name: 'Continue', exact: true });
        await continueBtn.click();
        await page.waitForTimeout(500);

        // Should see reason options
        const readyToOrder = page.getByText('Ready to Order', { exact: false });
        await expect(readyToOrder).toBeVisible();
        await page.screenshot({ path: 'test-results/ring-04-reason-options.png', fullPage: true });
    });

    test('Modal can be closed', async ({ page }) => {
        // Open modal
        const ringButton = page.getByText('Ring Waiter', { exact: false });
        await ringButton.waitFor({ state: 'visible' });
        await ringButton.click();
        await page.waitForTimeout(1000);

        // Close modal with X button using dispatchEvent
        const closeButton = page.locator('button').filter({ has: page.locator('svg.lucide-x') });
        await closeButton.dispatchEvent('click');
        await page.waitForTimeout(300);

        // Modal should be gone
        const modal = page.getByText('Enter your table number', { exact: false });
        await expect(modal).not.toBeVisible();
        await page.screenshot({ path: 'test-results/ring-05-modal-closed.png', fullPage: true });
    });
});

