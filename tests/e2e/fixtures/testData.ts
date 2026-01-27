/**
 * E2E Test Data - Connected to Real Supabase
 * 
 * Uses actual venue slugs from your Supabase database.
 * Configure via environment variables or use defaults.
 * 
 * IMPORTANT: Tests run against REAL data. Use staging/development
 * environments, not production.
 */

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

/**
 * Get venue slug from environment or use default.
 * Set E2E_VENUE_SLUG in your .env.local for custom venue.
 */
const getVenueSlug = (): string => {
    // Check for env override first
    if (typeof process !== 'undefined' && process.env?.E2E_VENUE_SLUG) {
        return process.env.E2E_VENUE_SLUG;
    }
    // Default: Use first active venue from your database
    // Update this to match an actual venue slug in your Supabase
    return 'venue-slug-from-database';
};

// =============================================================================
// VENUE DATA (for testing)
// =============================================================================

/**
 * Test venues - update these slugs to match your actual Supabase data
 * 
 * To find venue slugs, run:
 * SELECT slug, name, country FROM vendors WHERE status = 'active' LIMIT 5;
 */
export const VENUES = {
    /** Primary test venue - update slug to match your DB */
    PRIMARY: {
        slug: getVenueSlug(),
        name: 'Test Venue', // Will be validated dynamically
        country: 'MT' as const,
    },

    /** Alternative venue for multi-venue tests */
    SECONDARY: {
        slug: 'secondary-venue', // Update to actual slug
        name: 'Secondary Venue',
        country: 'MT' as const,
    },

    // Aliases for backward compatibility with specs
    /** @deprecated Use PRIMARY instead */
    get RW_DEMO() { return this.PRIMARY; },
    /** @deprecated Use SECONDARY instead */
    get MT_DEMO() { return this.SECONDARY; },
} as const;

// =============================================================================
// USER CREDENTIALS
// =============================================================================

/**
 * Venue owner credentials for venue portal tests.
 * 
 * IMPORTANT: These should match actual owner credentials in your database.
 * For local testing, you may need to create a test vendor_user entry.
 */
export const USERS = {
    /** Venue owner - must exist in vendor_users table */
    VENUE_OWNER: {
        email: process.env.E2E_VENUE_OWNER_EMAIL || 'owner@venue.test',
        pin: process.env.E2E_VENUE_OWNER_PIN || '1234',
    },

    /** Admin - must exist in admin_users table */
    ADMIN: {
        email: process.env.E2E_ADMIN_EMAIL || 'admin@dinein.test',
        password: process.env.E2E_ADMIN_PASSWORD || 'admin_password',
    },
} as const;

// =============================================================================
// ORDER STATUSES (per STARTER RULES)
// =============================================================================

export const ORDER_STATUSES = {
    RECEIVED: 'received',
    SERVED: 'served',
    CANCELLED: 'cancelled',
} as const;

// =============================================================================
// PAYMENT METHODS (per STARTER RULES)
// =============================================================================

export const PAYMENT_METHODS = {
    CASH: 'cash',
    MOMO: 'momo',
    REVOLUT: 'revolut',
} as const;

// =============================================================================
// ROUTES
// =============================================================================

export const ROUTES = {
    CUSTOMER: {
        HOME: '/',
        VENUE: (slug: string) => `/v/${slug}`,
        VENUE_WITH_TABLE: (slug: string, table: number) => `/v/${slug}?t=${table}`,
        CART: (slug: string) => `/v/${slug}/cart`,
        CHECKOUT: (slug: string) => `/v/${slug}/checkout`,
        ORDER_STATUS: (orderId: string) => `/orders/${orderId}`,
    },
    VENUE: {
        LOGIN: '/',
        DASHBOARD: '/dashboard',
        ORDERS: '/dashboard/orders',
        BELL: '/dashboard/bell',
        MENU: '/dashboard/menu',
        SETTINGS: '/dashboard/settings',
    },
    ADMIN: {
        LOGIN: '/',
        DASHBOARD: '/dashboard',
        CLAIMS: '/claims',
        VENUES: '/venues',
        LOGS: '/logs',
    },
} as const;

// =============================================================================
// CLAIMS (for admin tests - uses real pending claims if available)
// =============================================================================

export const CLAIMS = {
    /** Pending claim - set via env or leave for dynamic lookup */
    PENDING: {
        id: process.env.E2E_PENDING_CLAIM_ID || '',
        venueSlug: process.env.E2E_CLAIM_VENUE_SLUG || '',
        claimantEmail: process.env.E2E_CLAIMANT_EMAIL || '',
    },
} as const;
