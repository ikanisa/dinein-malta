import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('home page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/#/');
    await page.waitForLoadState('domcontentloaded');

    // Page should load without critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('Failed to load resource') &&
      !e.includes('404') &&
      !e.includes('favicon')
    );
    expect(criticalErrors).toHaveLength(0);

    // Should have a title
    await expect(page).toHaveTitle(/DineIn/i);
  });

  test('explore route is reachable', async ({ page }) => {
    await page.goto('/#/explore');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/explore/);
  });

  test('vendor login page is accessible', async ({ page }) => {
    await page.goto('/#/manager/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/manager.*login/);
  });

  test('admin login page is accessible', async ({ page }) => {
    await page.goto('/#/admin/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/admin.*login/);
  });
});
