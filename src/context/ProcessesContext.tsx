import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export interface ProcessStep {
  name: string;
  dataType: string;
  dropdownOptions?: string;
}

export interface ProcessRecord {
  id: number;
  name: string;
  steps: ProcessStep[];
  createdAt: string;
  isActive: boolean;
}

const STORAGE_KEY = "tc_processes";

const defaultProcesses: ProcessRecord[] = [
  {
    id: 1,
    name: "Rice Farming Process",
    steps: [
      { name: "Land Preparation", dataType: "Text" },
      { name: "Seeding", dataType: "Date" },
      { name: "Irrigation", dataType: "Number" },
      { name: "Harvesting", dataType: "Image" },
      { name: "Packaging", dataType: "Text" },
    ],
    createdAt: "2024-01-10",
    isActive: true,
  },
  {
    id: 2,
    name: "Fish Processing Line A",
    steps: [
      { name: "Receiving", dataType: "Text" },
      { name: "Cleaning", dataType: "Image" },
      { name: "Processing", dataType: "Number" },
    ],
    createdAt: "2024-02-05",
    isActive: true,
  },
  {
    id: 3,
    name: "Dragon Fruit Harvest",
    steps: [
      { name: "Picking", dataType: "Date" },
      { name: "Sorting", dataType: "Text" },
      { name: "Packaging", dataType: "Image" },
      { name: "Dispatch", dataType: "Text" },
    ],
    createdAt: "2024-03-15",
    isActive: false,
  },
  {
    id: 4,
    name: "Pepper Drying Process",
    steps: [
      { name: "Collection", dataType: "Text" },
      { name: "Washing", dataType: "Image" },
      { name: "Sun Drying", dataType: "Date" },
      { name: "Grading", dataType: "Number" },
      { name: "Milling", dataType: "Text" },
      { name: "Packaging", dataType: "Image" },
    ],
    createdAt: "2024-04-02",
    isActive: true,
  },
];

// ── Supabase row type ────────────────────────────────────────────────────────
type DbRow = { id: number; name: string; steps: ProcessStep[]; created_at: string; is_active: boolean };

function rowToRecord(row: DbRow): ProcessRecord {
  return { id: row.id, name: row.name, steps: row.steps, createdAt: row.created_at, isActive: row.is_active };
}

// ── Context ──────────────────────────────────────────────────────────────────
interface ProcessesContextValue {
  processes: ProcessRecord[];
  loading: boolean;
  addProcess: (data: Omit<ProcessRecord, "id" | "createdAt">) => Promise<number>;
  updateProcess: (id: number, data: Partial<ProcessRecord>) => Promise<void>;
  deleteProcess: (id: number) => Promise<void>;
}

const ProcessesContext = createContext<ProcessesContextValue | null>(null);

export const ProcessesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [processes, setProcesses] = useState<ProcessRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabase) {
      supabase
        .from("tc_processes")
        .select("*")
        .order("id", { ascending: false })
        .then(({ data, error }) => {
          if (error || !data || data.length === 0) {
            const rows = defaultProcesses.map((p) => ({
              id: p.id,
              name: p.name,
              steps: p.steps,
              created_at: p.createdAt,
              is_active: p.isActive,
            }));
            supabase!.from("tc_processes").upsert(rows).then(() => {
              setProcesses(defaultProcesses);
              setLoading(false);
            });
          } else {
            setProcesses((data as DbRow[]).map(rowToRecord));
            setLoading(false);
          }
        });
    } else {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as ProcessRecord[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProcesses(parsed);
            setLoading(false);
            return;
          }
        }
      } catch {}
      setProcesses(defaultProcesses);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase && !loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(processes));
    }
  }, [processes, loading]);

  const addProcess = async (data: Omit<ProcessRecord, "id" | "createdAt">): Promise<number> => {
    const createdAt = new Date().toISOString().slice(0, 10);
    if (supabase) {
      const { data: inserted, error } = await supabase
        .from("tc_processes")
        .insert({ name: data.name, steps: data.steps, created_at: createdAt, is_active: data.isActive })
        .select()
        .single();
      if (error) {
        console.error("❌ Supabase insert error (tc_processes):", error.message, error.details, error.hint);
        throw new Error(error.message);
      }
      const newProcess = rowToRecord(inserted as DbRow);
      setProcesses((prev) => [newProcess, ...prev]);
      return newProcess.id;
    } else {
      const id = Date.now();
      const newProcess: ProcessRecord = { id, createdAt, ...data };
      setProcesses((prev) => [newProcess, ...prev]);
      return id;
    }
  };

  const updateProcess = async (id: number, data: Partial<ProcessRecord>) => {
    if (supabase) {
      const dbData: Partial<DbRow> = {};
      if (data.name !== undefined) dbData.name = data.name;
      if (data.steps !== undefined) dbData.steps = data.steps;
      if (data.isActive !== undefined) dbData.is_active = data.isActive;
      await supabase.from("tc_processes").update(dbData).eq("id", id);
    }
    setProcesses((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const deleteProcess = async (id: number) => {
    if (supabase) {
      await supabase.from("tc_processes").delete().eq("id", id);
    }
    setProcesses((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <ProcessesContext.Provider value={{ processes, loading, addProcess, updateProcess, deleteProcess }}>
      {children}
    </ProcessesContext.Provider>
  );
};

export const useProcesses = () => {
  const ctx = useContext(ProcessesContext);
  if (!ctx) throw new Error("useProcesses must be used inside ProcessesProvider");
  return ctx;
};
