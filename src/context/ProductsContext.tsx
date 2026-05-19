import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export interface Product {
  id: number;
  gtinCode: string;
  productName: string;
  categoryName: string;
  createdAt: string;
}

const STORAGE_KEY = "tc_products";

const defaultProducts: Product[] = [
  { id: 1, gtinCode: "8936069001234", productName: "Organic Rice Premium", categoryName: "Grain", createdAt: "2024-01-10" },
  { id: 2, gtinCode: "8936069005678", productName: "Fresh Catfish Fillet", categoryName: "Seafood", createdAt: "2024-02-05" },
  { id: 3, gtinCode: "8936069009012", productName: "Dragon Fruit Red", categoryName: "Fruit", createdAt: "2024-03-15" },
  { id: 4, gtinCode: "8936069003456", productName: "Jasmine Tea Leaves", categoryName: "Beverage", createdAt: "2024-01-28" },
  { id: 5, gtinCode: "8936069007890", productName: "Cambodian Pepper Black", categoryName: "Spice", createdAt: "2024-04-02" },
  { id: 6, gtinCode: "8936069002233", productName: "Wild Honey Raw", categoryName: "Food", createdAt: "2024-02-18" },
];

// ── Supabase row type ────────────────────────────────────────────────────────
type DbRow = { id: number; gtin_code: string; product_name: string; category_name: string; created_at: string };

function rowToProduct(row: DbRow): Product {
  return { id: row.id, gtinCode: row.gtin_code, productName: row.product_name, categoryName: row.category_name, createdAt: row.created_at };
}

// ── Context ──────────────────────────────────────────────────────────────────
interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  addProduct: (data: Omit<Product, "id" | "createdAt">) => Promise<void>;
  updateProduct: (id: number, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabase) {
      supabase
        .from("tc_products")
        .select("*")
        .order("id", { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error("❌ Supabase fetch tc_products:", error.message);
            setProducts(defaultProducts);
            setLoading(false);
          } else if (!data || data.length === 0) {
            // Seed default products (no id — BIGSERIAL handles it)
            const rows = defaultProducts.map((p) => ({
              gtin_code: p.gtinCode,
              product_name: p.productName,
              category_name: p.categoryName,
              created_at: p.createdAt,
            }));
            supabase!.from("tc_products").insert(rows).select().then(({ data: seeded, error: seedErr }) => {
              if (seedErr) {
                console.error("❌ Supabase seed tc_products:", seedErr.message);
                setProducts(defaultProducts);
              } else {
                setProducts((seeded as DbRow[]).map(rowToProduct));
              }
              setLoading(false);
            });
          } else {
            setProducts((data as DbRow[]).map(rowToProduct));
            setLoading(false);
          }
        });
    } else {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Product[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
            setLoading(false);
            return;
          }
        }
      } catch {}
      setProducts(defaultProducts);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase && !loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  }, [products, loading]);

  const addProduct = async (data: Omit<Product, "id" | "createdAt">) => {
    const createdAt = new Date().toISOString().slice(0, 10);
    if (supabase) {
      const { data: inserted, error } = await supabase
        .from("tc_products")
        .insert({ gtin_code: data.gtinCode, product_name: data.productName, category_name: data.categoryName, created_at: createdAt })
        .select()
        .single();
      if (error) {
        console.error("❌ Supabase insert error (tc_products):", error.message, error.details, error.hint);
        throw new Error(error.message);
      }
      const newProduct = rowToProduct(inserted as DbRow);
      setProducts((prev) => [newProduct, ...prev]);
    } else {
      const id = Date.now();
      const newProduct: Product = { id, createdAt, ...data };
      setProducts((prev) => [newProduct, ...prev]);
    }
  };

  const updateProduct = async (id: number, data: Partial<Product>) => {
    if (supabase) {
      const dbData: Partial<DbRow> = {};
      if (data.gtinCode !== undefined) dbData.gtin_code = data.gtinCode;
      if (data.productName !== undefined) dbData.product_name = data.productName;
      if (data.categoryName !== undefined) dbData.category_name = data.categoryName;
      await supabase.from("tc_products").update(dbData).eq("id", id);
    }
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const deleteProduct = async (id: number) => {
    if (supabase) {
      await supabase.from("tc_products").delete().eq("id", id);
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <ProductsContext.Provider value={{ products, loading, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductsProvider");
  return ctx;
};
