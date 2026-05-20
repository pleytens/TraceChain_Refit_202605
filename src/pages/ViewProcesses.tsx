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
  action_key?: string;
  sort_order?: number;
  required_variable_categories?: { who: boolean; when: boolean; what: boolean; where: boolean };
}

interface ActionStep {
  action_id: string;
  step_order: number;
  is_required?: boolean;
  notes?: string;
}

interface ProcessRecord {
  id: string;
  name: string;
  description: string;
  is_final: boolean;
  status: string;
  is_used: boolean;
  sort_order: number;
  process_type?: string | null;
  action_steps?: ActionStep[];
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

// ─── Component ────────────────────────────────────────────────────────────────

const ViewProcesses: React.FC = () => {
  const [processes, setProcesses] = useState<ProcessRecord[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedProcess, setExpandedProcess] = useState<string | null>(null);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"processes" | "actions">("processes");

  useEffect(() => {
    const load = async () => {
      if (!supabase) { setLoading(false); return; }

      // Load action library
      const { data: aData } = await supabase
        .from("tc_action_library")
        .select("id,name,category,description,produces_output,is_system,is_active,action_key,sort_order,required_variable_categories")
        .order("sort_order");
      if (aData) setActions(aData as ActionItem[]);

      // Load processes
      const { data: pData } = await supabase
        .from("tc_processes")
        .select("id,name,description,is_final,status,is_used,sort_order,process_type")
        .order("sort_order");

      if (!pData) { setLoading(false); return; }

      // Load all action steps at once
      const { data: stepsData } = await supabase
        .from("tc_process_action_steps")
        .select("process_id,action_id,step_order,is_required,notes")
        .order("step_order");

      // Group steps by process_id
      const stepsByProcess: Record<string, ActionStep[]> = {};
      if (stepsData) {
        for (const step of stepsData as any[]) {
          if (!stepsByProcess[step.process_id]) stepsByProcess[step.process_id] = [];
          stepsByProcess[step.process_id].push({
            action_id: step.action_id,
            step_order: step.step_order,
            is_required: step.is_required,
            notes: step.notes,
          });
        }
      }

      const merged: ProcessRecord[] = (pData as any[]).map((p) => ({
        ...p,
        action_steps: stepsByProcess[p.id] ?? [],
      }));

      setProcesses(merged);
      setLoading(false);
    };
    load();
  }, []);

  // Helper: pin asset_in at top, asset_out at 2nd, rest by sort_order
  const pinOrder = (p: ProcessRecord) => {
    if (p.process_type === "asset_in") return -2;
    if (p.process_type === "asset_out") return -1;
    return 0;
  };

  const filtered = processes
    .filter((p) => {
      const q = search.toLowerCase();
      return !q || p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const pa = pinOrder(a);
      const pb = pinOrder(b);
      if (pa !== pb) return pa - pb;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

  const getAction = (id: string) => actions.find((a) => a.id === id);

  const statusBadge = (p: ProcessRecord) => {
    const s = p.status?.toUpperCase();
    if (s !== "ACTIVE") {
      return (
        <span className="text-xs bg-gray-100 text-gray-500 border border-gray-200 rounded-full px-2.5 py-0.5 font-medium">
          Inactive
        </span>
      );
    }
    if (p.is_used) {
      return (
        <span className="text-xs bg-red-100 text-red-700 border border-red-200 rounded-full px-2.5 py-0.5 font-medium">
          Active – in use
        </span>
      );
    }
    return (
      <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 font-medium">
        Active – Unused
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <Eye size={18} className="text-blue-500" />
          <h2 className="text-base font-bold text-gray-900">Process & Action</h2>
          <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 font-semibold">
            READ ONLY
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Reference view of all active processes and actions. To configure, go to{" "}
          <strong>Super Admin → Application Settings → Process & Action</strong>.
        </p>

        {/* Tabs */}
        <div className="mt-4 flex gap-1 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("processes")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === "processes"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            🔄 Processes
          </button>
          <button
            onClick={() => setActiveTab("actions")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === "actions"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            📚 Action Library
          </button>
        </div>
      </div>

      {/* Search */}
      {activeTab === "processes" && (
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
      )}

      {/* Processes tab content */}
      {activeTab === "processes" && (
        <>
      {/* Process list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-3">🔄</div>
          <p className="text-gray-600 font-medium">
            {search ? "No processes match your search." : "No processes configured yet."}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Processes are configured by Super Admins under Application Settings → Processes.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table header */}
          <div className="grid grid-cols-[1.8fr_2fr_8rem_8rem_9rem] gap-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div>Process Name</div>
            <div className="hidden md:block">Description</div>
            <div>Type</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {filtered.map((proc) => {
            const isOpen = expandedProcess === proc.id;
            const steps = proc.action_steps ?? [];
            const totalSteps = steps.length + 2; // +2 for START and END
            const isAssetIn  = proc.process_type === "asset_in";
            const isAssetOut = proc.process_type === "asset_out";

            return (
              <div key={proc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Row header */}
                <div
                  className={`grid grid-cols-[1.8fr_2fr_8rem_8rem_9rem] gap-2 px-4 py-3 items-center hover:bg-gray-50/60 transition ${
                    isAssetIn ? "bg-green-50/40" : isAssetOut ? "bg-red-50/40" : ""
                  }`}
                >
                  {/* Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`font-semibold truncate ${
                      isAssetIn  ? "text-green-600" :
                      isAssetOut ? "text-red-500"   :
                      "text-gray-900"
                    }`}>
                      {proc.name}
                    </span>
                    {(isAssetIn || isAssetOut) && (
                      <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded font-semibold ${
                        isAssetIn ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}>
                        {isAssetIn ? "Entry" : "Exit"}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="text-xs text-gray-400 truncate hidden md:block">
                    {proc.description || "—"}
                  </div>

                  {/* Type */}
                  <div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      proc.is_final
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {proc.is_final ? "Final (QR)" : "Interim"}
                    </span>
                  </div>

                  {/* Status */}
                  <div>{statusBadge(proc)}</div>

                  {/* Actions + step count + chevron */}
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-xs text-gray-400 mx-1">{totalSteps} steps</span>
                    <button
                      onClick={() => setExpandedProcess(isOpen ? null : proc.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title={isOpen ? "Collapse" : "Expand"}
                    >
                      {isOpen
                        ? <ChevronDown size={15} className="text-gray-400" />
                        : <ChevronRight size={15} className="text-gray-400" />
                      }
                    </button>
                  </div>
                </div>

                {/* Expanded steps */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-2 bg-gray-50/50">
                    {/* Meta row */}
                    <div className="flex items-center gap-3 mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Process Steps (read-only)</p>
                    </div>

                    {/* PROCESS_START */}
                    <div className="flex items-center gap-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                      <span className="text-xs font-mono font-bold text-red-600 w-6 text-center shrink-0">S</span>
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-red-700">PROCESS_START</span>
                        <span className="ml-2 text-xs text-red-400">auto · system</span>
                      </div>
                    </div>

                    {steps.length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-2">No action steps defined.</p>
                    ) : (
                      steps
                        .slice()
                        .sort((a, b) => a.step_order - b.step_order)
                        .map((step, i) => {
                          const action = getAction(step.action_id);
                          return (
                            <div key={i} className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                              <span className="text-xs font-mono text-gray-400 w-6 text-center shrink-0">{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-gray-800">
                                  {action?.name ?? step.action_id}
                                </span>
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
                                  {step.is_required === false && (
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">
                                      optional
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
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-red-700">PROCESS_END</span>
                        <span className="ml-2 text-xs text-red-400">
                          {proc.is_final ? "issues QR code · locks product" : "destination carries to next process"}
                        </span>
                      </div>
                      {proc.is_final && (
                        <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 rounded px-2 py-0.5 font-medium shrink-0">
                          Issues QR if final
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <p className="text-xs text-gray-400 px-1">
            {filtered.length} process{filtered.length !== 1 ? "es" : ""} shown
          </p>
        </div>
      )}
        </>
      )}

      {/* Action Library tab content */}
      {activeTab === "actions" && (
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading…</div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <p className="text-xs text-gray-500">
                  Read-only view of all actions in the library. Actions are configured by Super Admins.
                </p>
              </div>

              {actions.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="text-4xl mb-3">📚</div>
                  <p className="text-gray-600 font-medium">No actions in the library yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Actions are configured by Super Admins.</p>
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div className="grid grid-cols-[1.8fr_10rem_2fr_7rem_3rem] gap-2 px-5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <div>Action Name</div>
                    <div>Short</div>
                    <div className="hidden md:block">Description</div>
                    <div>Status</div>
                    <div></div>
                  </div>

                  {actions.map((action) => {
                    const isOpen = expandedAction === action.id;
                    return (
                      <div key={action.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Row header */}
                        <div className="grid grid-cols-[1.8fr_10rem_2fr_7rem_3rem] gap-2 px-5 py-3 items-center hover:bg-gray-50/60 transition">
                          {/* Action Name */}
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium text-gray-900 truncate">{action.name}</span>
                            {action.is_system && (
                              <span className="shrink-0 text-xs bg-red-100 text-red-600 rounded px-1.5 py-0.5 font-medium">system</span>
                            )}
                          </div>

                          {/* Short Description (action_key) */}
                          <div>
                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{action.action_key}</code>
                          </div>

                          {/* Description */}
                          <div className="text-xs text-gray-400 truncate hidden md:block">
                            {action.description || "—"}
                          </div>

                          {/* Status */}
                          <div>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                              action.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}>
                              {action.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>

                          {/* Chevron */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => setExpandedAction(isOpen ? null : action.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                              title={isOpen ? "Collapse" : "Expand"}
                            >
                              {isOpen
                                ? <ChevronDown size={15} className="text-gray-400" />
                                : <ChevronRight size={15} className="text-gray-400" />
                              }
                            </button>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isOpen && (
                          <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50 space-y-4">
                            {/* Description */}
                            <div>
                              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</h5>
                              <p className="text-sm text-gray-700">{action.description || "—"}</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <div>
                                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</h5>
                                <span className={`text-xs px-2 py-0.5 rounded font-medium ${CATEGORY_COLORS[action.category] ?? "bg-gray-100 text-gray-600"}`}>
                                  {action.category}
                                </span>
                              </div>
                              <div>
                                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Produces Output</h5>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  action.produces_output ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                }`}>
                                  {action.produces_output ? "Yes" : "No"}
                                </span>
                              </div>
                              <div>
                                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">System Action</h5>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  action.is_system ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"
                                }`}>
                                  {action.is_system ? "Yes" : "No"}
                                </span>
                              </div>
                              <div>
                                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</h5>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  action.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                }`}>
                                  {action.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Action Key</h5>
                                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{action.action_key}</code>
                              </div>
                              <div>
                                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sort Order</h5>
                                <span className="text-sm font-mono text-gray-700">{action.sort_order ?? "—"}</span>
                              </div>
                            </div>

                            {/* Required Attributes */}
                            <div>
                              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Required Attributes</h5>
                              <div className="flex flex-wrap gap-2">
                                {action.required_variable_categories?.who && (
                                  <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 font-medium">
                                    Who
                                  </span>
                                )}
                                {action.required_variable_categories?.when && (
                                  <span className="text-xs bg-green-100 text-green-700 border border-green-200 rounded-full px-2.5 py-0.5 font-medium">
                                    When
                                  </span>
                                )}
                                {action.required_variable_categories?.what && (
                                  <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 rounded-full px-2.5 py-0.5 font-medium">
                                    What
                                  </span>
                                )}
                                {action.required_variable_categories?.where && (
                                  <span className="text-xs bg-purple-100 text-purple-700 border border-purple-200 rounded-full px-2.5 py-0.5 font-medium">
                                    Where
                                  </span>
                                )}
                                {!action.required_variable_categories?.who &&
                                 !action.required_variable_categories?.when &&
                                 !action.required_variable_categories?.what &&
                                 !action.required_variable_categories?.where && (
                                  <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full font-medium">
                                    None
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <p className="text-xs text-gray-400 px-1">
                    {actions.length} action{actions.length !== 1 ? "s" : ""} in library
                  </p>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewProcesses;
