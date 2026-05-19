CREATE TABLE IF NOT EXISTS tc_settings_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  product_category TEXT NOT NULL DEFAULT '',
  commercial_name TEXT NOT NULL DEFAULT '',
  internal_id TEXT NOT NULL DEFAULT '',
  gs1_id TEXT NOT NULL DEFAULT '',
  barcode_id TEXT NOT NULL DEFAULT '',
  packing_item TEXT NOT NULL DEFAULT '',
  unit TEXT NOT NULL DEFAULT '',
  unit_default_quantity TEXT NOT NULL DEFAULT '',
  storage_requirement TEXT NOT NULL DEFAULT '',
  storage_house_number TEXT NOT NULL DEFAULT '',
  storage_street_name TEXT NOT NULL DEFAULT '',
  storage_district TEXT NOT NULL DEFAULT '',
  storage_post_code TEXT NOT NULL DEFAULT '',
  storage_city TEXT NOT NULL DEFAULT '',
  storage_country TEXT NOT NULL DEFAULT '',
  storage_location_room TEXT NOT NULL DEFAULT '',
  other1 TEXT NOT NULL DEFAULT '',
  other2 TEXT NOT NULL DEFAULT '',
  other3 TEXT NOT NULL DEFAULT '',
  activity_log JSONB NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT ''
);

ALTER TABLE tc_settings_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access" ON tc_settings_products;
CREATE POLICY "Public full access"
  ON tc_settings_products FOR ALL
  USING (true)
  WITH CHECK (true);
