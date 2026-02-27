-- ==================== STORAGE POLICIES FOR "Stores" BUCKET ====================
-- Date: 2026-02-27
-- Description: Allows authenticated users to upload, read, update, and delete
--              files in the "Stores" storage bucket.
-- IMPORTANT: The bucket "Stores" must already exist and be set to PUBLIC
--            in Supabase Dashboard > Storage > Buckets.

-- 1. Allow anyone to READ files (public images for storefront)
CREATE POLICY "Public read access on Stores bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'Stores');

-- 2. Allow authenticated users to UPLOAD files
CREATE POLICY "Authenticated users can upload to Stores bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'Stores'
  AND auth.role() = 'authenticated'
);

-- 3. Allow authenticated users to UPDATE their files (upsert)
CREATE POLICY "Authenticated users can update in Stores bucket"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'Stores'
  AND auth.role() = 'authenticated'
);

-- 4. Allow authenticated users to DELETE their files
CREATE POLICY "Authenticated users can delete from Stores bucket"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'Stores'
  AND auth.role() = 'authenticated'
);
