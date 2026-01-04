# Storage Migration Instructions

## Error Fix
If you got an error about TypeScript syntax, make sure you're running the **SQL file**, not the TypeScript file.

## Correct File to Run
✅ **File**: `supabase/migrations/20250116000005_create_venue_images_storage.sql`  
❌ **NOT**: `apps/universal/services/imageCache.ts` (this is TypeScript, not SQL!)

## How to Apply the Migration

### Option 1: Supabase Dashboard (Recommended)
1. Go to: https://supabase.com/dashboard/project/elhlcdiosomutugpneoc
2. Navigate to: **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/20250116000005_create_venue_images_storage.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

### Option 2: Copy SQL Directly
Here's the SQL to copy and paste:

```sql
-- Create storage bucket for venue images with weekly rotation
-- This bucket stores AI-generated venue thumbnails that rotate weekly

-- Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('venue-images', 'venue-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop policies if they exist (to allow re-running this migration)
DROP POLICY IF EXISTS "venue_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_service_delete" ON storage.objects;

-- Storage policies for venue-images bucket
-- Public read access (images are public)
CREATE POLICY "venue_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'venue-images');

-- Allow authenticated users to upload (for Edge Functions or admin)
CREATE POLICY "venue_images_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'venue-images'
  AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Allow authenticated users to update
CREATE POLICY "venue_images_authenticated_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'venue-images'
  AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Allow service role to delete (for cleanup of old images)
CREATE POLICY "venue_images_service_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'venue-images'
  AND auth.role() = 'service_role'
);
```

## Verification

After running the migration:

1. Go to **Storage** in the Supabase Dashboard
2. You should see a bucket named `venue-images`
3. The bucket should be **Public** (public toggle is ON)

## What This Migration Does

- Creates the `venue-images` storage bucket (public)
- Sets up policies for:
  - Public read access (anyone can view images)
  - Authenticated upload (Edge Functions can upload images)
  - Service role delete (cleanup of old images)

## Troubleshooting

**Error: "relation storage.buckets does not exist"**
- This shouldn't happen in Supabase, but if it does, try creating the bucket manually via the Storage UI first, then run the policies.

**Error: "policy already exists"**
- The updated migration now uses `DROP POLICY IF EXISTS`, so this should be resolved. If you still get this, run the DROP statements first, then the CREATE statements.

**Error: "syntax error at or near import"**
- You're trying to run TypeScript code! Make sure you're running the `.sql` file, not the `.ts` file.

