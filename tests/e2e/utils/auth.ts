import { Page } from '@playwright/test';
import { USERS, ROUTES } from '../fixtures/testData';
import { VENUE, ADMIN } from '../fixtures/selectors';

/**
 * Authentication Helpers for E2E Tests
 * 
 * Provides login functions for venue owners and admins.
 */

// =============================================================================
// VENUE OWNER LOGIN
// =============================================================================

export interface VenueOwnerCredentials {
    email: string;
    pin: string;
}

/**
 * Log in as a venue owner in the Venue Portal.
 * 
 * @param page - Playwright page
 * @param credentials - Optional credentials, defaults to demo owner
 */
export async function loginAsVenueOwner(
    page: Page,
    credentials: VenueOwnerCredentials = USERS.VENUE_OWNER
): Promise<void> {
    // Navigate to login page if not already there
    if (!page.url().includes(ROUTES.VENUE.LOGIN)) {
        await page.goto(ROUTES.VENUE.LOGIN);
    }

    await page.waitForLoadState('networkidle');

    // Fill email
    const emailInput = page.getByTestId(VENUE.LOGIN.EMAIL);
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await emailInput.fill(credentials.email);
    } else {
        // Fallback to label-based selector
        await page.getByLabel('Email').fill(credentials.email);
    }

    // Fill PIN
    const pinInput = page.getByTestId(VENUE.LOGIN.PIN);
    if (await pinInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await pinInput.fill(credentials.pin);
    } else {
        // Fallback to label-based selector
        await page.getByLabel('Pin').fill(credentials.pin);
    }

    // Submit
    const submitButton = page.getByTestId(VENUE.LOGIN.SUBMIT);
    if (await submitButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await submitButton.click();
    } else {
        // Fallback to role-based selector
        await page.getByRole('button', { name: /sign in|login|submit/i }).click();
    }

    // Wait for navigation to dashboard
    await page.waitForURL(/dashboard/, { timeout: 10000 }).catch(() => {
        // May already be on dashboard, continue
    });
}

// =============================================================================
// ADMIN LOGIN
// =============================================================================

export interface AdminCredentials {
    email: string;
    password: string;
}

/**
 * Log in as an admin in the Admin Portal.
 * 
 * @param page - Playwright page
 * @param credentials - Optional credentials, defaults to demo admin
 */
export async function loginAsAdmin(
    page: Page,
    credentials: AdminCredentials = USERS.ADMIN
): Promise<void> {
    // Navigate to login page if not already there
    if (!page.url().includes(ROUTES.ADMIN.LOGIN)) {
        await page.goto(ROUTES.ADMIN.LOGIN);
    }

    await page.waitForLoadState('networkidle');

    // Fill email
    const emailInput = page.getByTestId(ADMIN.LOGIN.EMAIL);
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await emailInput.fill(credentials.email);
    } else {
        // Fallback to label-based selector
        await page.getByLabel('Email').fill(credentials.email);
    }

    // Fill password
    const passwordInput = page.getByTestId(ADMIN.LOGIN.PASSWORD);
    if (await passwordInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await passwordInput.fill(credentials.password);
    } else {
        // Fallback to label-based selector
        await page.getByLabel('Password').fill(credentials.password);
    }

    // Submit
    const submitButton = page.getByTestId(ADMIN.LOGIN.SUBMIT);
    if (await submitButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await submitButton.click();
    } else {
        // Fallback to role-based selector
        await page.getByRole('button', { name: /sign in|login|submit/i }).click();
    }

    // Wait for navigation to dashboard
    await page.waitForURL(/dashboard/, { timeout: 10000 }).catch(() => {
        // May already be on dashboard, continue
    });
}

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

/**
 * Check if the user is currently logged in.
 * 
 * @param page - Playwright page
 * @param appType - The app type to check
 */
export async function isLoggedIn(
    page: Page,
    appType: 'venue' | 'admin'
): Promise<boolean> {
    const dashboardUrl = appType === 'venue'
        ? ROUTES.VENUE.DASHBOARD
        : ROUTES.ADMIN.DASHBOARD;

    return page.url().includes(dashboardUrl);
}
