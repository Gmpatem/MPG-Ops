-- Migration: 20260416000005_booking_source_public_booking
-- Purpose: Safely add 'public_booking' to the booking_source enum if it exists.
-- Safe to run multiple times: wrapped in an idempotent DO block.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_source') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'booking_source'
        AND e.enumlabel = 'public_booking'
    ) THEN
      ALTER TYPE booking_source ADD VALUE 'public_booking';
    END IF;
  END IF;
END $$;
