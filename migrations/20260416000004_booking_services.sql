-- Migration: 20260416000004_booking_services
-- Purpose: Create join table to support multi-service bookings.
-- Safe to run multiple times: uses IF NOT EXISTS guards.

CREATE TABLE IF NOT EXISTS booking_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (booking_id, service_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_booking_services_booking_id
  ON booking_services (booking_id);

CREATE INDEX IF NOT EXISTS idx_booking_services_service_id
  ON booking_services (service_id);

-- Comments
COMMENT ON TABLE booking_services IS 'Join table linking bookings to multiple services.';
COMMENT ON COLUMN booking_services.booking_id IS 'Reference to the parent booking.';
COMMENT ON COLUMN booking_services.service_id IS 'Reference to a selected service.';
