import React, { useState, useEffect, useRef } from "react";
import { Search, X, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { WorkerOption } from "@/types/attribute";

interface Props {
  selectedIds: string[];
  onChange: (ids: string[], workers: WorkerOption[]) => void;
  disabled?: boolean;
}

// Fallback demo workers when Supabase has no tc_users table
const FALLBACK_WORKERS: WorkerOption[] = [
  { id: "w1", name: "John Doe",    email: "john@company.com" },
  { id: "w2", name: "Jane Smith",  email: "jane@company.com" },
  { id: "w3", name: "Alex Martin", email: "alex@company.com" },
];

const PeopleSelector: React.FC<Props> = ({ selectedIds, onChange, disabled = false }) => {
  const [workers, setWorkers] = useState<WorkerOption[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase) { setWorkers(FALLBACK_WORKERS); return; }
    supabase
      .from("tc_users")
      .select("id, first_name, last_name, email")
      .eq("status", "Active")
      .order("first_name")
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          setWorkers(FALLBACK_WORKERS);
          return;
        }
        setWorkers(
          data.map((u: any) => ({
            id: u.id,
            name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.email,
            email: u.email,
          }))
        );
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = workers.filter(
    (w) =>
      !selectedIds.includes(w.id) &&
      (w.name.toLowerCase().includes(query.toLowerCase()) ||
        (w.email ?? "").toLowerCase().includes(query.toLowerCase()))
  );

  const selectedWorkers = workers.filter((w) => selectedIds.includes(w.id));

  const addWorker = (w: WorkerOption) => {
    const newIds = [...selectedIds, w.id];
    const newWorkers = [...selectedWorkers, w];
    onChange(newIds, newWorkers);
    setQuery("");
  };

  const removeWorker = (id: string) => {
    const newIds = selectedIds.filter((i) => i !== id);
    const newWorkers = selectedWorkers.filter((w) => w.id !== id);
    onChange(newIds, newWorkers);
  };

  return (
    <div className="space-y-2" ref={ref}>
      {/* Selected chips */}
      {selectedWorkers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedWorkers.map((w) => (
            <span
              key={w.id}
              className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-medium"
            >
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                {w.name.charAt(0)}
              </span>
              {w.name}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeWorker(w.id)}
                  className="hover:text-blue-600 transition ml-0.5"
                >
                  <X size={11} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      {!disabled && (
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search workers…"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Dropdown */}
          {open && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex items-center gap-2 px-4 py-3 text-xs text-gray-400">
                  <Users size={13} />
                  {query ? "No workers match your search." : "All workers already selected."}
                </div>
              ) : (
                filtered.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => { addWorker(w); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition text-left"
                  >
                    <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                      {w.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{w.name}</p>
                      {w.email && <p className="text-xs text-gray-400">{w.email}</p>}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {disabled && selectedWorkers.length === 0 && (
        <p className="text-xs text-gray-400 italic">No workers selected.</p>
      )}
    </div>
  );
};

export default PeopleSelector;
