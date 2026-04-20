-- Migration: 20260419000001_business_region_payment_settings
-- Purpose: Add region-aware payment setup fields to businesses and create
--          storage bucket for manual payment proofs.
-- Safe to run multiple times: uses IF NOT EXISTS and idempotent updates.

-- 1) Region/payment configuration fields on businesses
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT,
  ADD COLUMN IF NOT EXISTS default_payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_settings JSONB DEFAULT '{}'::jsonb;

-- Ensure payment_settings is always present for old and new rows.
UPDATE public.businesses
SET payment_settings = '{}'::jsonb
WHERE payment_settings IS NULL;

ALTER TABLE public.businesses
  ALTER COLUMN payment_settings SET DEFAULT '{}'::jsonb,
  ALTER COLUMN payment_settings SET NOT NULL;

COMMENT ON COLUMN public.businesses.country IS
  'Business country used to drive region-aware booking and payment behavior.';
COMMENT ON COLUMN public.businesses.currency IS
  'Primary business currency (e.g. PHP, XAF).';
COMMENT ON COLUMN public.businesses.default_payment_method IS
  'Default regional payment method for public bookings (e.g. gcash_manual).';
COMMENT ON COLUMN public.businesses.payment_settings IS
  'JSON settings for region-specific payment configuration and deposit rules.';

-- 2) Bucket for manual payment proof screenshots (private by default).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  FALSE,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
