-- 004_public_booking_site_and_service_presentation.sql
-- Adds business-level public site settings
-- Adds service-level public booking presentation fields

BEGIN;

-- --------------------------------------------------
-- 1. BUSINESS-LEVEL PUBLIC SITE SETTINGS
-- --------------------------------------------------
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS public_site_settings jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.businesses.public_site_settings IS
'Stores public booking site customization settings such as headline, subtitle, instructions, and accent color.';

-- --------------------------------------------------
-- 2. SERVICE-LEVEL PUBLIC BOOKING PRESENTATION FIELDS
-- --------------------------------------------------
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS show_on_public_booking boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS promo_badge text,
ADD COLUMN IF NOT EXISTS promo_text text,
ADD COLUMN IF NOT EXISTS public_description text,
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS public_title text;

COMMENT ON COLUMN public.services.show_on_public_booking IS
'Controls whether this service appears on the public booking page.';
COMMENT ON COLUMN public.services.is_featured IS
'Marks the service as featured on the public booking page.';
COMMENT ON COLUMN public.services.promo_badge IS
'Short badge text shown on the public booking page, e.g. Best Value.';
COMMENT ON COLUMN public.services.promo_text IS
'Short promotional/supporting text shown on the public booking page.';
COMMENT ON COLUMN public.services.public_description IS
'Public-facing description shown on the booking page.';
COMMENT ON COLUMN public.services.display_order IS
'Controls sort order of services on the public booking page.';
COMMENT ON COLUMN public.services.public_title IS
'Optional public-facing title override for the service.';

-- --------------------------------------------------
-- 3. OPTIONAL INDEX FOR PUBLIC SERVICE QUERIES
-- --------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_services_public_booking
ON public.services (business_id, is_active, show_on_public_booking, display_order);

COMMIT;
