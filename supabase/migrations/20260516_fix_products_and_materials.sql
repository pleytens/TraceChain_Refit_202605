-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 1: tc_products — add auto-increment sequence to existing id column
-- (non-destructive: keeps the 6 existing rows intact)
-- ─────────────────────────────────────────────────────────────────────────────

-- Create a sequence starting after current max id
CREATE SEQUENCE IF NOT EXISTS tc_products_id_seq;
SELECT setval('tc_products_id_seq', COALESCE((SELECT MAX(id) FROM tc_products), 0));
ALTER TABLE tc_products ALTER COLUMN id SET DEFAULT nextval('tc_products_id_seq');
ALTER SEQUENCE tc_products_id_seq OWNED BY tc_products.id;

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 2: tc_materials — replace JSONB blob with flat, readable columns
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop old table (was storing everything in a single 'data' JSONB blob)
DROP TABLE IF EXISTS tc_materials CASCADE;

-- Recreate with explicit, human-readable columns
CREATE TABLE tc_materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  supplier_id TEXT NOT NULL DEFAULT '',
  supplier_name TEXT NOT NULL DEFAULT '',
  material_category TEXT NOT NULL DEFAULT '',
  import_packing_item TEXT NOT NULL DEFAULT '',
  import_unit_item TEXT NOT NULL DEFAULT '',
  import_packing_unit_default_qty TEXT NOT NULL DEFAULT '',
  origin_house_number TEXT NOT NULL DEFAULT '',
  origin_street_name TEXT NOT NULL DEFAULT '',
  origin_district TEXT NOT NULL DEFAULT '',
  origin_post_code TEXT NOT NULL DEFAULT '',
  origin_city TEXT NOT NULL DEFAULT '',
  origin_country TEXT NOT NULL DEFAULT '',
  activity_log JSONB NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT ''
);

ALTER TABLE tc_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access" ON tc_materials;
CREATE POLICY "Public full access" ON tc_materials FOR ALL USING (true) WITH CHECK (true);
