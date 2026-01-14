-- ==========================================
-- RLS POLICY AUDIT SCRIPT
-- Run this to verify RLS policies are correct
-- ==========================================

-- 1. Verify RLS is enabled on all required tables
SELECT 
    c.relname as table_name,
    c.relrowsecurity as rls_enabled,
    c.relforcerowsecurity as rls_forced,
    CASE 
        WHEN c.relrowsecurity THEN '✅ Enabled'
        ELSE '❌ DISABLED'
    END as status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relname IN (
        'admin_users',
        'vendors',
        'vendor_users',
        'menu_items',
        'tables',
        'orders',
        'order_items',
        'reservations',
        'profiles',
        'audit_logs'
    )
ORDER BY c.relname;

-- 2. List all policies with their definitions
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Check for tables without any policies (security risk!)
SELECT 
    c.relname as table_name,
    'No policies defined!' as warning
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relrowsecurity = true
    AND NOT EXISTS (
        SELECT 1 FROM pg_policies p 
        WHERE p.schemaname = 'public' 
        AND p.tablename = c.relname
    );

-- 4. Verify expected policies exist for each table
WITH expected_policies AS (
    SELECT 'admin_users' as tablename, 'admin_users_select' as policyname
    UNION ALL SELECT 'admin_users', 'admin_users_write'
    UNION ALL SELECT 'vendors', 'vendors_select'
    UNION ALL SELECT 'vendors', 'vendors_update'
    UNION ALL SELECT 'vendors', 'vendors_insert_admin_only'
    UNION ALL SELECT 'vendors', 'vendors_delete_admin_only'
    UNION ALL SELECT 'vendor_users', 'vendor_users_select'
    UNION ALL SELECT 'vendor_users', 'vendor_users_write'
    UNION ALL SELECT 'menu_items', 'menu_items_select'
    UNION ALL SELECT 'menu_items', 'menu_items_write'
    UNION ALL SELECT 'tables', 'tables_select'
    UNION ALL SELECT 'tables', 'tables_write'
    UNION ALL SELECT 'tables', 'tables_select_public_by_code'
    UNION ALL SELECT 'orders', 'orders_select'
    UNION ALL SELECT 'orders', 'orders_update_vendor'
    UNION ALL SELECT 'order_items', 'order_items_select'
    UNION ALL SELECT 'reservations', 'reservations_select'
    UNION ALL SELECT 'reservations', 'reservations_insert_client'
    UNION ALL SELECT 'reservations', 'reservations_update_vendor'
)
SELECT 
    e.tablename,
    e.policyname,
    CASE 
        WHEN p.policyname IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM expected_policies e
LEFT JOIN pg_policies p ON p.schemaname = 'public' 
    AND p.tablename = e.tablename 
    AND p.policyname = e.policyname
ORDER BY e.tablename, e.policyname;

-- 5. Check for anonymous access (important for public discovery)
SELECT 
    tablename,
    policyname,
    'Allows anonymous access' as note
FROM pg_policies
WHERE schemaname = 'public'
    AND (
        qual LIKE '%status = ''active''%'
        OR qual LIKE '%is_active = true%'
    )
ORDER BY tablename;
