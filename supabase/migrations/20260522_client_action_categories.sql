CREATE TABLE IF NOT EXISTS tc_client_action_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (client_id, name)
);

CREATE INDEX IF NOT EXISTS idx_tc_client_action_categories_client ON tc_client_action_categories(client_id);
