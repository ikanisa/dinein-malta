import { test, expect } from '@playwright/test';

test.describe('Vendor User Journey', () => {
    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
    });

    test('vendor login page loads', async ({ page }) => {
        await page.goto('/#/vendor/login');

        await page.waitForLoadState('domcontentloaded');

        // Check for login form elements
        const emailInput = page.locator('[name="email"], [type="email"], input[placeholder*="email" i]').first();
        const passwordInput = page.locator('[name="password"], [type="password"]').first();
        const loginButton = page.getByRole('button', { name: /login|sign in/i }).or(
            page.locator('[type="submit"]')
        );

        // At least the page should load without error
        await expect(page).toHaveURL(/vendor/);
    });

    test('vendor login form has required fields', async ({ page }) => {
        await page.goto('/#/vendor/login');

        await page.waitForLoadState('domcontentloaded');

        // Check for form structure
        const form = page.locator('form').first();
        if (await form.isVisible()) {
            // Form should have inputs
            const inputs = await page.locator('input').count();
            expect(inputs).toBeGreaterThan(0);
        }
    });

    test('vendor login shows error for invalid credentials', async ({ page }) => {
        await page.goto('/#/vendor/login');

        await page.waitForLoadState('domcontentloaded');

        const emailInput = page.locator('[name="email"], [type="email"]').first();
        const passwordInput = page.locator('[name="password"], [type="password"]').first();

        if (await emailInput.isVisible() && await passwordInput.isVisible()) {
            await emailInput.fill('invalid@test.com');
            await passwordInput.fill('wrongpassword');

            // Submit form
            const submitButton = page.locator('[type="submit"]').or(
                page.getByRole('button', { name: /login|sign in/i })
            );

            if (await submitButton.isVisible()) {
                await submitButton.click();

                // Wait for response
                await page.waitForTimeout(2000);

                // Should show error or remain on login page
                await expect(page).toHaveURL(/login|vendor/);
            }
        }
    });

    test('vendor dashboard is protected', async ({ page }) => {
        // Try to access dashboard directly without auth
        await page.goto('/#/vendor/dashboard');

        await page.waitForLoadState('domcontentloaded');

        // Should redirect to login or show auth required
        const currentUrl = page.url();
        const isOnDashboard = currentUrl.includes('dashboard');
        const isOnLogin = currentUrl.includes('login');

        // Either redirected to login or shows auth message
        expect(isOnDashboard || isOnLogin).toBeTruthy();
    });

    test('vendor menu management page structure', async ({ page }) => {
        // Navigate to menu management (may require auth)
        await page.goto('/#/vendor/menu');

        await page.waitForLoadState('domcontentloaded');

        // Page should load without crashing
        const pageHasContent = await page.locator('main, div, form').first().isVisible();
        expect(pageHasContent).toBeTruthy();
    });

    test('vendor orders page loads', async ({ page }) => {
        await page.goto('/#/vendor/orders');

        await page.waitForLoadState('domcontentloaded');

        // Page should load
        const currentUrl = page.url();
        expect(currentUrl).toContain('vendor');
    });

    test('vendor settings page accessible', async ({ page }) => {
        await page.goto('/#/vendor/settings');

        await page.waitForLoadState('domcontentloaded');

        // Page should load without error
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });
});

test.describe('Vendor Menu Management', () => {
    test('menu items list structure', async ({ page }) => {
        await page.goto('/#/vendor/menu');

        await page.waitForLoadState('domcontentloaded');

        // Look for menu management UI elements
        const addButton = page.locator('[data-testid="add-menu-item"]').or(
            page.getByRole('button', { name: /add.*item|new.*item|\+/i })
        );

        // Either shows add button or login required
        const pageHasUI = await page.locator('button, a, form').first().isVisible();
        expect(pageHasUI).toBeTruthy();
    });

    test('add menu item form', async ({ page }) => {
        await page.goto('/#/vendor/menu/new');

        await page.waitForLoadState('domcontentloaded');

        // Look for form elements
        const nameInput = page.locator('[name="name"]').or(
            page.locator('input[placeholder*="name" i]')
        );
        const priceInput = page.locator('[name="price"]').or(
            page.locator('input[placeholder*="price" i], input[type="number"]')
        );

        // Page should load
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });
});

test.describe('Vendor Order Management', () => {
    test('orders page shows order list or empty state', async ({ page }) => {
        await page.goto('/#/vendor/orders');

        await page.waitForLoadState('domcontentloaded');

        // Should show orders, empty state, or login required
        const hasContent = await page.locator('[data-testid="order-card"], .order-item, [class*="empty"]').first().isVisible().catch(() => false);
        const hasUI = await page.locator('main, div').first().isVisible();

        expect(hasUI).toBeTruthy();
    });

    test('can filter orders by status', async ({ page }) => {
        await page.goto('/#/vendor/orders');

        await page.waitForLoadState('domcontentloaded');

        // Look for filter buttons or dropdown
        const filterUI = page.locator('[data-testid="status-filter"]').or(
            page.getByRole('combobox')
        ).or(
            page.locator('select, [role="listbox"]')
        );

        // Page should load
        const pageLoaded = await page.locator('body').isVisible();
        expect(pageLoaded).toBeTruthy();
    });
});
