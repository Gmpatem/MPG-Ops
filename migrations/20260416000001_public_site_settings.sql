-- Migration: 20260416000001_public_site_settings
-- Purpose: Add public_site_settings JSONB column to businesses table.
--          This stores admin-configurable public booking page settings
--          (headline, subtitle, instructions, accent color).
-- Safe to run multiple times: uses IF NOT EXISTS guard.

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS public_site_settings JSONB DEFAULT '{}';

-- Comment for visibility in Supabase Table Editor
COMMENT ON COLUMN businesses.public_site_settings IS
  'Admin-configurable public booking page settings: headline, subtitle, instructions, accent color.';
