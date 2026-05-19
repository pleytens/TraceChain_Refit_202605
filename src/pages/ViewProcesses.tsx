import React, { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronRight, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionCategory =
  | "Movement"
  | "Transform · Food"
  | "Transform · Chemical"
  | "Transform · Mfg"
  | "Quality"
  | "Handling"
  | "Control";

interface ActionItem {
  id: string;
  name: string;
  category: ActionCategory;
  description: string;
  produces_output: boolean;
  is_system: boolean;
  is_active: boolean;
}

interface ProcessRecord {
  id: string;
  name: string;
  description: string;
  is_final: boolean;
  status: string;
  sort_order: number;
  action_steps?: { action_id: string; step_order: number }[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "Movement": "bg-blue-100 text-blue-700",
  "Transform · Food": "bg-orange-100 text-orange-700",
  "Transform · Chemical": "bg-purple-100 text-purple-700",
  "Transform · Mfg": "bg-pink-100 text-pink-700",
  "Quality": "bg-green-100 text-green-700",
  "Handling": "bg-gray-100 text-gray-700",
  "Control": "bg-red-100 text-red-700",
};

const LS_ACTIONS_KEY = "tc_action_library";
const LS_PROCESSES_KEY = "tc_processes";

function loadFromLS<T>(key: string, fallback: T): T {
  try {
    const r = localStorage.getItem(key);
    return r ? (JSON.parse(r) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const ViewProcesses: React.FC = () => {
  const [processes, setProcesses] = useState<ProcessRecord[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedProcess, setExpandedProcess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      // Load actions
      if (supabase) {
        const { data: aData } = await supabase
          .from("tc_action_library")
          .select("id,name,category,description,produces_output,is_system,is_active")
          .order("sort_order");
        if (aData) setActions(aData as ActionItem[]);
        else setActions(loadFromLS<ActionItem[]>(LS_ACTIONS_KEY, []));

        const { data: pData } = await supabase
          .from("tc_processes")
          .select("*")
          .order("sort_order");
        if (pData) setProcesses(pData as ProcessRecord[]);
        else setProcesses(loadFromLS<ProcessRecord[]>(LS_PROCESSES_KEY, []));
      } else {
        setActions(loadFromLS<ActionItem[]>(LS_ACTIONS_KEY, []));
        setProcesses(loadFromLS<ProcessRecord[]>(LS_PROCESSES_KEY, []));
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = processes.filter((p) => {
    const q = search.toLowerCase();
    return p.status === "ACTIVE" && (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  });

  const getAction = (id: string) => actions.find((a) => a.id === id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <Eye size={18} className="text-blue-500" />
          <h2 className="text-base font-bold text-gray-900">View → Processes</h2>
          <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 font-semibold">
            READ ONLY
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Reference view of all active processes. To configure processes, go to{" "}
          <strong>Super Admin → Application Settings → Processes</strong>.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search processes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Process list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-3">🔄</div>
          <p className="text-gray-600 font-medium">
            {search ? "No processes match your search." : "No active processes configured yet."}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Processes are configured by Super Admins under Application Settings → Processes.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((proc) => {
            const isOpen = expandedProcess === proc.id;
            const steps = proc.action_steps ?? [];

            return (
              <div key={proc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Row header */}
                <button
                  onClick={() => setExpandedProcess(isOpen ? null : proc.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{proc.name}</span>
                      {proc.is_final && (
                        <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2.5 py-0.5 font-medium">
                          Final · Issues QR
                        </span>
                      )}
                    </div>
                    {proc.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{proc.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400">{steps.length + 2} steps</span>
                    {isOpen ? (
                      <ChevronDown size={15} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={15} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded steps */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-2 bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Process Steps (read-only)</p>

                    {/* PROCESS_START */}
                    <div className="flex items-center gap-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                      <span className="text-xs font-mono font-bold text-red-600 w-6 text-center shrink-0">S</span>
                      <div>
                        <span className="text-xs font-semibold text-red-700">PROCESS_START</span>
                        <span className="ml-2 text-xs text-red-400">auto · system</span>
                      </div>
                    </div>

                    {steps.length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-2">No action steps defined.</p>
                    ) : (
                      steps
                        .sort((a, b) => a.step_order - b.step_order)
                        .map((step, i) => {
                          const action = getAction(step.action_id);
                          return (
                            <div key={i} className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                              <span className="text-xs font-mono text-gray-400 w-6 text-center shrink-0">{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-gray-800">{action?.name ?? step.action_id}</span>
                                {action?.description && (
                                  <p className="text-xs text-gray-400 mt-0.5 truncate">{action.description}</p>
                                )}
                              </div>
                              {action && (
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${CATEGORY_COLORS[action.category] ?? "bg-gray-100 text-gray-600"}`}>
                                    {action.category}
                                  </span>
                                  {action.produces_output && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                                      → output
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                    )}

                    {/* PROCESS_END */}
                    <div className="flex items-center gap-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                      <span className="text-xs font-mono font-bold text-red-600 w-6 text-center shrink-0">E</span>
                      <div>
                        <span className="text-xs font-semibold text-red-700">PROCESS_END</span>
                        <span className="ml-2 text-xs text-red-400">
                          {proc.is_final ? "issues QR code · locks product" : "destination carries to next process"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <p className="text-xs text-gray-400 px-1">
            {filtered.length} active process{filtered.length !== 1 ? "es" : ""} shown
          </p>
        </div>
      )}
    </div>
  );
};

export default ViewProcesses;
