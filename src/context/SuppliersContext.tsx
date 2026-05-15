import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export interface Supplier {
  id: number;
  gs1Code: string;
  name: string;
  address: string;
  email: string;
  createdAt: string;
}

const STORAGE_KEY = "tc_suppliers";

const defaultSuppliers: Supplier[] = [
  { id: 1, gs1Code: "8936069", name: "Green Farm Co.", address: "Phnom Penh, Cambodia", email: "admin@greenfarm.com", createdAt: "2024-01-15" },
  { id: 2, gs1Code: "8936070", name: "Mekong Fish Ltd.", address: "Kandal Province, Cambodia", email: "info@mekong.com", createdAt: "2024-02-20" },
  { id: 3, gs1Code: "8936071", name: "Angkor Foods", address: "Siem Reap, Cambodia", email: "contact@angkor.com", createdAt: "2023-11-01" },
  { id: 4, gs1Code: "8936072", name: "KBF Trading", address: "Kampot Province", email: "kbf@trade.com", createdAt: "2024-03-10" },
  { id: 5, gs1Code: "8936073", name: "Sunrise Produce", address: "Battambang, Cambodia", email: "hello@sunrise.com", createdAt: "2023-09-05" },
];

// ── Supabase row type ────────────────────────────────────────────────────────
type DbRow = { id: number; gs1_code: string; name: string; address: string; email: string; created_at: string };

function rowToSupplier(row: DbRow): Supplier {
  return { id: row.id, gs1Code: row.gs1_code, name: row.name, address: row.address, email: row.email, createdAt: row.created_at };
}

// ── Context ──────────────────────────────────────────────────────────────────
interface SuppliersContextValue {
  suppliers: Supplier[];
  loading: boolean;
  addSupplier: (data: Omit<Supplier, "id" | "createdAt">) => Promise<void>;
  updateSupplier: (id: number, data: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: number) => Promise<void>;
}

const SuppliersContext = createContext<SuppliersContextValue | null>(null);

export const SuppliersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabase) {
      supabase
        .from("tc_suppliers")
        .select("*")
        .order("id", { ascending: false })
        .then(({ data, error }) => {
          if (error || !data || data.length === 0) {
            const rows = defaultSuppliers.map((s) => ({
              id: s.id,
              gs1_code: s.gs1Code,
              name: s.name,
              address: s.address,
              email: s.email,
              created_at: s.createdAt,
            }));
            supabase!.from("tc_suppliers").upsert(rows).then(() => {
              setSuppliers(defaultSuppliers);
              setLoading(false);
            });
          } else {
            setSuppliers((data as DbRow[]).map(rowToSupplier));
            setLoading(false);
          }
        });
    } else {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Supplier[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSuppliers(parsed);
            setLoading(false);
            return;
          }
        }
      } catch {}
      setSuppliers(defaultSuppliers);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase && !loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
    }
  }, [suppliers, loading]);

  const addSupplier = async (data: Omit<Supplier, "id" | "createdAt">) => {
    const id = Date.now();
    const createdAt = new Date().toISOString().slice(0, 10);
    const newSupplier: Supplier = { id, createdAt, ...data };
    if (supabase) {
      await supabase.from("tc_suppliers").insert({ id, gs1_code: data.gs1Code, name: data.name, address: data.address, email: data.email, created_at: createdAt });
    }
    setSuppliers((prev) => [newSupplier, ...prev]);
  };

  const updateSupplier = async (id: number, data: Partial<Supplier>) => {
    if (supabase) {
      const dbData: Partial<DbRow> = {};
      if (data.gs1Code !== undefined) dbData.gs1_code = data.gs1Code;
      if (data.name !== undefined) dbData.name = data.name;
      if (data.address !== undefined) dbData.address = data.address;
      if (data.email !== undefined) dbData.email = data.email;
      await supabase.from("tc_suppliers").update(dbData).eq("id", id);
    }
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const deleteSupplier = async (id: number) => {
    if (supabase) {
      await supabase.from("tc_suppliers").delete().eq("id", id);
    }
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <SuppliersContext.Provider value={{ suppliers, loading, addSupplier, updateSupplier, deleteSupplier }}>
      {children}
    </SuppliersContext.Provider>
  );
};

export const useSuppliers = () => {
  const ctx = useContext(SuppliersContext);
  if (!ctx) throw new Error("useSuppliers must be used inside SuppliersProvider");
  return ctx;
};
