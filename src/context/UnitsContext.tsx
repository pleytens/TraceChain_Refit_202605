import React, { createContext, useContext, useState, ReactNode } from "react";

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

function loadUnits(): Unit[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Unit[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return defaultUnits;
}

interface UnitsContextValue {
  units: Unit[];
  activeUnits: Unit[];
  addUnit: (data: Omit<Unit, "id">) => void;
  updateUnit: (id: string, data: Partial<Unit>) => void;
  deleteUnit: (id: string) => void;
}

const UnitsContext = createContext<UnitsContextValue | null>(null);

export const UnitsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [units, setUnits] = useState<Unit[]>(loadUnits);

  const persist = (next: Unit[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUnits(next);
  };

  const addUnit = (data: Omit<Unit, "id">) => {
    const newUnit: Unit = { id: `u${Date.now()}`, ...data };
    persist([newUnit, ...units]);
  };

  const updateUnit = (id: string, data: Partial<Unit>) => {
    persist(units.map((u) => (u.id === id ? { ...u, ...data } : u)));
  };

  const deleteUnit = (id: string) => {
    persist(units.filter((u) => u.id !== id));
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
