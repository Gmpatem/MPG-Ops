-- Migration: 20260416000007_platform_admin
-- Purpose: Add platform admin flag to profiles for master admin access.
-- Safe to run multiple times: uses IF NOT EXISTS guard.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN profiles.is_platform_admin IS 'When true, grants access to /platform master admin area.';
