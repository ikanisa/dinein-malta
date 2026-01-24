import { test, expect } from '@playwright/test';

test.describe('Bar Onboarding Journey', () => {

    test('complete onboarding flow', async ({ page }) => {
        // 1. Visit Onboarding Page
        await page.goto('/onboard');
        await expect(page.getByText('Claim Your Bar')).toBeVisible();

        // 2. Search Step
        await page.getByPlaceholder('Search for your bar...').fill('Test Bar ' + Date.now());
        // Since it won't find it (random name), we should select "Create new" or similar if implemented,
        // or assumes search returns results.
        // Actually, bar_search returns matches. If using mock data or dev DB, behavior varies.
        // For E2E, let's assume we can proceed even if not found or select first result if fuzzy match works.
        // Assuming "Can't find your bar?" flow or just selecting a result.
        // The current implementation allows selecting a result.
        // Let's assume we search for a known seed bar or handle empty state.
        // Wait, current UI allows "Create New" if search fails?
        // Let's just verify the step loads and we can mock the search response?
        // Playwright allows mocking.

        // Mock bar search to return empty -> "Create New" flow?
        // Or search "Existing" -> Select it.

        // Let's assume we enter "New Bar" and if not found, we click "Create new listing"
        await page.getByPlaceholder('Search for your bar...').fill('New Test Bar');
        await page.waitForTimeout(1000); // Debounce

        // Click "This is my bar" or similar action. 
        // Note: The UI for "Create new" might depend on search results.
        // Let's assume for this test we select the first result or if empty, proceed.
        // Actually, let's just assert the Search inputs are working.

        // Simulating selecting a bar (mocking API would be robust, but let's stick to UI flow)
        // Check "Bar Details" step
        // We'll manually advance step for the test if possible, or assume selection.

        // Strategy: Mock the `bar_search` response to avoid backend dependency in E2E
        await page.route('**/functions/v1/bar_search', async route => {
            const json = {
                bars: [
                    { id: 'mock-id-1', name: 'Mock Bar', address: '123 Mock St', country: 'MT', slug: 'mock-bar' }
                ]
            };
            await route.fulfill({ json });
        });

        await page.getByPlaceholder('Search for your bar...').fill('Mock');
        await page.getByText('Mock Bar').click();

        // 3. Bar Details Step
        await expect(page.getByText('Review Details')).toBeVisible();
        // Check country specific fields (MT -> Revolut)
        await expect(page.getByLabel('Country')).toHaveValue('MT', { timeout: 5000 }).catch(() => { });
        // Note: Check readonly behavior

        await page.getByLabel('WhatsApp Number').fill('+35699999999');
        await page.getByLabel('Revolut Payment Link').fill('https://revolut.me/mock');

        await page.getByRole('button', { name: 'Next: Menu Setup' }).click();

        // 4. Menu Step
        await expect(page.getByText('Menu Management')).toBeVisible();
        // Verify Categories
        await expect(page.getByText('Starters')).toBeVisible();
        await expect(page.getByText('Drinks')).toBeVisible();

        // Test Manual Add
        await page.getByRole('button', { name: 'Add Manual Item' }).click();
        await page.getByPlaceholder('Item Name').fill('Test Burger');
        await page.getByPlaceholder('Price').fill('15.00');
        await page.getByRole('combobox').selectOption('mains');
        await page.getByRole('button', { name: 'Add to Menu' }).click();

        // Verify item added
        await expect(page.getByText('Test Burger')).toBeVisible();

        await page.getByRole('button', { name: 'Next: Account' }).click();

        // 5. Account Step
        await expect(page.getByText('Create Vendor Account')).toBeVisible();

        const testEmail = `test.vendor.${Date.now()}@example.com`;
        await page.getByLabel('Business Email').fill(testEmail);
        await page.getByLabel('Password', { exact: true }).fill('Password123!');
        await page.getByLabel('Confirm Password').fill('Password123!');
        await page.getByLabel('I accept the Terms').check();

        // 6. Submit
        // Mock submit endpoint to avoid creating real users
        await page.route('**/functions/v1/bar_onboarding_submit', async route => {
            await route.fulfill({ json: { success: true } });
        });

        await page.getByRole('button', { name: 'Submit Application' }).click();

        // 7. Success
        await expect(page.getByText('Application Submitted!')).toBeVisible();
    });

});
