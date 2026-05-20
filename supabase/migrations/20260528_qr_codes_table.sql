CREATE TABLE IF NOT EXISTS tc_qr_codes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  material_product TEXT NOT NULL,
  batch_number TEXT NOT NULL,
  expiry_date TEXT,
  date_recorded TEXT NOT NULL,
  quantity_recorded NUMERIC NOT NULL DEFAULT 0,
  qr_code_count INTEGER NOT NULL DEFAULT 1,
  date_qr_codes TEXT NOT NULL,
  recording_id TEXT,
  process_id TEXT,
  action_id TEXT,
  tenant_id TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tc_qr_codes_recording ON tc_qr_codes(recording_id);
CREATE INDEX IF NOT EXISTS idx_tc_qr_codes_process ON tc_qr_codes(process_id);
CREATE INDEX IF NOT EXISTS idx_tc_qr_codes_batch ON tc_qr_codes(batch_number);
CREATE INDEX IF NOT EXISTS idx_tc_qr_codes_material ON tc_qr_codes(material_product);
CREATE INDEX IF NOT EXISTS idx_tc_qr_codes_tenant ON tc_qr_codes(tenant_id);
