CREATE TABLE IF NOT EXISTS tc_recordings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  record_name TEXT NOT NULL,
  process_id TEXT NOT NULL REFERENCES tc_processes(id),
  recorded_by TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  user_name TEXT NOT NULL,
  batch_lot_number TEXT,
  expiry_date TEXT,
  status TEXT NOT NULL DEFAULT 'Created',
  locked_at TIMESTAMPTZ,
  locked_by TEXT,
  locked_by_name TEXT,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tc_recordings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access" ON tc_recordings;
CREATE POLICY "Public full access" ON tc_recordings FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_tc_recordings_process ON tc_recordings(process_id);
CREATE INDEX IF NOT EXISTS idx_tc_recordings_status ON tc_recordings(status);
CREATE INDEX IF NOT EXISTS idx_tc_recordings_date ON tc_recordings(recorded_at DESC);

ALTER TABLE tc_process_action_steps ADD COLUMN IF NOT EXISTS variable_details JSONB NOT NULL DEFAULT '{}';
