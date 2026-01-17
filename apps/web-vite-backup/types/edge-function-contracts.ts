/**
 * TypeScript Contract Definitions for DineIn Edge Functions
 * These types define the API contracts between frontend and backend.
 */

// =============================================================================
// COMMON TYPES
// =============================================================================

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
    success: boolean;
    requestId: string;
    data?: T;
    error?: string;
    details?: unknown;
}

/** Order status values */
export type OrderStatus = "received" | "served" | "cancelled";

/** Payment status values */
export type PaymentStatus = "unpaid" | "paid";

/** Vendor status values */
export type VendorStatus = "pending" | "active" | "suspended";

// =============================================================================
// ORDER_CREATE
// =============================================================================

/** Single item in an order */
export interface OrderItemInput {
    menu_item_id: string; // UUID
    qty: number;
    modifiers_json?: unknown;
}

/** Request body for order_create */
export interface OrderCreateRequest {
    vendor_id: string; // UUID
    table_public_code: string;
    items: OrderItemInput[];
    notes?: string;
}

/** Order item as returned from the API */
export interface OrderItemResponse {
    id: string;
    order_id: string;
    name_snapshot: string;
    price_snapshot: number;
    qty: number;
    modifiers_json?: unknown;
}

/** Created order response */
export interface OrderResponse {
    id: string;
    vendor_id: string;
    table_id: string;
    client_auth_user_id: string;
    order_code: string;
    status: OrderStatus;
    payment_status: PaymentStatus;
    total_amount: number;
    currency: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    items: OrderItemResponse[];
}

/** Response from order_create */
export interface OrderCreateResponse extends ApiResponse<never> {
    order: OrderResponse;
}

// =============================================================================
// ORDER_UPDATE_STATUS
// =============================================================================

/** Request body for order_update_status */
export interface OrderUpdateStatusRequest {
    order_id: string; // UUID
    status: "served" | "cancelled";
}

/** Response from order_update_status */
export interface OrderUpdateStatusResponse extends ApiResponse<never> {
    order: Omit<OrderResponse, "items">;
}

// =============================================================================
// ORDER_MARK_PAID
// =============================================================================

/** Request body for order_mark_paid */
export interface OrderMarkPaidRequest {
    order_id: string; // UUID
}

/** Response from order_mark_paid */
export interface OrderMarkPaidResponse extends ApiResponse<never> {
    order?: Omit<OrderResponse, "items">;
    order_id?: string; // When idempotent
    message?: string;
    idempotent?: boolean;
}

// =============================================================================
// VENDOR_CLAIM
// =============================================================================

/** Request body for vendor_claim (admin-only) */
export interface VendorClaimRequest {
    google_place_id: string;
    name: string;
    slug?: string | null;
    address?: string | null;
    lat?: number | null;
    lng?: number | null;
    hours_json?: unknown;
    photos_json?: unknown;
    website?: string | null;
    phone?: string | null;
    revolut_link?: string | null;
    whatsapp?: string | null;
}

/** Vendor user membership */
export interface VendorMembership {
    id: string;
    vendor_id: string;
    auth_user_id: string;
    role: "owner" | "staff";
    is_active: boolean;
}

/** Created vendor response */
export interface VendorResponse {
    id: string;
    google_place_id: string;
    slug: string;
    name: string;
    address?: string;
    lat?: number;
    lng?: number;
    hours_json?: unknown;
    photos_json?: unknown;
    website?: string;
    phone?: string;
    revolut_link?: string;
    whatsapp?: string;
    status: VendorStatus;
    country: string;
    created_at: string;
    updated_at: string;
    membership?: VendorMembership;
}

/** Response from vendor_claim */
export interface VendorClaimResponse extends ApiResponse<never> {
    vendor: VendorResponse;
}

// =============================================================================
// TABLES_GENERATE
// =============================================================================

/** Request body for tables_generate */
export interface TablesGenerateRequest {
    vendor_id: string; // UUID
    count?: number;
    table_numbers?: number[];
    start_number?: number;
}

/** Table as returned from the API */
export interface TableResponse {
    id: string;
    vendor_id: string;
    table_number: number;
    label: string;
    public_code: string;
    is_active: boolean;
    created_at: string;
}

/** Response from tables_generate */
export interface TablesGenerateResponse extends ApiResponse<never> {
    tables: TableResponse[];
    count: number;
}

// =============================================================================
// ERROR RESPONSES
// =============================================================================

/** Standard error response */
export interface ErrorResponse {
    error: string;
    details?: unknown;
}

/** Rate limit error */
export interface RateLimitError extends ErrorResponse {
    error: "Too many requests";
}

/** Validation error details */
export interface ValidationErrorDetails {
    code: string;
    message: string;
    path: (string | number)[];
}

/** Validation error response */
export interface ValidationError extends ErrorResponse {
    error: "Invalid request data";
    details: ValidationErrorDetails[];
}
