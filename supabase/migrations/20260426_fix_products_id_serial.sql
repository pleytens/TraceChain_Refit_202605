-- Fix tc_products to use auto-increment id
-- Drop existing table and recreate with BIGSERIAL primary key

DROP TABLE IF EXISTS tc_products CASCADE;

CREATE TABLE tc_products (
  id BIGSERIAL PRIMARY KEY,
  gtin_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

ALTER TABLE tc_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access" ON tc_products;
CREATE POLICY "Public full access" ON tc_products FOR ALL USING (true) WITH CHECK (true);

-- Re-insert default seed data
INSERT INTO tc_products (gtin_code, product_name, category_name, created_at) VALUES
  ('8936069001234', 'Organic Rice Premium', 'Grain', '2024-01-10'),
  ('8936069005678', 'Fresh Catfish Fillet', 'Seafood', '2024-02-05'),
  ('8936069009012', 'Dragon Fruit Red', 'Fruit', '2024-03-15'),
  ('8936069003456', 'Jasmine Tea Leaves', 'Beverage', '2024-01-28'),
  ('8936069007890', 'Cambodian Pepper Black', 'Spice', '2024-04-02'),
  ('8936069002233', 'Wild Honey Raw', 'Food', '2024-02-18');
