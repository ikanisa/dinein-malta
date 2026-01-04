-- Verification queries for Phase 1 migrations
-- Run these in Supabase SQL Editor to verify everything is correct

-- 1. Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'audit_logs')
ORDER BY table_name;

-- 2. Verify indexes created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('profiles', 'audit_logs')
ORDER BY tablename, indexname;

-- 3. Verify RLS policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('profiles', 'audit_logs')
ORDER BY tablename, policyname;

-- 4. Verify triggers
SELECT tgname, tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname IN ('trg_profiles_updated_at')
ORDER BY tgname;

-- 5. Check table structure (profiles)
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 6. Check table structure (audit_logs)
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'audit_logs'
ORDER BY ordinal_position;

