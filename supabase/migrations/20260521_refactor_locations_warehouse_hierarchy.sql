-- ─── Refactor Locations: Geographic → Warehouse Storage Hierarchy ─────────────
-- Replaces tc_storage_requirements (JSONB) with proper structured tables.
-- Drops existing tc_locations and tc_storage_rooms from previous migration and recreates.
-- Adds tc_locations (warehouse addresses) and tc_storage_rooms (Building → Floor → Room).
-- Adds current_storage_room_id to tc_materials and tc_products.

-- ─── 0. Drop previous incomplete tables (from 20260520 migration) ─────────────
DROP TABLE IF EXISTS tc_storage_rooms CASCADE;
DROP TABLE IF EXISTS tc_locations CASCADE;

-- ─── 1. Drop old tc_storage_requirements and replace with proper structure ─────
DROP TABLE IF EXISTS tc_storage_requirements CASCADE;

CREATE TABLE IF NOT EXISTS tc_storage_requirements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tenant_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  temperature_min_c NUMERIC,
  temperature_max_c NUMERIC,
  humidity_min_pct NUMERIC,
  humidity_max_pct NUMERIC,
  requires_cold_chain BOOLEAN NOT NULL DEFAULT false,
  requires_hazmat BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Seed default storage requirements ─────────────────────────────────────
INSERT INTO tc_storage_requirements (id, tenant_id, name, code, description, temperature_min_c, temperature_max_c, humidity_min_pct, humidity_max_pct, requires_cold_chain, requires_hazmat, is_active)
VALUES
  (gen_random_uuid()::TEXT, 'default', 'Ambient',          'AMBIENT',    'Standard room temperature storage. No special requirements.',              15, 25,  30, 70,  false, false, true),
  (gen_random_uuid()::TEXT, 'default', 'Chilled',          'CHILLED',    'Refrigerated storage between 0°C and 8°C.',                                0,  8,   40, 80,  true,  false, true),
  (gen_random_uuid()::TEXT, 'default', 'Frozen',           'FROZEN',     'Deep frozen storage below -18°C.',                                         -25,-18,  null, null, true,  false, true),
  (gen_random_uuid()::TEXT, 'default', 'Controlled Temp',  'CTRL_TEMP',  'Precise temperature-controlled environment (e.g. 15–20°C for wine).',      15, 20,  50, 70,  false, false, true),
  (gen_random_uuid()::TEXT, 'default', 'Dry Store',        'DRY',        'Low humidity, no moisture. Suitable for dry goods and packaging.',          10, 25,  10, 50,  false, false, true),
  (gen_random_uuid()::TEXT, 'default', 'Hazardous',        'HAZMAT',     'Certified hazardous material storage with ventilation and containment.',    null, null, null, null, false, true,  true),
  (gen_random_uuid()::TEXT, 'default', 'High Security',    'SECURE',     'Access-controlled vault or secured area.',                                  null, null, null, null, false, false, true),
  (gen_random_uuid()::TEXT, 'default', 'Bulk / Open',      'BULK',       'Large-format open floor or yard storage for bulk goods.',                  null, null, null, null, false, false, true)
ON CONFLICT (code) DO NOTHING;

-- ─── 3. Locations table (warehouse addresses) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS tc_locations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tenant_id TEXT NOT NULL DEFAULT 'default',
  name TEXT NOT NULL,
  street_address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. Storage rooms table (Building → Floor → Room hierarchy) ───────────────
CREATE TABLE IF NOT EXISTS tc_storage_rooms (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  tenant_id TEXT NOT NULL DEFAULT 'default',
  location_id TEXT NOT NULL REFERENCES tc_locations(id) ON DELETE CASCADE,
  storage_requirement_id TEXT REFERENCES tc_storage_requirements(id) ON DELETE SET NULL,
  building TEXT NOT NULL DEFAULT '',
  floor TEXT NOT NULL DEFAULT '',
  room TEXT NOT NULL,
  capacity_units TEXT NOT NULL DEFAULT '',
  capacity_value NUMERIC,
  notes TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (location_id, building, floor, room)
);

-- ─── 5. Add location fields to tc_materials ───────────────────────────────────
ALTER TABLE tc_materials
  ADD COLUMN IF NOT EXISTS current_storage_room_id TEXT REFERENCES tc_storage_rooms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS storage_requirement_id TEXT REFERENCES tc_storage_requirements(id) ON DELETE SET NULL;

-- ─── 6. Add location fields to tc_products ────────────────────────────────────
ALTER TABLE tc_products
  ADD COLUMN IF NOT EXISTS current_storage_room_id TEXT REFERENCES tc_storage_rooms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS storage_requirement_id TEXT REFERENCES tc_storage_requirements(id) ON DELETE SET NULL;

-- ─── 7. RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE tc_storage_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_storage_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access" ON tc_storage_requirements;
CREATE POLICY "Public full access" ON tc_storage_requirements FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON tc_locations;
CREATE POLICY "Public full access" ON tc_locations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON tc_storage_rooms;
CREATE POLICY "Public full access" ON tc_storage_rooms FOR ALL USING (true) WITH CHECK (true);

-- ─── 8. Sample data ───────────────────────────────────────────────────────────
INSERT INTO tc_locations (id, tenant_id, name, street_address, city, postal_code, country, is_active)
VALUES
  ('loc_main',  'default', 'Main Warehouse',     '12 Industrial Avenue',    'Brussels',  '1000', 'Belgium',     true),
  ('loc_cold',  'default', 'Cold Storage Depot', '8 Refrigeration Road',    'Antwerp',   '2000', 'Belgium',     true),
  ('loc_chem',  'default', 'Chemical Store',     '3 Safety Boulevard',      'Ghent',     '9000', 'Belgium',     true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tc_storage_rooms (id, tenant_id, location_id, storage_requirement_id, building, floor, room, is_active)
SELECT
  gen_random_uuid()::TEXT, 'default', 'loc_main',  sr.id, 'A', 'Ground', 'A-G-01', true
FROM tc_storage_requirements sr WHERE sr.code = 'AMBIENT' LIMIT 1
ON CONFLICT (location_id, building, floor, room) DO NOTHING;

INSERT INTO tc_storage_rooms (id, tenant_id, location_id, storage_requirement_id, building, floor, room, is_active)
SELECT
  gen_random_uuid()::TEXT, 'default', 'loc_main',  sr.id, 'A', 'Ground', 'A-G-02', true
FROM tc_storage_requirements sr WHERE sr.code = 'DRY' LIMIT 1
ON CONFLICT (location_id, building, floor, room) DO NOTHING;

INSERT INTO tc_storage_rooms (id, tenant_id, location_id, storage_requirement_id, building, floor, room, is_active)
SELECT
  gen_random_uuid()::TEXT, 'default', 'loc_cold',  sr.id, 'B', 'Ground', 'B-G-01', true
FROM tc_storage_requirements sr WHERE sr.code = 'CHILLED' LIMIT 1
ON CONFLICT (location_id, building, floor, room) DO NOTHING;

INSERT INTO tc_storage_rooms (id, tenant_id, location_id, storage_requirement_id, building, floor, room, is_active)
SELECT
  gen_random_uuid()::TEXT, 'default', 'loc_cold',  sr.id, 'B', 'Ground', 'B-G-02', true
FROM tc_storage_requirements sr WHERE sr.code = 'FROZEN' LIMIT 1
ON CONFLICT (location_id, building, floor, room) DO NOTHING;

INSERT INTO tc_storage_rooms (id, tenant_id, location_id, storage_requirement_id, building, floor, room, is_active)
SELECT
  gen_random_uuid()::TEXT, 'default', 'loc_chem',  sr.id, 'C', 'Ground', 'C-G-01', true
FROM tc_storage_requirements sr WHERE sr.code = 'HAZMAT' LIMIT 1
ON CONFLICT (location_id, building, floor, room) DO NOTHING;
