-- Storage Buckets Setup for Menu Uploads and Assets
-- Note: Storage bucket creation via SQL requires proper permissions
-- These commands may need to be run via Supabase Dashboard or via API

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create bucket for menu uploads (private by default, vendor members can upload)
-- Run this via Supabase Dashboard: Storage > Create Bucket
-- Or use Supabase Management API
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-uploads',
  'menu-uploads',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for approved menu images (public read after vendor approval)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true, -- Public read access
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for public assets (icons, logos, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assets',
  'assets',
  true, -- Public read access
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']::text[]
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================
-- Note: Storage policies are managed via Supabase Dashboard or API
-- These are examples of the policies you need to create

-- Policy for menu-uploads: Vendor members can upload to their vendor folder
-- Path pattern: vendors/{vendor_id}/menus/*
-- Create via Dashboard: Storage > menu-uploads > Policies > New Policy

-- Example policy SQL (run via Dashboard or API):
/*
CREATE POLICY "Vendor members can upload menu files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-uploads' AND
  (storage.foldername(name))[1] = 'vendors' AND
  (storage.foldername(name))[2] = (SELECT v.id::text FROM vendors v
    INNER JOIN vendor_users vu ON vu.vendor_id = v.id
    WHERE vu.auth_user_id = auth.uid() AND vu.is_active = true
    LIMIT 1)
);

CREATE POLICY "Vendor members can read their own menu uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'menu-uploads' AND
  (storage.foldername(name))[1] = 'vendors' AND
  (storage.foldername(name))[2] = (SELECT v.id::text FROM vendors v
    INNER JOIN vendor_users vu ON vu.vendor_id = v.id
    WHERE vu.auth_user_id = auth.uid() AND vu.is_active = true
    LIMIT 1)
);

CREATE POLICY "Admins can read all menu uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'menu-uploads' AND
  EXISTS (SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid() AND is_active = true)
);
*/

-- Policy for menu-images: Public read, vendor/admin write
/*
CREATE POLICY "Public can read menu images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-images');

CREATE POLICY "Vendor members can upload menu images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-images' AND
  (storage.foldername(name))[1] = 'vendors' AND
  (storage.foldername(name))[2] = (SELECT v.id::text FROM vendors v
    INNER JOIN vendor_users vu ON vu.vendor_id = v.id
    WHERE vu.auth_user_id = auth.uid() AND vu.is_active = true
    LIMIT 1)
);
*/

-- Policy for assets: Public read, admin write
/*
CREATE POLICY "Public can read assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'assets');

CREATE POLICY "Admins can upload assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'assets' AND
  EXISTS (SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid() AND is_active = true)
);
*/

-- ============================================================================
-- NOTE: Storage policies creation
-- ============================================================================
-- Storage policies cannot be created directly via SQL migrations in Supabase.
-- You must create them via:
-- 1. Supabase Dashboard: Storage > [bucket] > Policies > New Policy
-- 2. Supabase Management API
-- 3. Supabase CLI (if supported)
--
-- For production, consider creating a setup script that uses the Management API
-- to create buckets and policies programmatically.

