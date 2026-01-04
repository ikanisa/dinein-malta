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

