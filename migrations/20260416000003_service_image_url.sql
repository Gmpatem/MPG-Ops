-- Migration: 20260416000003_service_image_url
-- Purpose: Add image_url to services and create the public storage bucket for service images.
-- Safe to run multiple times: uses IF NOT EXISTS guards.

-- 1. Add image_url column to services table
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Comment for visibility
COMMENT ON COLUMN services.image_url IS 'Public URL of the service image stored in Supabase Storage (service-images bucket).';

-- 2. Create the public storage bucket for service images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images',
  TRUE,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
