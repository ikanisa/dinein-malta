# Phase 1: Create Missing Database Tables - Instructions

## ✅ Migration Files Created

1. **`supabase/migrations/20250116000003_create_profiles_table.sql`** - Profiles table migration
2. **`supabase/migrations/20250116000004_create_audit_logs_table.sql`** - Audit logs table migration
3. **`supabase/apply_phase1_migrations.sql`** - Consolidated migration (easiest to apply)

## 🚀 Quick Apply (Recommended)

### Option 1: Apply Consolidated Migration (Easiest)

1. **Go to Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/elhlcdiosomutugpneoc/sql

2. **Open the consolidated migration file:**
   - File: `supabase/apply_phase1_migrations.sql`
   - Copy the entire contents

3. **Paste into SQL Editor and Run:**
   - Paste the SQL into the SQL Editor
   - Click **Run** or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows/Linux)
   - Wait for execution to complete (should take < 5 seconds)

4. **Verify Success:**
   - You should see "Success. No rows returned" or similar success message
   - No errors should appear

### Option 2: Apply Individual Migrations

If you prefer to apply migrations separately:

1. **Apply profiles table:**
   - Copy contents of `supabase/migrations/20250116000003_create_profiles_table.sql`
   - Paste and run in Supabase SQL Editor

2. **Apply audit_logs table:**
   - Copy contents of `supabase/migrations/20250116000004_create_audit_logs_table.sql`
   - Paste and run in Supabase SQL Editor

## ✅ Verification Steps

After applying migrations, verify they worked:

### 1. Check Tables Exist

```sql
-- Run in SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'audit_logs')
ORDER BY table_name;
```

**Expected Result:**
```
profiles
audit_logs
```

### 2. Check Indexes Created

```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('profiles', 'audit_logs')
ORDER BY tablename, indexname;
```

**Expected Result:** Should show multiple indexes for each table

### 3. Check RLS Policies

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('profiles', 'audit_logs')
ORDER BY tablename, policyname;
```

**Expected Result:**
- `profiles`: `profiles_insert_own`, `profiles_select_own`, `profiles_update_own`
- `audit_logs`: `audit_logs_admin_select`, `audit_logs_service_insert`

### 4. Test Profile Creation (Optional)

```sql
-- This should work if you're authenticated
-- Note: You'll need to be logged in as a user
INSERT INTO public.profiles (id, name, role) 
VALUES (auth.uid(), 'Test User', 'CLIENT')
ON CONFLICT (id) DO NOTHING;
```

## 🔍 What Was Created

### Profiles Table
- **Purpose:** Stores user profile information
- **Key Fields:**
  - `id` - Links to `auth.users(id)`
  - `name` - User's display name
  - `role` - User role (CLIENT, VENDOR, ADMIN)
  - `favorites` - Array of favorited venue IDs
  - `notifications_enabled` - Notification preference
- **RLS:** Users can only read/update their own profile

### Audit Logs Table
- **Purpose:** Stores administrative actions for audit trail
- **Key Fields:**
  - `actor_auth_user_id` - Who performed the action
  - `action` - What action was performed
  - `entity_type` - Type of entity affected
  - `entity_id` - ID of affected entity
  - `metadata_json` - Additional context
- **RLS:** Only admins can read audit logs

## ⚠️ Troubleshooting

### Error: "function auth.uid() does not exist"
- **Cause:** Supabase Auth extension not enabled
- **Fix:** This shouldn't happen, but if it does, contact Supabase support

### Error: "relation already exists"
- **Cause:** Table already exists from previous migration
- **Fix:** This is fine - the `CREATE TABLE IF NOT EXISTS` will skip creation
- **Action:** Migration is safe to re-run

### Error: "permission denied"
- **Cause:** Using wrong database user
- **Fix:** Ensure you're using the SQL Editor in Supabase Dashboard (uses service role)

### Error: "trigger function does not exist"
- **Cause:** `set_updated_at()` function doesn't exist
- **Fix:** This should exist from the base schema migration
- **Check:** Run `SELECT proname FROM pg_proc WHERE proname = 'set_updated_at';`
- **Action:** If missing, it's created in `20251216131852_dinein_v1_schema.sql`

## ✅ Next Steps After Migration

Once migrations are applied successfully:

1. ✅ **Update Frontend Code** (Phase 1, Tasks 1.3 & 1.4)
   - Fix menu management functions
   - Fix reservation schema mismatch

2. ✅ **Test Profile System**
   - User can create profile
   - User can update profile
   - Profile is linked to auth user

3. ✅ **Test Audit Logging**
   - Admin actions log to audit_logs
   - Admins can view audit logs

## 📝 Notes

- These migrations are **idempotent** (safe to run multiple times)
- Tables use `IF NOT EXISTS` to prevent errors on re-run
- RLS policies use `DROP POLICY IF EXISTS` for safety
- All migrations are backward compatible

---

**Migration Status:** Ready to Apply  
**Estimated Time:** 2-3 minutes  
**Risk Level:** Low (idempotent migrations)

