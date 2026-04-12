-- Add category column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS category TEXT;

-- Update index to include category for filtering
CREATE INDEX IF NOT EXISTS idx_services_category ON services(business_id, category);
