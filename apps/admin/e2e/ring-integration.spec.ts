import { test, expect } from '@playwright/test';

test.describe('Ring Waiter Integration', () => {
    test('Customer ring appears on vendor dashboard', async ({ browser }) => {
        // 1. Setup Vendor Context
        const vendorContext = await browser.newContext();
        const vendorPage = await vendorContext.newPage();

        // Go to vendor portal
        await vendorPage.goto('/vendor');
        await vendorPage.waitForLoadState('networkidle');

        // Ensure vendor dashboard is loaded (look for main heading or stats)
        await expect(vendorPage.getByText('Quick Actions')).toBeVisible();

        // 2. Setup Customer Context
        const customerContext = await browser.newContext();
        const customerPage = await customerContext.newPage();

        await customerPage.goto('/');
        await customerPage.waitForLoadState('networkidle');

        // 3. Customer Actions: Ring the waiter
        // Generate a unique table number to avoid collision
        const tableNum = Math.floor(Math.random() * 900) + 100; // 100-999

        const ringBtn = customerPage.getByText('Ring Waiter', { exact: false });
        await ringBtn.click();
        await customerPage.waitForTimeout(1000); // Wait for modal animation

        // Fill table number
        await customerPage.locator('input[type="number"]').fill(tableNum.toString());

        // Click Continue
        const continueBtn = customerPage.getByRole('button', { name: 'Continue', exact: true });
        await continueBtn.dispatchEvent('click');
        await customerPage.waitForTimeout(500);

        // Select 'Ready to Order'
        await customerPage.getByText('Ready to Order').click({ force: true });

        // wait for success message
        await expect(customerPage.getByText('Waiter Notified')).toBeVisible();

        // 4. Vendor Verification
        // Switch back to vendor page and wait for the alert overlay or dashboard item

        // Check for the Overlay
        // The overlay has the table number in big text
        await expect(vendorPage.locator(`text=${tableNum}`)).toBeVisible();
        await expect(vendorPage.getByText('Ready to Order')).toBeVisible();

        // Take screenshot of the alert
        await vendorPage.screenshot({ path: `test-results/ring-integration-01-alert-${tableNum}.png` });

        // Acknowledge the ring (click Acknowledge button on overlay)
        await vendorPage.getByRole('button', { name: 'Acknowledge' }).click();

        // Overlay should disappear
        await expect(vendorPage.locator(`text=${tableNum}`)).not.toBeVisible({ timeout: 5000 });

        // Should appear in "Active Rings" list on dashboard
        // Note: The structure is "Table {tableNum}"
        await expect(vendorPage.getByText(`Table ${tableNum}`)).toBeVisible();

        // 5. Vendor Resolution
        // Find the "Done" button for this specific ring. 
        // It might be tricky if there are multiple. We'll look for the row containing our table number.
        const ringRow = vendorPage.locator('div').filter({ hasText: `Table ${tableNum}` }).first();
        const doneBtn = ringRow.getByRole('button', { name: 'Done' });

        await doneBtn.click();

        // Should be removed from the list
        await expect(vendorPage.getByText(`Table ${tableNum}`)).not.toBeVisible();

        // Close contexts
        await customerContext.close();
        await vendorContext.close();
    });
});
