# 📊 Database Migrations to Apply

## Which Migrations to Apply

Based on your current setup, here are the **essential migrations** you should apply:

### ✅ **Priority 1: Storage Bucket for Gemini Images** (CRITICAL)

**File:** `supabase/migrations/20250116000005_create_venue_images_storage.sql`

**Why:** This creates the `venue-images` storage bucket needed for caching Gemini-generated venue and menu item images. Without this, image generation won't work properly.

**What it does:**
- Creates `venue-images` storage bucket
- Sets up RLS policies for public read, authenticated upload/update
- Allows service role to delete old images (for weekly rotation)

---

### ✅ **Priority 2: Profiles & Audit Logs Tables**

**File:** `supabase/apply_phase1_migrations.sql` (consolidated version)

**Why:** Creates essential tables for user profiles and audit logging.

**What it does:**
- Creates `profiles` table for user profile data
- Creates `audit_logs` table for system audit trails
- Sets up RLS policies and indexes

**Note:** This file combines `20250116000003_create_profiles_table.sql` and `20250116000004_create_audit_logs_table.sql` into one file.

---

### ✅ **Priority 3: Production Constraints & Indexes**

**File:** `supabase/migrations/20250116000000_production_constraints_and_indexes.sql`

**Why:** Ensures data integrity and improves query performance.

**What it does:**
- Adds CHECK constraints (non-negative prices, positive quantities, etc.)
- Adds UNIQUE constraints (prevents duplicate order codes)
- Creates performance indexes for vendor dashboards and menu queries

---

### ✅ **Priority 4: RLS Hardening** (Security)

**File:** `supabase/migrations/20250116000001_harden_rls_policies.sql`

**Why:** Hardens security by preventing direct client writes to orders/order_items.

**What it does:**
- Removes direct insert policies for orders and order_items
- Adds status transition validation triggers
- Ensures only Edge Functions can create orders

---

### ⚠️ **Optional: Storage Setup**

**File:** `supabase/migrations/20250116000002_storage_setup.sql`

**Why:** Additional storage bucket setup if needed.

**Note:** Check if you already have the storage buckets this creates.

---

## 📝 How to Apply Migrations

### Step 1: Go to Supabase SQL Editor

**URL:** https://supabase.com/dashboard/project/elhlcdiosomutugpneoc/sql/new

### Step 2: Apply Each Migration in Order

1. **First:** Apply `20250116000005_create_venue_images_storage.sql`
   - Copy the file contents
   - Paste into SQL Editor
   - Click "Run"
   - Should see: "Success. No rows returned"

2. **Second:** Apply `apply_phase1_migrations.sql`
   - Copy the file contents
   - Paste into SQL Editor
   - Click "Run"
   - Should see: "Success. No rows returned"

3. **Third:** Apply `20250116000000_production_constraints_and_indexes.sql`
   - Copy the file contents
   - Paste into SQL Editor
   - Click "Run"
   - Should see: "Success. No rows returned"

4. **Fourth:** Apply `20250116000001_harden_rls_policies.sql`
   - Copy the file contents
   - Paste into SQL Editor
   - Click "Run"
   - Should see: "Success. No rows returned"

### Step 3: Verify Migrations Applied

Run this query to check what tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see:
- ✅ `profiles`
- ✅ `audit_logs`
- ✅ `vendors`, `orders`, `menu_items`, etc. (from base schema)

Run this to check storage buckets:

```sql
SELECT id, name, public 
FROM storage.buckets;
```

You should see:
- ✅ `venue-images` bucket

---

## 🔍 Check What's Already Applied

Before applying, you can check if migrations are already applied:

### Check if profiles table exists:
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
);
```

### Check if audit_logs table exists:
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'audit_logs'
);
```

### Check if venue-images bucket exists:
```sql
SELECT EXISTS (
  SELECT FROM storage.buckets 
  WHERE id = 'venue-images'
);
```

### Check if constraints exist:
```sql
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
AND constraint_name LIKE '%nonnegative%' OR constraint_name LIKE '%positive%' OR constraint_name LIKE '%unique%'
ORDER BY table_name, constraint_name;
```

---

## 📋 Quick Reference

**Migrations in Priority Order:**

1. ✅ `20250116000005_create_venue_images_storage.sql` - **CRITICAL for Gemini images**
2. ✅ `apply_phase1_migrations.sql` - Profiles & audit logs
3. ✅ `20250116000000_production_constraints_and_indexes.sql` - Data integrity
4. ✅ `20250116000001_harden_rls_policies.sql` - Security hardening

**Files to Skip:**
- `20251216131852_dinein_v1_schema.sql` - Base schema (probably already applied)
- `20250117000000_production_hardening_consolidated.sql` - May be duplicate of individual migrations
- `20250116000002_storage_setup.sql` - Optional, check if needed

---

## ⚠️ Important Notes

- All migrations use `IF NOT EXISTS` and `DROP IF EXISTS` statements, so they're safe to run multiple times
- If you get errors, check if the objects already exist
- The base schema (`20251216131852_dinein_v1_schema.sql`) should already be applied from initial setup
- You can apply migrations in any order, but the order above is recommended

