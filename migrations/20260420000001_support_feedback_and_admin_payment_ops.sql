-- Migration: 20260420000001_support_feedback_and_admin_payment_ops
-- Purpose: Add client support requests and business feedback tables for
--          platform oversight and quality workflows.
-- Safe to run multiple times: uses IF NOT EXISTS guards.

CREATE TABLE IF NOT EXISTS public.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  submitted_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  contact_email TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS support_requests_business_id_idx
  ON public.support_requests (business_id);

CREATE INDEX IF NOT EXISTS support_requests_status_idx
  ON public.support_requests (status);

CREATE INDEX IF NOT EXISTS support_requests_created_at_idx
  ON public.support_requests (created_at DESC);

COMMENT ON TABLE public.support_requests IS
  'Business-submitted support/help requests for platform admin triage.';

COMMENT ON COLUMN public.support_requests.category IS
  'Business-selected category such as payment_issue, config_help, or account.';

COMMENT ON COLUMN public.support_requests.status IS
  'Workflow state for platform handling: open, in_progress, resolved, closed.';

CREATE TABLE IF NOT EXISTS public.business_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS business_feedback_business_id_idx
  ON public.business_feedback (business_id);

CREATE INDEX IF NOT EXISTS business_feedback_status_idx
  ON public.business_feedback (status);

CREATE INDEX IF NOT EXISTS business_feedback_created_at_idx
  ON public.business_feedback (created_at DESC);

COMMENT ON TABLE public.business_feedback IS
  'Public feedback tied to a business from booking/public store users.';

COMMENT ON COLUMN public.business_feedback.status IS
  'Platform triage state: new, reviewed, actioned, dismissed.';
