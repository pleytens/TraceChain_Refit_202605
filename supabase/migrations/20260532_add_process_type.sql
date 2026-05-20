ALTER TABLE tc_processes ADD COLUMN IF NOT EXISTS process_type TEXT;

UPDATE tc_processes SET process_type = 'asset_in'  WHERE sort_order = -2;
UPDATE tc_processes SET process_type = 'asset_out' WHERE sort_order = -1;

CREATE INDEX IF NOT EXISTS idx_tc_processes_type ON tc_processes(process_type);
