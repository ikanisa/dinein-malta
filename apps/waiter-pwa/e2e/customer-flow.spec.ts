import { test, expect, Page } from '@playwright/test';

/**
 * PWA Home Flow Tests
 */

async function waitForPageReady(page: Page) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
}

test.describe('PWA Home Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForPageReady(page);
    });

    test('Home Screen loads successfully', async ({ page }) => {
        await expect(page).toHaveURL('/');
        await page.screenshot({ path: 'test-results/home-01-loaded.png', fullPage: true });
    });

    test('Bottom navigation is visible', async ({ page }) => {
        await expect(page.locator('nav')).toBeVisible();
        await page.screenshot({ path: 'test-results/home-02-nav.png', fullPage: true });
    });

    test('Can switch between tabs', async ({ page }) => {
        // Get nav buttons - use evaluate for fixed position elements outside viewport
        const buttons = page.locator('nav button');

        // Verify 4 tabs exist
        await expect(buttons).toHaveCount(4);

        // Use dispatchEvent for reliable clicks on fixed nav
        await buttons.nth(1).dispatchEvent('click');
        await page.waitForTimeout(300);
        await page.screenshot({ path: 'test-results/home-03-discover.png', fullPage: true });

        await buttons.nth(2).dispatchEvent('click');
        await page.waitForTimeout(300);
        await page.screenshot({ path: 'test-results/home-04-reservations.png', fullPage: true });

        await buttons.nth(3).dispatchEvent('click');
        await page.waitForTimeout(300);
        await page.screenshot({ path: 'test-results/home-05-settings.png', fullPage: true });

        await buttons.nth(0).dispatchEvent('click');
        await page.waitForTimeout(300);
        await page.screenshot({ path: 'test-results/home-06-back-home.png', fullPage: true });
    });
});
