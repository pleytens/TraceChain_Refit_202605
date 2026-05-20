-- Add location type flags to tc_locations
ALTER TABLE tc_locations ADD COLUMN IF NOT EXISTS is_client_premise BOOLEAN DEFAULT true;
ALTER TABLE tc_locations ADD COLUMN IF NOT EXISTS is_customer_delivery BOOLEAN DEFAULT false;

-- Set all existing locations as client premise by default
UPDATE tc_locations SET is_client_premise = true WHERE is_client_premise IS NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_tc_locations_client_premise ON tc_locations(is_client_premise);
CREATE INDEX IF NOT EXISTS idx_tc_locations_customer_delivery ON tc_locations(is_customer_delivery);
