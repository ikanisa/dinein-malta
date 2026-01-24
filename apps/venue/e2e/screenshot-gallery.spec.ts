import { test } from '@playwright/test';

test('take screenshots of main flows', async ({ page }) => {
    // Client Home
    console.log('Navigating to Client Home...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for fade-in animations
    await page.screenshot({ path: 'test-results/screenshots/client-home.png', fullPage: true });

    // Admin Dashboard
    console.log('Navigating to Admin Dashboard...');
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/screenshots/admin-dashboard.png', fullPage: true });

    // Vendor Dashboard
    console.log('Navigating to Vendor Dashboard...');
    await page.goto('/vendor');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/screenshots/vendor-dashboard.png', fullPage: true });

    // Vendor Menu
    console.log('Navigating to Vendor Menu...');
    await page.locator('nav').getByRole('button', { name: 'Menu' }).click({ force: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/screenshots/vendor-menu.png', fullPage: true });
});
