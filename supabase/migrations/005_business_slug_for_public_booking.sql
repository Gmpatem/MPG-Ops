-- 005_business_slug_for_public_booking.sql
-- Adds a friendly public slug to businesses for customer-facing booking URLs
-- Example public URL: /book/my-salon-name

BEGIN;

-- ==================================================
-- 1. ADD SLUG COLUMN
-- ==================================================
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS slug text;

COMMENT ON COLUMN public.businesses.slug IS
'Public-friendly unique slug used for customer-facing booking URLs.';

-- ==================================================
-- 2. BACKFILL EXISTING BUSINESSES
-- ==================================================
-- Creates a simple slug from the business name.
-- Appends a short id fragment to reduce collision risk.
UPDATE public.businesses
SET slug = lower(
  regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')
) || '-' || left(id::text, 8)
WHERE slug IS NULL OR btrim(slug) = '';

-- ==================================================
-- 3. NORMALIZE SLUG VALUES
-- ==================================================
UPDATE public.businesses
SET slug = trim(both '-' from regexp_replace(lower(slug), '[^a-z0-9-]+', '-', 'g'))
WHERE slug IS NOT NULL;

-- ==================================================
-- 4. CONSTRAINTS
-- ==================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'businesses_slug_not_empty'
  ) THEN
    ALTER TABLE public.businesses
    ADD CONSTRAINT businesses_slug_not_empty
    CHECK (slug IS NULL OR length(btrim(slug)) > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'businesses_slug_format'
  ) THEN
    ALTER TABLE public.businesses
    ADD CONSTRAINT businesses_slug_format
    CHECK (
      slug IS NULL
      OR slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    );
  END IF;
END $$;

-- ==================================================
-- 5. UNIQUE INDEX
-- ==================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_slug_unique
ON public.businesses (slug);

-- ==================================================
-- 6. MAKE SLUG REQUIRED AFTER BACKFILL
-- ==================================================
ALTER TABLE public.businesses
ALTER COLUMN slug SET NOT NULL;

COMMIT;
