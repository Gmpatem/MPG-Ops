-- Migration: 20260416000006_business_plan_trial
-- Purpose: Add plan and trial tracking to businesses for SaaS monetization.
-- Safe to run multiple times: uses IF NOT EXISTS guards.

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (plan_tier IN ('free', 'pro', 'business')),
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'free'
    CHECK (subscription_status IN ('trialing', 'active', 'expired', 'free'));

-- Comments
COMMENT ON COLUMN businesses.plan_tier IS 'Current billing plan: free, pro, or business.';
COMMENT ON COLUMN businesses.trial_started_at IS 'When the Pro/Business trial started.';
COMMENT ON COLUMN businesses.trial_ends_at IS 'When the Pro/Business trial ends.';
COMMENT ON COLUMN businesses.subscription_status IS 'Overall subscription state: trialing, active, expired, or free.';
