-- ==========================================
-- REMOVE MOCK/TEST DATA
-- ==========================================
-- WARNING: This script removes data! Run with caution.
-- Make sure you have a backup before executing.

-- First, preview what will be deleted (DRY RUN)
-- Comment out the DELETE statements to see what would be affected

-- 1. Preview test vendors to be removed
SELECT 
    id,
    name,
    status,
    created_at
FROM vendors 
WHERE name ILIKE '%test%'
   OR name ILIKE '%demo%'
   OR name ILIKE '%sample%'
   OR name ILIKE '%placeholder%'
   OR google_place_id ILIKE '%test%'
   OR google_place_id ILIKE '%demo%';

-- 2. Count associated data
SELECT 
    'menu_items' as table_name,
    count(*) as count_to_delete
FROM menu_items
WHERE vendor_id IN (
    SELECT id FROM vendors 
    WHERE name ILIKE '%test%'
       OR name ILIKE '%demo%'
       OR name ILIKE '%sample%'
       OR name ILIKE '%placeholder%'
       OR google_place_id ILIKE '%test%'
       OR google_place_id ILIKE '%demo%'
)
UNION ALL
SELECT 'orders', count(*)
FROM orders
WHERE vendor_id IN (
    SELECT id FROM vendors 
    WHERE name ILIKE '%test%' OR name ILIKE '%demo%' OR name ILIKE '%sample%' OR name ILIKE '%placeholder%'
)
UNION ALL
SELECT 'tables', count(*)
FROM tables
WHERE vendor_id IN (
    SELECT id FROM vendors 
    WHERE name ILIKE '%test%' OR name ILIKE '%demo%' OR name ILIKE '%sample%' OR name ILIKE '%placeholder%'
)
UNION ALL
SELECT 'reservations', count(*)
FROM reservations
WHERE vendor_id IN (
    SELECT id FROM vendors 
    WHERE name ILIKE '%test%' OR name ILIKE '%demo%' OR name ILIKE '%sample%' OR name ILIKE '%placeholder%'
)
UNION ALL
SELECT 'vendor_users', count(*)
FROM vendor_users
WHERE vendor_id IN (
    SELECT id FROM vendors 
    WHERE name ILIKE '%test%' OR name ILIKE '%demo%' OR name ILIKE '%sample%' OR name ILIKE '%placeholder%'
);

-- ==========================================
-- ACTUAL DELETION (UNCOMMENT TO EXECUTE)
-- ==========================================

-- Start transaction for safety
-- BEGIN;

-- Delete in correct order (respecting foreign keys)
-- Note: CASCADE should handle most of this, but being explicit

-- Delete order items for test orders
-- DELETE FROM order_items
-- WHERE order_id IN (
--     SELECT id FROM orders WHERE vendor_id IN (
--         SELECT id FROM vendors 
--         WHERE name ILIKE '%test%' OR name ILIKE '%demo%' OR name ILIKE '%sample%' OR name ILIKE '%placeholder%'
--     )
-- );

-- Delete test orders
-- DELETE FROM orders
-- WHERE vendor_id IN (
--     SELECT id FROM vendors 
--     WHERE name ILIKE '%test%' OR name ILIKE '%demo%' OR name ILIKE '%sample%' OR name ILIKE '%placeholder%'
-- );

-- Delete test reservations
-- DELETE FROM reservations
-- WHERE vendor_id IN (
--     SELECT id FROM vendors 
--     WHERE name ILIKE '%test%' OR name ILIKE '%demo%' OR name ILIKE '%sample%' OR name ILIKE '%placeholder%'
-- );

-- Delete test tables
-- DELETE FROM tables
-- WHERE vendor_id IN (
--     SELECT id FROM vendors 
--     WHERE name ILIKE '%test%' OR name ILIKE '%demo%' OR name ILIKE '%sample%' OR name ILIKE '%placeholder%'
-- );

-- Delete test menu items
-- DELETE FROM menu_items
-- WHERE vendor_id IN (
--     SELECT id FROM vendors 
--     WHERE name ILIKE '%test%' OR name ILIKE '%demo%' OR name ILIKE '%sample%' OR name ILIKE '%placeholder%'
-- );

-- Delete test vendor users
-- DELETE FROM vendor_users
-- WHERE vendor_id IN (
--     SELECT id FROM vendors 
--     WHERE name ILIKE '%test%' OR name ILIKE '%demo%' OR name ILIKE '%sample%' OR name ILIKE '%placeholder%'
-- );

-- Finally, delete test vendors
-- DELETE FROM vendors 
-- WHERE name ILIKE '%test%'
--    OR name ILIKE '%demo%'
--    OR name ILIKE '%sample%'
--    OR name ILIKE '%placeholder%'
--    OR google_place_id ILIKE '%test%'
--    OR google_place_id ILIKE '%demo%';

-- COMMIT;

-- Vacuum to reclaim space (run separately after commit)
-- VACUUM ANALYZE vendors;
-- VACUUM ANALYZE menu_items;
-- VACUUM ANALYZE orders;
-- VACUUM ANALYZE order_items;
-- VACUUM ANALYZE tables;
-- VACUUM ANALYZE reservations;
-- VACUUM ANALYZE vendor_users;
