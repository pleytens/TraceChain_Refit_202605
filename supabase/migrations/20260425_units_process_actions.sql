CREATE TABLE IF NOT EXISTS tc_units (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tc_process_actions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#3B82F6',
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tc_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_process_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access" ON tc_units;
CREATE POLICY "Public full access" ON tc_units FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON tc_process_actions;
CREATE POLICY "Public full access" ON tc_process_actions FOR ALL USING (true) WITH CHECK (true);
