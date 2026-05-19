import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  type: string;
  status: "Active" | "Inactive";
}

const STORAGE_KEY = "tc_units";

const defaultUnits: Unit[] = [
  { id: "u1", name: "Kilogram", abbreviation: "kg", type: "Weight", status: "Active" },
  { id: "u2", name: "Gram", abbreviation: "g", type: "Weight", status: "Active" },
  { id: "u3", name: "Litre", abbreviation: "L", type: "Volume", status: "Active" },
  { id: "u4", name: "Millilitre", abbreviation: "mL", type: "Volume", status: "Active" },
  { id: "u5", name: "Piece", abbreviation: "pcs", type: "Quantity", status: "Active" },
  { id: "u6", name: "Box", abbreviation: "box", type: "Quantity", status: "Inactive" },
];

function loadUnitsLocal(): Unit[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Unit[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return defaultUnits;
}

function saveLocal(next: Unit[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

interface UnitsContextValue {
  units: Unit[];
  activeUnits: Unit[];
  addUnit: (data: Omit<Unit, "id">) => Promise<void>;
  updateUnit: (id: string, data: Partial<Unit>) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
}

const UnitsContext = createContext<UnitsContextValue | null>(null);

export const UnitsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [units, setUnits] = useState<Unit[]>(loadUnitsLocal);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("tc_units")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.warn("⚠️ Supabase tc_units load failed, using localStorage:", error.message);
          return;
        }
        if (data && data.length > 0) {
          const rows: Unit[] = data.map((r) => ({
            id: r.id,
            name: r.name,
            abbreviation: r.abbreviation,
            type: r.type,
            status: r.status as "Active" | "Inactive",
          }));
          setUnits(rows);
          saveLocal(rows);
        } else {
          // Seed defaults into Supabase if table is empty
          const toSeed = loadUnitsLocal();
          supabase!
            .from("tc_units")
            .insert(
              toSeed.map((u) => ({
                id: u.id,
                name: u.name,
                abbreviation: u.abbreviation,
                type: u.type,
                status: u.status,
              }))
            )
            .then(({ error: seedErr }) => {
              if (seedErr) console.warn("⚠️ Seeding tc_units failed:", seedErr.message);
            });
        }
      });
  }, []);

  const addUnit = async (data: Omit<Unit, "id">) => {
    const newUnit: Unit = { id: `u${Date.now()}`, ...data };
    if (supabase) {
      const { error } = await supabase.from("tc_units").insert({
        id: newUnit.id,
        name: newUnit.name,
        abbreviation: newUnit.abbreviation,
        type: newUnit.type,
        status: newUnit.status,
      });
      if (error) console.error("❌ Supabase insert tc_units:", error.message);
    }
    setUnits((prev) => {
      const next = [newUnit, ...prev];
      saveLocal(next);
      return next;
    });
  };

  const updateUnit = async (id: string, data: Partial<Unit>) => {
    if (supabase) {
      const { error } = await supabase.from("tc_units").update(data).eq("id", id);
      if (error) console.error("❌ Supabase update tc_units:", error.message);
    }
    setUnits((prev) => {
      const next = prev.map((u) => (u.id === id ? { ...u, ...data } : u));
      saveLocal(next);
      return next;
    });
  };

  const deleteUnit = async (id: string) => {
    if (supabase) {
      const { error } = await supabase.from("tc_units").delete().eq("id", id);
      if (error) console.error("❌ Supabase delete tc_units:", error.message);
    }
    setUnits((prev) => {
      const next = prev.filter((u) => u.id !== id);
      saveLocal(next);
      return next;
    });
  };

  const activeUnits = units.filter((u) => u.status === "Active");

  return (
    <UnitsContext.Provider value={{ units, activeUnits, addUnit, updateUnit, deleteUnit }}>
      {children}
    </UnitsContext.Provider>
  );
};

export const useUnits = () => {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error("useUnits must be used inside UnitsProvider");
  return ctx;
};
