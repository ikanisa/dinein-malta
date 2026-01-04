-- SQL queries to check DB error for getAllVenues
-- Run these in Supabase SQL Editor to diagnose the issue

-- 1. Check if vendors table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'vendors'
);

-- 2. Check RLS policies on vendors table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'vendors';

-- 3. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'vendors';

-- 4. Check current user and role
SELECT 
  current_user as current_user_name,
  session_user as session_user_name,
  current_setting('role') as current_role;

-- 5. Try to select from vendors table (as service role)
-- This should work if the table exists
SELECT COUNT(*) as vendor_count FROM public.vendors;

-- 6. Check if there are any vendors with status 'active'
SELECT COUNT(*) as active_vendor_count 
FROM public.vendors 
WHERE status = 'active';

-- 7. List all vendors (if accessible)
SELECT id, name, status, created_at 
FROM public.vendors 
LIMIT 10;

-- 8. Check grants on vendors table
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
AND table_name = 'vendors';

