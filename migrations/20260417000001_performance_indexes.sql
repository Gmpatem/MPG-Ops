-- Migration: 20260417000001_performance_indexes
-- Purpose: Add safe query-path indexes for dashboard/list performance.
-- Notes:
-- - Uses IF NOT EXISTS for idempotency.
-- - Does not remove existing indexes.

-- Bookings: day schedule reads + time ordering
CREATE INDEX IF NOT EXISTS idx_bookings_business_date_start_time
  ON bookings (business_id, booking_date, start_time);

-- Bookings: customer history reads
CREATE INDEX IF NOT EXISTS idx_bookings_business_customer_date_desc
  ON bookings (business_id, customer_id, booking_date DESC);

-- Customers: default list ordering
CREATE INDEX IF NOT EXISTS idx_customers_business_created_at_desc
  ON customers (business_id, created_at DESC);

-- Services: default list ordering
CREATE INDEX IF NOT EXISTS idx_services_business_created_at_desc
  ON services (business_id, created_at DESC);

-- Businesses: platform/admin status segmentation
CREATE INDEX IF NOT EXISTS idx_businesses_subscription_status
  ON businesses (subscription_status);
