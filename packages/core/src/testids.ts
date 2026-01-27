/**
 * @dinein/core - Centralized Test IDs
 * Single source of truth for all data-testid attributes used across apps.
 * 
 * NAMING CONVENTION:
 * - Format: {component}:{element}:{id?}
 * - Use lowercase with hyphens for components
 * - Use colons to separate hierarchy levels
 * - Dynamic IDs (like itemId) are appended with template literals
 * 
 * USAGE IN COMPONENTS:
 * ```tsx
 * import { TESTIDS } from '@dinein/core';
 * <div data-testid={TESTIDS.CUSTOMER.VENUE_MENU.PAGE}>...</div>
 * <button data-testid={TESTIDS.CUSTOMER.VENUE_MENU.ADD(itemId)}>+</button>
 * ```
 * 
 * USAGE IN TESTS:
 * ```ts
 * import { TESTIDS } from '@dinein/core';
 * await page.getByTestId(TESTIDS.CUSTOMER.VENUE_MENU.PAGE);
 * ```
 */

// =============================================================================
// CUSTOMER APP TEST IDS
// =============================================================================

export const CUSTOMER_TESTIDS = {
    // Venue Menu
    VENUE_MENU: {
        PAGE: 'venue-menu:page',
        ITEM_CARD: (id: string) => `venue-menu:item-card:${id}`,
        ADD: (id: string) => `venue-menu:add:${id}`,
        CATEGORY: (id: string) => `venue-menu:category:${id}`,
    },

    // Cart
    CART: {
        PILL: 'cart:pill',
        PAGE: 'cart:page',
        CHECKOUT: 'cart:checkout',
        ITEM: (id: string) => `cart:item:${id}`,
        QUANTITY_INCREASE: (id: string) => `cart:quantity-increase:${id}`,
        QUANTITY_DECREASE: (id: string) => `cart:quantity-decrease:${id}`,
        REMOVE: (id: string) => `cart:remove:${id}`,
    },

    // Checkout
    CHECKOUT: {
        PAGE: 'checkout:page',
        PAY_METHOD_CASH: 'checkout:pay-method:cash',
        PAY_METHOD_MOMO: 'checkout:pay-method:momo',
        PAY_METHOD_REVOLUT: 'checkout:pay-method:revolut',
        PLACE_ORDER: 'checkout:place-order',
        TABLE_INPUT: 'checkout:table-input',
    },

    // Order Status
    ORDER_STATUS: {
        PAGE: 'order-status:page',
        STATUS_PILL: 'order-status:status-pill',
        ORDER_ID: 'order-status:order-id',
        ITEMS_LIST: 'order-status:items-list',
    },

    // Navigation
    NAV: {
        HOME: 'nav:home',
        SETTINGS: 'nav:settings',
    },

    // Ring/Bell (Customer side)
    RING: {
        BUTTON: 'ring:button',
        CONFIRM: 'ring:confirm',
        SUCCESS: 'ring:success',
    },
} as const;

// =============================================================================
// VENUE (OWNER) APP TEST IDS
// =============================================================================

export const VENUE_TESTIDS = {
    // Login
    LOGIN: {
        PAGE: 'venue-login:page',
        EMAIL: 'venue-login:email',
        PIN: 'venue-login:pin',
        SUBMIT: 'venue-login:submit',
        ERROR: 'venue-login:error',
    },

    // Dashboard
    DASHBOARD: {
        PAGE: 'venue-dashboard:page',
        STATS: 'venue-dashboard:stats',
        QUICK_ACTIONS: 'venue-dashboard:quick-actions',
    },

    // Orders
    ORDERS: {
        PAGE: 'venue-orders:page',
        ORDER_CARD: (id: string) => `venue-orders:order-card:${id}`,
        MARK_RECEIVED: 'venue-order:mark-received',
        MARK_SERVED: 'venue-order:mark-served',
        CANCEL: 'venue-order:cancel',
        STATUS_BADGE: (id: string) => `venue-orders:status-badge:${id}`,
        EMPTY_STATE: 'venue-orders:empty-state',
    },

    // Bell/Ring
    BELL: {
        PAGE: 'venue-bell:page',
        CALL_CARD: (id: string) => `venue-bell:call-card:${id}`,
        ACK: (id: string) => `venue-bell:ack:${id}`,
        EMPTY_STATE: 'venue-bell:empty-state',
    },

    // Menu Management
    MENU: {
        PAGE: 'venue-menu:page',
        ADD_ITEM: 'venue-menu:add-item',
        EDIT_ITEM: (id: string) => `venue-menu:edit-item:${id}`,
        DELETE_ITEM: (id: string) => `venue-menu:delete-item:${id}`,
    },

    // Navigation
    NAV: {
        DASHBOARD: 'venue-nav:dashboard',
        ORDERS: 'venue-nav:orders',
        BELL: 'venue-nav:bell',
        MENU: 'venue-nav:menu',
        SETTINGS: 'venue-nav:settings',
    },
} as const;

// =============================================================================
// ADMIN APP TEST IDS
// =============================================================================

export const ADMIN_TESTIDS = {
    // Login
    LOGIN: {
        PAGE: 'admin-login:page',
        EMAIL: 'admin-login:email',
        PASSWORD: 'admin-login:password',
        SUBMIT: 'admin-login:submit',
        ERROR: 'admin-login:error',
    },

    // Claims
    CLAIMS: {
        PAGE: 'admin-claims:page',
        CLAIM_CARD: (id: string) => `admin-claims:claim-card:${id}`,
        APPROVE: 'admin-claim:approve',
        REJECT: 'admin-claim:reject',
        DETAILS: (id: string) => `admin-claim:details:${id}`,
        STATUS_BADGE: (id: string) => `admin-claims:status-badge:${id}`,
        EMPTY_STATE: 'admin-claims:empty-state',
    },

    // Venues
    VENUES: {
        PAGE: 'admin-venues:page',
        VENUE_CARD: (id: string) => `admin-venues:venue-card:${id}`,
        EDIT: (id: string) => `admin-venues:edit:${id}`,
    },

    // Logs (optional)
    LOGS: {
        PAGE: 'admin-logs:page',
    },

    // Navigation
    NAV: {
        DASHBOARD: 'admin-nav:dashboard',
        CLAIMS: 'admin-nav:claims',
        VENUES: 'admin-nav:venues',
        LOGS: 'admin-nav:logs',
    },
} as const;

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const TESTIDS = {
    CUSTOMER: CUSTOMER_TESTIDS,
    VENUE: VENUE_TESTIDS,
    ADMIN: ADMIN_TESTIDS,
} as const;

// Helper type for accessing test IDs
export type TestIdValue = string | ((id: string) => string);
