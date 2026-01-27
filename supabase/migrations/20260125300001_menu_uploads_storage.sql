-- Menu Uploads Storage Bucket
-- For OCR menu image uploads: menu_uploads/{venueId}/{jobId}/filename

-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu_uploads',
  'menu_uploads',
  false,  -- Private bucket
  10485760,  -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- STORAGE RLS POLICIES
-- ============================================================================

-- Upload: Venue editors can upload to their venue's folder
DROP POLICY IF EXISTS "menu_uploads_insert" ON storage.objects;
CREATE POLICY "menu_uploads_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'menu_uploads'
    AND (
      -- Path must be: menu_uploads/{venueId}/{jobId}/...
      -- Check user can edit the venue in the path
      public.can_edit_vendor_profile(
        (string_to_array(name, '/'))[1]::uuid
      )
    )
  );

-- Read: Venue members can read their venue's uploads
DROP POLICY IF EXISTS "menu_uploads_select" ON storage.objects;
CREATE POLICY "menu_uploads_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'menu_uploads'
    AND (
      public.is_admin()
      OR public.is_vendor_member((string_to_array(name, '/'))[1]::uuid)
    )
  );

-- Delete: Venue editors can delete their venue's uploads
DROP POLICY IF EXISTS "menu_uploads_delete" ON storage.objects;
CREATE POLICY "menu_uploads_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'menu_uploads'
    AND (
      public.is_admin()
      OR public.can_edit_vendor_profile((string_to_array(name, '/'))[1]::uuid)
    )
  );
