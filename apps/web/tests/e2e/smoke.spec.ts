import { test, expect } from '@playwright/test';

test('home loads with title', async ({ page }) => {
  await page.goto('/#/');
  await expect(page).toHaveTitle(/DineIn/i);
  await expect(page.locator('#root')).toBeVisible();
});

test('explore page shows heading', async ({ page }) => {
  await page.goto('/#/explore');
  await expect(page.getByRole('heading', { name: 'Explore' })).toBeVisible();
});
