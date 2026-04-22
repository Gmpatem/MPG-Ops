-- 009_auth_invite_hardening.sql
-- Harden auth.users -> public.profiles bootstrap so admin invites do not fail
-- when optional metadata is missing or schema has drifted columns.

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  v_email := COALESCE(
    NULLIF(trim(NEW.email), ''),
    NULLIF(trim(NEW.raw_user_meta_data ->> 'email'), ''),
    NEW.id::text || '@placeholder.local'
  );

  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, v_email)
  ON CONFLICT (id) DO UPDATE
  SET email = COALESCE(EXCLUDED.email, public.profiles.email);

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'full_name'
  ) THEN
    UPDATE public.profiles
    SET full_name = COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''),
      NULLIF(trim(NEW.raw_user_meta_data ->> 'name'), ''),
      full_name
    )
    WHERE id = NEW.id;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'avatar_url'
  ) THEN
    UPDATE public.profiles
    SET avatar_url = COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data ->> 'avatar_url'), ''),
      avatar_url
    )
    WHERE id = NEW.id;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'auth_provider'
  ) THEN
    UPDATE public.profiles
    SET auth_provider = COALESCE(
      NULLIF(trim(NEW.app_metadata ->> 'provider'), ''),
      auth_provider
    )
    WHERE id = NEW.id;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'last_sign_in_at'
  ) THEN
    UPDATE public.profiles
    SET last_sign_in_at = COALESCE(last_sign_in_at, NOW())
    WHERE id = NEW.id;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'onboarding_status'
  ) THEN
    UPDATE public.profiles
    SET onboarding_status = COALESCE(onboarding_status, 'new')
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Do not block auth user creation/invites because of profile bootstrap drift.
    RAISE WARNING 'handle_new_user failed for auth.users.id=% (%).', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;
