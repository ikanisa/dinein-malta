-- Performance Indexes for Optimized Queries
-- These indexes significantly improve query performance for common operations

-- 1. Vendors table indexes
-- Index for active vendors (most common query)
-- Note: Partial index for active status (more efficient than full index)
CREATE INDEX IF NOT EXISTS idx_vendors_status_active 
ON public.vendors(status) 
WHERE status = 'active';

-- Composite index for location-based queries (with active filter)
CREATE INDEX IF NOT EXISTS idx_vendors_status_location 
ON public.vendors(status, lat, lng) 
WHERE status = 'active' AND lat IS NOT NULL AND lng IS NOT NULL;

-- Index for Google Place ID lookups
CREATE INDEX IF NOT EXISTS idx_vendors_google_place_id 
ON public.vendors(google_place_id) 
WHERE google_place_id IS NOT NULL;

-- 2. Menu items table indexes
-- Composite index for vendor menu queries (most common)
CREATE INDEX IF NOT EXISTS idx_menu_items_vendor_available 
ON public.menu_items(vendor_id, is_available, category) 
WHERE is_available = true;

-- Index for vendor menu queries (for admin/vendor dashboards)
CREATE INDEX IF NOT EXISTS idx_menu_items_vendor_id 
ON public.menu_items(vendor_id);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_menu_items_category 
ON public.menu_items(category) 
WHERE is_available = true;

-- 3. Orders table indexes
-- Composite index for vendor order queries (most common)
CREATE INDEX IF NOT EXISTS idx_orders_vendor_status_created 
ON public.orders(vendor_id, status, created_at DESC);

-- Index for order code lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_code 
ON public.orders(order_code);

-- Index for table-based order queries
CREATE INDEX IF NOT EXISTS idx_orders_table_id 
ON public.orders(table_id) 
WHERE table_id IS NOT NULL;

-- 4. Tables table indexes
-- Composite index for vendor table queries
CREATE INDEX IF NOT EXISTS idx_tables_vendor_active 
ON public.tables(vendor_id, is_active);

-- Index for table code lookups (QR code scanning)
CREATE INDEX IF NOT EXISTS idx_tables_public_code 
ON public.tables(public_code) 
WHERE is_active = true;

-- 5. Reservations table indexes
-- Composite index for vendor reservation queries
CREATE INDEX IF NOT EXISTS idx_reservations_vendor_status_datetime 
ON public.reservations(vendor_id, status, datetime DESC);

-- Index for client reservation queries
CREATE INDEX IF NOT EXISTS idx_reservations_client_status 
ON public.reservations(client_auth_user_id, status) 
WHERE client_auth_user_id IS NOT NULL;

-- 6. Vendor users table indexes
-- Index for user membership lookups (already exists in base schema, but adding for completeness)
-- Note: idx_vendor_users_auth_user_id already exists in base schema

-- Index for vendor membership queries
CREATE INDEX IF NOT EXISTS idx_vendor_users_vendor_id 
ON public.vendor_users(vendor_id);

-- 7. Profiles table indexes
-- Index for user profile lookups (already exists in base schema, but adding for completeness)
-- Note: idx_profiles_id already exists in base schema

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON public.profiles(role);

-- 8. Admin users table indexes
-- Index for admin user lookups by auth_user_id and active status
CREATE INDEX IF NOT EXISTS idx_admin_users_auth_user_active 
ON public.admin_users(auth_user_id, is_active) 
WHERE is_active = true;

-- 9. Audit logs table indexes
-- Index for time-based audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
ON public.audit_logs(created_at DESC);

-- Index for action-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
ON public.audit_logs(action);

-- Note: These indexes are optimized for the most common query patterns
-- They significantly improve query performance, especially for:
-- - Venue discovery (active vendors with location)
-- - Menu loading (vendor menu items by availability)
-- - Order management (vendor orders by status and date)
-- - Table management (vendor tables by active status)
-- - Reservation management (vendor reservations by status and date)

