-- Processes table
CREATE TABLE IF NOT EXISTS tc_processes (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Products table
CREATE TABLE IF NOT EXISTS tc_products (
  id BIGINT PRIMARY KEY,
  gtin_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS tc_suppliers (
  id BIGINT PRIMARY KEY,
  gs1_code TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

-- Settings suppliers (companies) table
CREATE TABLE IF NOT EXISTS tc_settings_suppliers (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings customers table
CREATE TABLE IF NOT EXISTS tc_settings_customers (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings products table
CREATE TABLE IF NOT EXISTS tc_settings_products (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materials table
CREATE TABLE IF NOT EXISTS tc_materials (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage requirements table
CREATE TABLE IF NOT EXISTS tc_storage_requirements (
  id SERIAL PRIMARY KEY,
  requirements JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tc_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_settings_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_settings_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_settings_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_storage_requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access" ON tc_processes;
CREATE POLICY "Public full access" ON tc_processes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON tc_products;
CREATE POLICY "Public full access" ON tc_products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON tc_suppliers;
CREATE POLICY "Public full access" ON tc_suppliers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON tc_settings_suppliers;
CREATE POLICY "Public full access" ON tc_settings_suppliers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON tc_settings_customers;
CREATE POLICY "Public full access" ON tc_settings_customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON tc_settings_products;
CREATE POLICY "Public full access" ON tc_settings_products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON tc_materials;
CREATE POLICY "Public full access" ON tc_materials FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON tc_storage_requirements;
CREATE POLICY "Public full access" ON tc_storage_requirements FOR ALL USING (true) WITH CHECK (true);
