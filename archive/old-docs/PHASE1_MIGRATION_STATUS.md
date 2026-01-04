# Phase 1 Migration Status

## ✅ Migration Files Created

1. ✅ `supabase/migrations/20250116000003_create_profiles_table.sql`
2. ✅ `supabase/migrations/20250116000004_create_audit_logs_table.sql`
3. ✅ `supabase/apply_phase1_migrations.sql` (consolidated)

## ⚠️ Migration Application Status

**Current Status:** Ready to apply, but requires manual step via Dashboard

**Reason:** Supabase's security model prevents programmatic DDL execution via REST API or Management API. This is by design to protect production databases.

## 🚀 How to Apply

### Option 1: Supabase Dashboard SQL Editor (Recommended - 2 minutes)

1. **Open SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/elhlcdiosomutugpneoc/sql

2. **Copy SQL:**
   - Open file: `supabase/apply_phase1_migrations.sql`
   - Copy all contents (or use helper script: `./apply_phase1_helper.sh`)

3. **Paste and Execute:**
   - Paste into SQL Editor
   - Click **Run** button or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows/Linux)
   - Wait for execution (should complete in < 5 seconds)

4. **Verify:**
   - Check for success message
   - Run verification queries (see below)

### Option 2: Supabase CLI (If migration history is fixed)

Currently blocked due to migration history mismatch. Would require:
1. Repairing migration history
2. Syncing local and remote migrations
3. Then using `supabase db push`

## ✅ Verification Queries

After applying, run these to verify:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'audit_logs');

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('profiles', 'audit_logs')
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('profiles', 'audit_logs')
ORDER BY tablename, policyname;
```

## 📋 What Gets Created

### Profiles Table
- Stores user profile information
- Links to `auth.users(id)`
- Fields: name, role, favorites, notifications_enabled
- RLS: Users can only access their own profile

### Audit Logs Table
- Stores administrative actions
- Fields: actor, action, entity_type, entity_id, metadata
- RLS: Only admins can read
- Service role can insert (for Edge Functions)

## 🔄 Next Steps After Migration

Once migrations are applied:

1. ✅ **Verify tables exist** (use verification queries above)
2. ✅ **Proceed to Phase 1, Task 1.3** (Fix menu management)
3. ✅ **Proceed to Phase 1, Task 1.4** (Fix reservation schema)

## 📝 Notes

- Migrations are **idempotent** (safe to run multiple times)
- Uses `IF NOT EXISTS` to prevent errors on re-run
- All policies use `DROP POLICY IF EXISTS` for safety
- Migrations are backward compatible

---

**Status:** ⏳ Waiting for manual application via Dashboard  
**Estimated Time to Apply:** 2-3 minutes  
**Risk Level:** Low (idempotent migrations)

