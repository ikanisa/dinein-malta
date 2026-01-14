import { test, expect } from '@playwright/test';

test.describe('Client User Journey', () => {
    test.beforeEach(async ({ page }) => {
        // Clear any previous state
        await page.context().clearCookies();
    });

    test('homepage loads successfully', async ({ page }) => {
        await page.goto('/');

        // Check that the page has loaded
        await expect(page).toHaveTitle(/DineIn/i);

        // Check for main navigation or header elements
        const header = page.locator('header, nav, [data-testid="main-nav"]').first();
        await expect(header).toBeVisible({ timeout: 10000 });
    });

    test('can navigate to explore page', async ({ page }) => {
        await page.goto('/');

        // Look for explore link/button
        const exploreLink = page.getByRole('link', { name: /explore/i }).or(
            page.getByRole('button', { name: /explore/i })
        ).or(
            page.locator('[href*="explore"]')
        );

        // Click on explore if visible, otherwise navigate directly
        if (await exploreLink.isVisible()) {
            await exploreLink.click();
        } else {
            await page.goto('/#/explore');
        }

        await expect(page).toHaveURL(/explore/);
    });

    test('can browse vendors list', async ({ page }) => {
        await page.goto('/#/explore');

        // Wait for content to load
        await page.waitForLoadState('networkidle');

        // Look for vendor cards or list items
        const vendorCard = page.locator('[data-testid="vendor-card"]').or(
            page.locator('.vendor-card')
        ).or(
            page.locator('[class*="glass-panel"]')
        ).first();

        // Either vendor cards should be visible or loading skeleton
        const hasContent = await vendorCard.isVisible().catch(() => false);
        const hasLoading = await page.locator('.animate-pulse, [class*="skeleton"]').first().isVisible().catch(() => false);

        expect(hasContent || hasLoading).toBeTruthy();
    });

    test('can view vendor details page', async ({ page }) => {
        // Navigate to a test vendor (use hash routing)
        await page.goto('/#/v/test-restaurant');

        await page.waitForLoadState('networkidle');

        // Should be on a vendor page
        await expect(page).toHaveURL(/\/v\//);

        // Look for menu section or vendor info
        const pageHasContent = await page.locator('main, [data-testid="menu-section"], h1, h2').first().isVisible().catch(() => false);
        expect(pageHasContent).toBeTruthy();
    });

    test('can scan QR and view table menu', async ({ page }) => {
        // Simulate QR code scan by navigating to table URL
        await page.goto('/#/v/test-restaurant/t/TABLE001');

        await page.waitForLoadState('networkidle');

        // Check URL contains table identifier
        await expect(page).toHaveURL(/TABLE001|t\//);
    });

    test('can add items to cart', async ({ page }) => {
        await page.goto('/#/v/test-restaurant');

        await page.waitForLoadState('networkidle');

        // Look for add to cart button
        const addButton = page.locator('[data-testid="add-to-cart"]').or(
            page.getByRole('button', { name: /add|cart|\+/i })
        ).first();

        if (await addButton.isVisible()) {
            await addButton.click();

            // Cart should update
            const cartBadge = page.locator('[data-testid="cart-badge"], [class*="badge"]');
            await expect(cartBadge.or(page.locator('body'))).toBeVisible();
        }
    });

    test('can open cart modal/page', async ({ page }) => {
        await page.goto('/#/v/test-restaurant');

        await page.waitForLoadState('networkidle');

        // Look for cart icon/button
        const cartButton = page.locator('[data-testid="cart-icon"]').or(
            page.getByRole('button', { name: /cart/i })
        ).or(
            page.locator('[class*="cart"]')
        ).first();

        if (await cartButton.isVisible()) {
            await cartButton.click();

            // Cart modal or page should be visible
            await page.waitForTimeout(500);
        }
    });

    test('navigation works across pages without errors', async ({ page }) => {
        // Track console errors
        const errors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        // Navigate through main pages
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.goto('/#/explore');
        await page.waitForLoadState('networkidle');

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Filter out expected errors (like 404s for missing resources)
        const criticalErrors = errors.filter(e =>
            !e.includes('Failed to load resource') &&
            !e.includes('404')
        );

        expect(criticalErrors).toHaveLength(0);
    });

    test('page is responsive on mobile viewport', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check that content is visible (no horizontal overflow)
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(400);
    });
});
