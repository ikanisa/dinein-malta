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
        // Per STARTER RULES: Customer bottom nav = EXACTLY 2 items (Home + Settings)
        // BottomNav uses Link elements with data-testid attributes
        const homeTab = page.locator('[data-testid="nav-home"]');
        const settingsTab = page.locator('[data-testid="nav-settings"]');

        // Verify both tabs exist
        await expect(homeTab).toBeVisible();
        await expect(settingsTab).toBeVisible();

        // Navigate to Settings
        await settingsTab.click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: 'test-results/home-03-settings.png', fullPage: true });

        // Back to Home
        await homeTab.click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: 'test-results/home-04-back-home.png', fullPage: true });
    });
});
