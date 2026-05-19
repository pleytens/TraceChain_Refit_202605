-- ─── Warehouse Locations: Address → Building → Floor → Room ──────────────────
-- Non-destructive: creates new tables alongside existing ones.
-- Old geographic tables are NOT dropped (they may be referenced elsewhere).

-- 1. Locations table (warehouse addresses)
CREATE TABLE IF NOT EXISTS tc_locations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
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

-- 2. Storage rooms table (Building → Floor → Room hierarchy)
CREATE TABLE IF NOT EXISTS tc_storage_rooms (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  location_id TEXT NOT NULL REFERENCES tc_locations(id) ON DELETE CASCADE,
  building TEXT NOT NULL DEFAULT '',
  floor TEXT NOT NULL DEFAULT '',
  room TEXT NOT NULL DEFAULT '',
  storage_requirement TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (location_id, building, floor, room)
);

-- 3. Enable RLS
ALTER TABLE tc_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_storage_rooms ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies (open access – same pattern as other tables in this project)
DROP POLICY IF EXISTS "Public full access" ON tc_locations;
CREATE POLICY "Public full access" ON tc_locations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON tc_storage_rooms;
CREATE POLICY "Public full access" ON tc_storage_rooms FOR ALL USING (true) WITH CHECK (true);
