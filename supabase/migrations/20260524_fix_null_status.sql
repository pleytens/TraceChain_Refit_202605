UPDATE tc_processes SET status = 'ACTIVE' WHERE status IS NULL;
ALTER TABLE tc_processes ALTER COLUMN status SET DEFAULT 'ACTIVE';
ALTER TABLE tc_processes ALTER COLUMN status SET NOT NULL;
