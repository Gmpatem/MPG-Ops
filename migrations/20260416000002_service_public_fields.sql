-- Migration: 20260416000002_service_public_fields
-- Purpose: Add public-facing presentation columns to the services table.
--          These allow business owners to control how each service appears
--          on the public booking page without affecting internal data.
-- Safe to run multiple times: all use IF NOT EXISTS / DO blocks.

-- 1. Whether this service should appear on the public booking page
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS show_on_public_booking BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Whether this service should be highlighted as featured
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Short public-facing title override (e.g. "Men's Cut & Style")
--    Falls back to 'name' if NULL.
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS public_title TEXT;

-- 4. Short public-facing description override
--    Falls back to 'description' if NULL.
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS public_description TEXT;

-- 5. Short promo badge label (e.g. "Popular", "New", "Sale")
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS promo_badge TEXT;

-- 6. Short promo text shown below the service name on the public page
--    (e.g. "Book before Friday for 10% off")
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS promo_text TEXT;

-- 7. Numeric sort order for public listing (lower = shown first)
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- Index for efficient public listing queries
CREATE INDEX IF NOT EXISTS idx_services_public_listing
  ON services (business_id, show_on_public_booking, display_order, name)
  WHERE is_active = TRUE;

-- Comments
COMMENT ON COLUMN services.show_on_public_booking IS 'Whether this service is visible on the public booking page. Defaults to TRUE.';
COMMENT ON COLUMN services.is_featured           IS 'Whether this service receives featured/highlighted treatment on the public page.';
COMMENT ON COLUMN services.public_title          IS 'Optional public-facing title override. Falls back to name if NULL.';
COMMENT ON COLUMN services.public_description    IS 'Optional public-facing description override. Falls back to description if NULL.';
COMMENT ON COLUMN services.promo_badge           IS 'Short badge label shown on the public service card (e.g. Popular, New).';
COMMENT ON COLUMN services.promo_text            IS 'Short promotional text shown below the service on the public page.';
COMMENT ON COLUMN services.display_order         IS 'Numeric sort order for public service listing. Lower values appear first.';
