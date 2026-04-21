-- 006_onboarding_schema.sql
-- Adds onboarding-tracking columns to profiles and businesses.
-- Also formalises subscription / payment columns that are used in
-- application code but were never captured in a migration.
-- All ALTER TABLE statements use ADD COLUMN IF NOT EXISTS so the
-- migration is safe to re-run against databases where some columns
-- already exist.

BEGIN;

-- ================================================================
-- profiles — onboarding tracking
-- ================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url              text,
  ADD COLUMN IF NOT EXISTS auth_provider           text,
  ADD COLUMN IF NOT EXISTS last_sign_in_at         timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_status       text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS last_onboarding_step    text,
  ADD COLUMN IF NOT EXISTS onboarding_started_at   timestamptz,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

-- CHECK constraint (idempotent guard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname    = 'profiles_onboarding_status_check'
      AND conrelid   = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_onboarding_status_check
      CHECK (onboarding_status IN ('new', 'in_progress', 'completed'));
  END IF;
END $$;

-- ================================================================
-- businesses — setup tracking + subscription columns
-- ================================================================

-- Setup / completion tracking (new)
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS setup_completed_at       timestamptz,
  ADD COLUMN IF NOT EXISTS setup_checklist          jsonb    NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS onboarding_version       integer  NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS first_service_created_at timestamptz;

-- Subscription / payment columns — may already exist; ADD COLUMN IF NOT EXISTS
-- guards safely against that.
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS plan_tier              text  NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS trial_started_at       timestamptz,
  ADD COLUMN IF NOT EXISTS trial_ends_at          timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_status    text  NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS country                text,
  ADD COLUMN IF NOT EXISTS currency               text,
  ADD COLUMN IF NOT EXISTS default_payment_method text,
  ADD COLUMN IF NOT EXISTS payment_settings       jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ================================================================
-- business_members — unique constraint (present in 002; guard safely)
-- ================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname  = 'business_members_business_id_user_id_key'
      AND conrelid = 'public.business_members'::regclass
  ) THEN
    ALTER TABLE public.business_members
      ADD CONSTRAINT business_members_business_id_user_id_key
      UNIQUE (business_id, user_id);
  END IF;
END $$;

-- ================================================================
-- Backfill: profiles.onboarding_status
-- Conservatively infer status from existing data.
-- ================================================================

-- Users who already have a business with name + type → completed
UPDATE public.profiles p
SET
  onboarding_status       = 'completed',
  onboarding_completed_at = COALESCE(
    (
      SELECT b.created_at
      FROM   public.business_members bm
      JOIN   public.businesses b ON b.id = bm.business_id
      WHERE  bm.user_id = p.id
      LIMIT  1
    ),
    p.created_at
  )
WHERE p.onboarding_status = 'new'
  AND EXISTS (
    SELECT 1
    FROM   public.business_members bm
    JOIN   public.businesses b ON b.id = bm.business_id
    WHERE  bm.user_id     = p.id
      AND  b.name         IS NOT NULL
      AND  b.business_type IS NOT NULL
  );

-- Users with a membership but incomplete business data → in_progress
UPDATE public.profiles p
SET   onboarding_status = 'in_progress'
WHERE p.onboarding_status = 'new'
  AND EXISTS (
    SELECT 1 FROM public.business_members bm WHERE bm.user_id = p.id
  );

-- ================================================================
-- Backfill: businesses.setup_checklist
-- ================================================================

UPDATE public.businesses b
SET    setup_checklist = jsonb_build_object(
  'business_name', (
    b.name IS NOT NULL AND length(trim(b.name)) > 0
  ),
  'business_type', (
    b.business_type IS NOT NULL AND length(trim(b.business_type)) > 0
  ),
  'phone', (
    b.phone IS NOT NULL AND length(trim(b.phone)) > 0
  ),
  'first_service', (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE  s.business_id = b.id
        AND  s.is_active   = true
      LIMIT  1
    )
  )
)
WHERE  b.setup_checklist = '{}'::jsonb;

-- ================================================================
-- Backfill: businesses.setup_completed_at
-- Mark existing businesses that already pass the full checklist.
-- ================================================================

UPDATE public.businesses b
SET    setup_completed_at = b.created_at
WHERE  b.setup_completed_at IS NULL
  AND (b.setup_checklist->>'business_name')::boolean IS TRUE
  AND (b.setup_checklist->>'business_type')::boolean IS TRUE
  AND (b.setup_checklist->>'phone')::boolean          IS TRUE
  AND (b.setup_checklist->>'first_service')::boolean  IS TRUE;

-- ================================================================
-- Update the handle_new_user trigger to bootstrap richer profile
-- fields from OAuth provider metadata on first sign-up.
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    auth_provider,
    last_sign_in_at,
    onboarding_status
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.app_metadata->>'provider',
    NOW(),
    'new'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- Indexes
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_status
  ON public.profiles (onboarding_status);

CREATE INDEX IF NOT EXISTS idx_businesses_setup_completed
  ON public.businesses (setup_completed_at)
  WHERE setup_completed_at IS NOT NULL;

COMMIT;
