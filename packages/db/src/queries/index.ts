/**
 * Query helpers index
 * Re-exports all typed query functions for use by apps
 */

// Venue queries
export {
    getVenueBySlug,
    getCategories,
    getMenuItems,
    getFullMenu,
    getVenuesForCountry,
    type PaginatedResult,
} from './venue';

// Order queries (customer-facing)
export {
    createOrder,
    getOrder,
    getRecentOrders,
    subscribeToOrder,
    type CreateOrderPayload,
} from './order';

// Venue orders queries (vendor-facing)
export {
    getActiveOrders,
    getServedOrders,
    updateOrderStatus,
    subscribeToVenueOrders,
    type OrderWithItems,
} from './venue-orders';

// Service requests (bell/waiter calls)
export {
    getPendingServiceRequests,
    resolveServiceRequest,
    createServiceRequest,
    subscribeToServiceRequests,
} from './service-requests';

// Claims (uses venues.claimed column)
export {
    getUnclaimedVenues,
    getClaimedVenues,
    claimVenue,
    unclaimVenue,
    // Legacy aliases
    getPendingClaims,
    getClaims,
    approveClaim,
    rejectClaim,
    type ClaimApprovalResult,
} from './claims';

// Ingest (OCR pipeline)
export {
    createIngestJob,
    getIngestJobs,
    getIngestJob,
    updateIngestJobStatus,
    getStagingItems,
    createStagingItems,
    updateStagingItemAction,
    publishApprovedItems,
    type StagingItemForReview,
} from './ingest';

// Venue management
export {
    updateVenue,
    type UpdateVenueInput,
} from './venue-update';
