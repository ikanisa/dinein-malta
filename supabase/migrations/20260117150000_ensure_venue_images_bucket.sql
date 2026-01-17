-- Ensure venue-images bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('venue-images', 'venue-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure policy for public read exists
DROP POLICY IF EXISTS "venue_images_public_read_2026" ON storage.objects;
CREATE POLICY "venue_images_public_read_2026"
ON storage.objects FOR SELECT
USING (bucket_id = 'venue-images');

-- Ensure policy for authenticated upload exists
DROP POLICY IF EXISTS "venue_images_auth_upload_2026" ON storage.objects;
CREATE POLICY "venue_images_auth_upload_2026"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'venue-images'
  AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);
