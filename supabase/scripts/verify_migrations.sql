-- ==========================================
-- MIGRATION VERIFICATION SCRIPT
-- Run this to verify all migrations are applied
-- ==========================================

-- 1. Check migration history
SELECT 
    version,
    name,
    executed_at
FROM supabase_migrations.schema_migrations
ORDER BY version DESC;

-- 2. Verify core tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 3. Check RLS enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. List all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Verify enums exist
SELECT 
    t.typname as enum_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
GROUP BY t.typname
ORDER BY t.typname;

-- 6. Verify helper functions exist
SELECT 
    proname as function_name,
    provolatile as volatility,
    prosecdef as security_definer
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND proname IN (
        'is_admin',
        'is_vendor_member', 
        'vendor_role_for',
        'can_edit_vendor_profile',
        'can_manage_vendor_ops',
        'set_updated_at',
        'validate_order_status_transition',
        'enforce_order_status_transition'
    )
ORDER BY proname;

-- 7. Verify indexes exist
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 8. Check table row counts (for sanity)
SELECT 'admin_users' as table_name, count(*) as row_count FROM admin_users
UNION ALL
SELECT 'vendors', count(*) FROM vendors
UNION ALL
SELECT 'vendor_users', count(*) FROM vendor_users
UNION ALL
SELECT 'menu_items', count(*) FROM menu_items
UNION ALL
SELECT 'tables', count(*) FROM tables
UNION ALL
SELECT 'orders', count(*) FROM orders
UNION ALL
SELECT 'order_items', count(*) FROM order_items
UNION ALL
SELECT 'reservations', count(*) FROM reservations;
