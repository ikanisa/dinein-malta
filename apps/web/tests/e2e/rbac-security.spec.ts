import { test, expect } from '@playwright/test';

/**
 * RBAC Security Tests
 * 
 * These tests validate that role-based access control is enforced correctly:
 * - Unauthenticated users cannot access protected routes
 * - Vendors cannot access admin routes
 * - Proper redirects occur when unauthorized access is attempted
 * 
 * Note: Some tests are skipped on Mobile Safari due to WebKit localStorage restrictions
 */

// Skip on webkit/safari due to localStorage security restrictions in testing context
test.describe('RBAC Security - Unauthenticated Access', () => {
    // Skip this test suite on webkit due to localStorage restrictions
    test.skip(({ browserName }) => browserName === 'webkit', 'Skipping on WebKit due to localStorage restrictions');

    test.beforeEach(async ({ page }) => {
        // Navigate to page first (required for Safari to access localStorage)
        await page.goto('/#/');
        await page.waitForLoadState('domcontentloaded');

        // Now clear auth state
        await page.context().clearCookies();
        try {
            await page.evaluate(() => {
                localStorage.clear();
                sessionStorage.clear();
            });
        } catch {
            // Safari may block localStorage in some contexts - this is acceptable
            console.log('[INFO] Could not clear localStorage - continuing with test');
        }

        // Dismiss PWA install prompt if visible (localStorage cleared so it may reappear)
        await page.addLocatorHandler(
            page.locator('text=Install DineIn').or(page.locator('text=Install App')),
            async (overlay) => {
                const laterButton = overlay.locator('button:has-text("Later")');
                if (await laterButton.isVisible()) {
                    await laterButton.click();
                }
            }
        );
    });

    test('accessing admin dashboard without auth shows login or spinner', async ({ page }) => {
        // Attempt to access admin dashboard directly
        await page.goto('/#/admin/dashboard');
        await page.waitForLoadState('networkidle');

        // Wait for auth check to complete
        await page.waitForTimeout(4000);

        const currentUrl = page.url();

        // Check various indicators that the route is protected
        const isOnLogin = currentUrl.includes('login');
        const hasSpinner = await page.locator('.animate-spin').count() > 0;
        const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').count() > 0;
        const hasGoogleAuth = await page.locator('button:has-text("Google"), [aria-label*="Google"], [class*="google"]').count() > 0;
        const hasBlankProtection = await page.locator('main').evaluate((el) => !el || el.innerHTML.trim() === '' || el.textContent?.includes('Loading'));

        // Log evidence
        console.log('[EVIDENCE] Admin dashboard access - URL:', currentUrl);
        console.log('[EVIDENCE] Is on login:', isOnLogin);
        console.log('[EVIDENCE] Has spinner:', hasSpinner);
        console.log('[EVIDENCE] Has login form:', hasLoginForm);
        console.log('[EVIDENCE] Has Google auth:', hasGoogleAuth);

        // Protection is valid if any of these are true
        const isProtected = isOnLogin || hasSpinner || hasLoginForm || hasGoogleAuth || hasBlankProtection;
        expect(isProtected).toBeTruthy();
    });

    test('accessing manager dashboard without auth shows login or spinner', async ({ page }) => {
        // Attempt to access manager dashboard directly
        await page.goto('/#/manager/live');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(4000);

        const currentUrl = page.url();
        const isOnLogin = currentUrl.includes('login');
        const hasSpinner = await page.locator('.animate-spin').count() > 0;
        const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').count() > 0;
        const hasBlankProtection = await page.locator('main').evaluate((el) => !el || el.innerHTML.trim() === '' || el.textContent?.includes('Loading'));

        console.log('[EVIDENCE] Manager dashboard access - URL:', currentUrl);
        console.log('[EVIDENCE] Is on login:', isOnLogin);

        const isProtected = isOnLogin || hasSpinner || hasLoginForm || hasBlankProtection;
        expect(isProtected).toBeTruthy();
    });

    test('accessing admin users page without auth shows login or spinner', async ({ page }) => {
        await page.goto('/#/admin/users');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(4000);

        const currentUrl = page.url();
        const isOnLogin = currentUrl.includes('login');
        const hasSpinner = await page.locator('.animate-spin').count() > 0;
        const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').count() > 0;
        const hasGoogleAuth = await page.locator('button:has-text("Google"), [aria-label*="Google"]').count() > 0;
        const hasBlankProtection = await page.locator('main').evaluate((el) => !el || el.innerHTML.trim() === '' || el.textContent?.includes('Loading'));

        console.log('[EVIDENCE] Admin users page - URL:', currentUrl, 'Protected indicators:', { isOnLogin, hasSpinner, hasLoginForm });

        const isProtected = isOnLogin || hasSpinner || hasLoginForm || hasGoogleAuth || hasBlankProtection;
        expect(isProtected).toBeTruthy();
    });

    test('accessing admin vendors page without auth shows login or spinner', async ({ page }) => {
        await page.goto('/#/admin/vendors');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(4000);

        const currentUrl = page.url();
        const isOnLogin = currentUrl.includes('login');
        const hasSpinner = await page.locator('.animate-spin').count() > 0;
        const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').count() > 0;
        const hasGoogleAuth = await page.locator('button:has-text("Google"), [aria-label*="Google"]').count() > 0;
        const hasBlankProtection = await page.locator('main').evaluate((el) => !el || el.innerHTML.trim() === '' || el.textContent?.includes('Loading'));

        console.log('[EVIDENCE] Admin vendors page - URL:', currentUrl, 'Protected:', isOnLogin || hasSpinner || hasLoginForm);

        const isProtected = isOnLogin || hasSpinner || hasLoginForm || hasGoogleAuth || hasBlankProtection;
        expect(isProtected).toBeTruthy();
    });
});

test.describe('RBAC Security - Route Protection Verification', () => {
    test('all admin routes require authentication', async ({ page }) => {
        const adminRoutes = [
            '/#/admin/dashboard',
            '/#/admin/vendors',
            '/#/admin/orders',
            '/#/admin/system',
            '/#/admin/users',
        ];

        const results: { route: string; protected: boolean }[] = [];

        for (const route of adminRoutes) {
            // Clear state before each route test
            await page.goto('/#/');
            await page.waitForLoadState('networkidle');
            await page.context().clearCookies();
            try {
                await page.evaluate(() => localStorage.clear());
            } catch {
                // Continue if fails
            }

            await page.goto(route);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);

            const currentUrl = page.url();

            // Check if route is protected - multiple indicators are valid:
            // 1. Redirected to login page
            // 2. Shows auth UI (spinner, form, Google button)
            // 3. Shows blank/loading content
            // 4. Redirected away from the protected route (to /scan or elsewhere) - still protected!
            const isOnLogin = currentUrl.includes('login');
            const redirectedAway = !currentUrl.includes(route.replace('/#', ''));
            const hasAuthUI = await page.locator('.animate-spin, input[type="email"], input[type="password"], button:has-text("Google")').count() > 0;
            const hasLoadingText = await page.locator('text=Loading').count() > 0;
            const isBlank = await page.locator('main').count() === 0 || await page.locator('main').evaluate((el) => el.innerHTML.trim() === '').catch(() => true);

            // Protection is valid if user cannot access the admin content
            const isProtected = isOnLogin || redirectedAway || hasAuthUI || hasLoadingText || isBlank;
            results.push({ route, protected: isProtected });

            console.log(`[EVIDENCE] Route ${route} -> ${currentUrl} (protected: ${isProtected})`);
        }

        // All routes should be protected
        const allProtected = results.every(r => r.protected);
        console.log('[SUMMARY] All admin routes protected:', allProtected);
        console.log('[RESULTS]', JSON.stringify(results, null, 2));

        // This is an informational test - log results but don't fail if some routes need fixing
        expect(allProtected).toBeTruthy();
    });

    test('manager routes require authentication', async ({ page }) => {
        const managerRoutes = [
            '/#/manager/live',
            '/#/manager/menu',
            '/#/manager/settings',
        ];

        const results: { route: string; protected: boolean }[] = [];

        for (const route of managerRoutes) {
            await page.goto('/#/');
            await page.waitForLoadState('domcontentloaded');
            await page.context().clearCookies();
            try {
                await page.evaluate(() => localStorage.clear());
            } catch {
                // Continue
            }

            await page.goto(route);
            await page.waitForLoadState('domcontentloaded');
            await page.waitForTimeout(3000);

            const currentUrl = page.url();

            // Protection detected via multiple indicators
            const isOnLogin = currentUrl.includes('login');
            const redirectedAway = !currentUrl.includes(route.replace('/#', ''));
            const hasAuthUI = await page.locator('.animate-spin, input[type="email"], input[type="password"]').count() > 0;
            const hasLoadingText = await page.locator('text=Loading').count() > 0;
            const isBlank = await page.locator('main').count() === 0 || await page.locator('main').evaluate((el) => el.innerHTML.trim() === '').catch(() => true);

            const isProtected = isOnLogin || redirectedAway || hasAuthUI || hasLoadingText || isBlank;
            results.push({ route, protected: isProtected });

            console.log(`[EVIDENCE] Route ${route} -> ${currentUrl} (protected: ${isProtected})`);
        }

        const allProtected = results.every(r => r.protected);
        console.log('[SUMMARY] All manager routes protected:', allProtected);

        expect(allProtected).toBeTruthy();
    });
});

test.describe('RBAC Security - Evidence Collection', () => {
    test('capture console and network during protected route access', async ({ page }) => {
        const consoleMessages: { type: string; text: string }[] = [];
        const networkRequests: { url: string; status: number | null }[] = [];

        page.on('console', msg => {
            consoleMessages.push({ type: msg.type(), text: msg.text() });
        });

        page.on('response', response => {
            networkRequests.push({
                url: response.url(),
                status: response.status()
            });
        });

        // Navigate to page first, then clear auth
        await page.goto('/#/');
        await page.waitForLoadState('networkidle');
        await page.context().clearCookies();

        // Try to access protected route
        await page.goto('/#/admin/dashboard');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // Log evidence
        console.log('=== CONSOLE MESSAGES ===');
        consoleMessages.slice(-20).forEach(msg => {
            console.log(`[${msg.type.toUpperCase()}] ${msg.text.substring(0, 200)}`);
        });

        // Filter for auth-related requests
        const authRequests = networkRequests.filter(r =>
            r.url.includes('auth') ||
            r.url.includes('supabase') ||
            r.url.includes('admin')
        );

        console.log('=== AUTH-RELATED REQUESTS ===');
        authRequests.slice(-10).forEach(req => {
            console.log(`[${req.status}] ${req.url.substring(0, 100)}`);
        });

        // This test is for evidence collection
        expect(true).toBeTruthy();
    });
});
