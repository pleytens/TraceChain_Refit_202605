-- Add location_selector_type column to tc_action_library
ALTER TABLE tc_action_library ADD COLUMN IF NOT EXISTS location_selector_type TEXT;

-- Update asset actions if they exist
UPDATE tc_action_library SET location_selector_type = 'my_company_locations' WHERE action_key = 'asset_in';
UPDATE tc_action_library SET location_selector_type = 'my_customer_delivery_address' WHERE action_key = 'asset_out';
