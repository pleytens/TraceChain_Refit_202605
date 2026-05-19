import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Search, X, ChevronDown, ChevronRight, Settings, BookOpen, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_ACTIONS as DB_DEFAULT_ACTIONS } from "@/lib/dbInit";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionCategory =
  | "Movement"
  | "Transform · Food"
  | "Transform · Chemical"
  | "Transform · Mfg"
  | "Quality"
  | "Handling"
  | "Control";

interface ActionCustomParam {
  id: string;
  param_name: string;
  param_type: "text" | "number" | "boolean" | "select";
  param_unit: string;
  is_required: boolean;
  sort_order: number;
}

interface ActionLibraryItem {
  id: string;
  action_key: string;
  name: string;
  category: ActionCategory;
  description: string;
  produces_output: boolean;
  custom_param_example: string;
  is_system: boolean;
  is_active: boolean;
  sort_order: number;
  custom_params?: ActionCustomParam[];
}

interface ProcessRecord {
  id: string;
  name: string;
  description: string;
  is_final: boolean;
  sort_order: number;
  status: "ACTIVE" | "INACTIVE";
  action_steps?: { action_id: string; step_order: number; notes: string }[];
}

// ─── Default seeded actions (used when Supabase unavailable) ─────────────────
// Sourced from dbInit.ts to keep a single source of truth
const DEFAULT_ACTIONS: ActionLibraryItem[] = DB_DEFAULT_ACTIONS as ActionLibraryItem[];

const CATEGORY_COLORS: Record<ActionCategory, string> = {
  "Movement": "bg-blue-100 text-blue-700",
  "Transform · Food": "bg-orange-100 text-orange-700",
  "Transform · Chemical": "bg-purple-100 text-purple-700",
  "Transform · Mfg": "bg-pink-100 text-pink-700",
  "Quality": "bg-green-100 text-green-700",
  "Handling": "bg-gray-100 text-gray-700",
  "Control": "bg-red-100 text-red-700",
};

const ALL_CATEGORIES: ActionCategory[] = [
  "Movement",
  "Transform · Food",
  "Transform · Chemical",
  "Transform · Mfg",
  "Quality",
  "Handling",
  "Control",
];

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

// ─── Action Library Modal ─────────────────────────────────────────────────────

interface ActionModalProps {
  action: ActionLibraryItem | null;
  onClose: () => void;
  onSave: (a: Partial<ActionLibraryItem> & { id?: string }) => void;
  existingActions: ActionLibraryItem[];
}

const ActionModal: React.FC<ActionModalProps> = ({ action, onClose, onSave, existingActions }) => {
  const isEdit = !!action && !action.is_system;
  const [form, setForm] = useState({
    name: action?.name ?? "",
    action_key: action?.action_key ?? "",
    category: (action?.category ?? "Movement") as ActionCategory,
    description: action?.description ?? "",
    produces_output: action?.produces_output ?? false,
    custom_param_example: action?.custom_param_example ?? "",
    is_active: action?.is_active ?? true,
  });
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!form.name.trim()) { setError("Action name is required."); return; }
    if (!form.action_key.trim()) { setError("Action key is required."); return; }
    const duplicate = existingActions.find(
      (a) => a.action_key === form.action_key.trim() && a.id !== action?.id
    );
    if (duplicate) { setError("An action with this key already exists."); return; }
    onSave({
      ...(action?.id ? { id: action.id } : {}),
      ...form,
      name: form.name.trim(),
      action_key: form.action_key.trim().toLowerCase().replace(/\s+/g, "_"),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-900">
            {action?.is_system ? "View System Action" : isEdit ? "Edit Action" : "New Action"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {action?.is_system && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>This is a system action and cannot be edited. System actions are automatically managed by TraceChain.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Action Name <span className="text-red-500">*</span>
            </label>
            <input
              disabled={!!action?.is_system}
              type="text"
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(""); }}
              placeholder="e.g. Cook, Mix, Transfer…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Action Key <span className="text-red-500">*</span>
            </label>
            <input
              disabled={!!action?.is_system || isEdit}
              type="text"
              value={form.action_key}
              onChange={(e) => { setForm((f) => ({ ...f, action_key: e.target.value })); setError(""); }}
              placeholder="e.g. cook, mix_blend, transfer…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">Unique identifier. Lowercase with underscores. Cannot be changed after creation.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
            <select
              disabled={!!action?.is_system}
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ActionCategory }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            >
              {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              disabled={!!action?.is_system}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Describe what this action does…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Custom Parameter Example</label>
            <input
              disabled={!!action?.is_system}
              type="text"
              value={form.custom_param_example}
              onChange={(e) => setForm((f) => ({ ...f, custom_param_example: e.target.value }))}
              placeholder="e.g. Temperature (°C), duration…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">Shown as a hint in the process wizard for operators.</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-700">Produces Output?</p>
              <p className="text-xs text-gray-400">If this action transforms input into a new product/material.</p>
            </div>
            <button
              disabled={!!action?.is_system}
              type="button"
              onClick={() => setForm((f) => ({ ...f, produces_output: !f.produces_output }))}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${form.produces_output ? "bg-blue-600" : "bg-gray-300"} disabled:opacity-50`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.produces_output ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          {!action?.is_system && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-700">Active</p>
                <p className="text-xs text-gray-400">Inactive actions are hidden from the process wizard.</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${form.is_active ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition">
            {action?.is_system ? "Close" : "Cancel"}
          </button>
          {!action?.is_system && (
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              {isEdit ? "Save Changes" : "Create Action"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Process Modal ────────────────────────────────────────────────────────────

interface ProcessModalProps {
  process: ProcessRecord | null;
  actions: ActionLibraryItem[];
  onClose: () => void;
  onSave: (p: Omit<ProcessRecord, "id"> & { id?: string }) => void;
}

const ProcessModal: React.FC<ProcessModalProps> = ({ process, actions, onClose, onSave }) => {
  const isEdit = !!process;
  const nonSystemActions = actions.filter((a) => !a.is_system && a.is_active);

  const [form, setForm] = useState({
    name: process?.name ?? "",
    description: process?.description ?? "",
    is_final: process?.is_final ?? false,
    status: (process?.status ?? "ACTIVE") as "ACTIVE" | "INACTIVE",
    action_steps: process?.action_steps ?? [] as { action_id: string; step_order: number; notes: string }[],
  });
  const [error, setError] = useState("");

  const addActionStep = () => {
    setForm((f) => ({
      ...f,
      action_steps: [...f.action_steps, { action_id: nonSystemActions[0]?.id ?? "", step_order: f.action_steps.length + 1, notes: "" }],
    }));
  };

  const removeActionStep = (i: number) => {
    setForm((f) => ({ ...f, action_steps: f.action_steps.filter((_, idx) => idx !== i) }));
  };

  const updateActionStep = (i: number, field: string, val: string) => {
    setForm((f) => ({
      ...f,
      action_steps: f.action_steps.map((s, idx) =>
        idx === i ? { ...s, [field]: val } : s
      ),
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) { setError("Process name is required."); return; }
    onSave({
      ...(process?.id ? { id: process.id } : {}),
      name: form.name.trim(),
      description: form.description.trim(),
      is_final: form.is_final,
      status: form.status,
      sort_order: process?.sort_order ?? 0,
      action_steps: form.action_steps,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 py-10 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-900">
            {isEdit ? "Edit Process" : "New Process"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Process Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError(""); }}
              placeholder="e.g. Raw Material Intake, Transformation, Packaging…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Brief description of this process…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-6">
            <div className="flex items-center justify-between flex-1">
              <div>
                <p className="text-xs font-semibold text-gray-700">Final Process?</p>
                <p className="text-xs text-gray-400">Issues QR code at completion.</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_final: !f.is_final }))}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${form.is_final ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_final ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "ACTIVE" | "INACTIVE" }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Action Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-semibold text-gray-700">Action Steps</p>
                <p className="text-xs text-gray-400">PROCESS_START and PROCESS_END are automatic.</p>
              </div>
              <button
                type="button"
                onClick={addActionStep}
                disabled={nonSystemActions.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition disabled:opacity-40"
              >
                <Plus size={12} /> Add Step
              </button>
            </div>

            {/* Always show system start */}
            <div className="flex items-center gap-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg mb-1.5">
              <span className="text-xs font-mono font-semibold text-red-600 w-6 text-center">S</span>
              <span className="text-xs font-semibold text-red-700">PROCESS_START</span>
              <span className="ml-auto text-xs text-red-400">system · auto</span>
            </div>

            {form.action_steps.map((step, i) => {
              const action = actions.find((a) => a.id === step.action_id);
              return (
                <div key={i} className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-gray-400 font-mono w-6 text-center">{i + 1}</span>
                  <select
                    value={step.action_id}
                    onChange={(e) => updateActionStep(i, "action_id", e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {nonSystemActions.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({a.category})</option>
                    ))}
                  </select>
                  {action && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CATEGORY_COLORS[action.category] ?? "bg-gray-100 text-gray-600"}`}>
                      {action.produces_output ? "→ output" : "no output"}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeActionStep(i)}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}

            {form.action_steps.length === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-3 border border-dashed border-gray-200 rounded-lg">
                No action steps added. Add steps between PROCESS_START and PROCESS_END.
              </p>
            )}

            {/* Always show system end */}
            <div className="flex items-center gap-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg mt-1.5">
              <span className="text-xs font-mono font-semibold text-red-600 w-6 text-center">E</span>
              <span className="text-xs font-semibold text-red-700">PROCESS_END</span>
              <span className="ml-auto text-xs text-red-400">system · issues QR if final</span>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition">Cancel</button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            {isEdit ? "Save Changes" : "Create Process"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "processes" | "action-library";

const SuperAdminProcesses: React.FC = () => {
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "SuperAdmin" || currentUser?.role === "Admin" || currentUser?.role === "TraceChainClientPortalAdmin";

  const [activeTab, setActiveTab] = useState<Tab>("action-library");
  const [loading, setLoading] = useState(true);

  // Action Library state
  const [actions, setActions] = useState<ActionLibraryItem[]>([]);
  const [actionSearch, setActionSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionCategory | "All">("All");
  const [showActionModal, setShowActionModal] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionLibraryItem | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(ALL_CATEGORIES));

  // Processes state
  const [processes, setProcesses] = useState<ProcessRecord[]>([]);
  const [processSearch, setProcessSearch] = useState("");
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [editingProcess, setEditingProcess] = useState<ProcessRecord | null>(null);

  // Load action library
  useEffect(() => {
    const loadActions = async () => {
      if (supabase) {
        const { data, error } = await supabase
          .from("tc_action_library")
          .select("*")
          .order("sort_order", { ascending: true });
        if (!error && data && data.length > 0) {
          const items = data.map((r) => ({
            id: r.id,
            action_key: r.action_key,
            name: r.name,
            category: r.category as ActionCategory,
            description: r.description,
            produces_output: r.produces_output,
            custom_param_example: r.custom_param_example,
            is_system: r.is_system,
            is_active: r.is_active,
            sort_order: r.sort_order,
          }));
          setActions(items);
          localStorage.setItem(LS_ACTIONS_KEY, JSON.stringify(items));
        } else {
          const local = loadFromLS<ActionLibraryItem[]>(LS_ACTIONS_KEY, DEFAULT_ACTIONS);
          setActions(local);
          // Seed if empty
          if (!error && data && data.length === 0) {
            supabase!.from("tc_action_library").insert(
              DEFAULT_ACTIONS.map((a) => ({
                id: a.id, action_key: a.action_key, name: a.name,
                category: a.category, description: a.description,
                produces_output: a.produces_output, custom_param_example: a.custom_param_example,
                is_system: a.is_system, is_active: a.is_active, sort_order: a.sort_order,
              }))
            ).then(({ error: e }) => { if (e) console.warn("Seed action_library:", e.message); });
          }
        }
      } else {
        setActions(loadFromLS<ActionLibraryItem[]>(LS_ACTIONS_KEY, DEFAULT_ACTIONS));
      }

      // Load processes
      if (supabase) {
        const { data, error } = await supabase.from("tc_processes").select("*").order("sort_order");
        if (!error && data) {
          const procs = data.map((r) => ({
            id: r.id, name: r.name, description: r.description,
            is_final: r.is_final, sort_order: r.sort_order, status: r.status,
          }));
          setProcesses(procs);
          localStorage.setItem(LS_PROCESSES_KEY, JSON.stringify(procs));
        }
      } else {
        setProcesses(loadFromLS<ProcessRecord[]>(LS_PROCESSES_KEY, []));
      }

      setLoading(false);
    };
    loadActions();
  }, []);

  // ── Action CRUD ──────────────────────────────────────────────────────────────

  const handleSaveAction = async (a: Partial<ActionLibraryItem> & { id?: string }) => {
    const isNew = !a.id;
    const newId = a.id ?? `act_custom_${Date.now()}`;
    const maxOrder = Math.max(0, ...actions.filter((x) => !x.is_system).map((x) => x.sort_order));

    const fullAction: ActionLibraryItem = {
      id: newId,
      action_key: a.action_key ?? newId,
      name: a.name ?? "",
      category: a.category ?? "Movement",
      description: a.description ?? "",
      produces_output: a.produces_output ?? false,
      custom_param_example: a.custom_param_example ?? "",
      is_system: false,
      is_active: a.is_active ?? true,
      sort_order: isNew ? maxOrder + 1 : (actions.find((x) => x.id === a.id)?.sort_order ?? 0),
    };

    if (supabase) {
      if (isNew) {
        const { error } = await supabase.from("tc_action_library").insert({
          id: fullAction.id, action_key: fullAction.action_key, name: fullAction.name,
          category: fullAction.category, description: fullAction.description,
          produces_output: fullAction.produces_output, custom_param_example: fullAction.custom_param_example,
          is_system: false, is_active: fullAction.is_active, sort_order: fullAction.sort_order,
        });
        if (error) { console.error("Insert action_library:", error.message); return; }
      } else {
        const { error } = await supabase.from("tc_action_library").update({
          name: fullAction.name, category: fullAction.category,
          description: fullAction.description, produces_output: fullAction.produces_output,
          custom_param_example: fullAction.custom_param_example, is_active: fullAction.is_active,
        }).eq("id", fullAction.id);
        if (error) { console.error("Update action_library:", error.message); return; }
      }
    }

    setActions((prev) => {
      const next = isNew
        ? [...prev, fullAction]
        : prev.map((x) => (x.id === fullAction.id ? fullAction : x));
      localStorage.setItem(LS_ACTIONS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteAction = async (id: string) => {
    if (!confirm("Delete this action? It may be used in existing processes.")) return;
    if (supabase) {
      const { error } = await supabase.from("tc_action_library").delete().eq("id", id);
      if (error) { console.error("Delete action:", error.message); return; }
    }
    setActions((prev) => {
      const next = prev.filter((a) => a.id !== id);
      localStorage.setItem(LS_ACTIONS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleToggleActive = async (action: ActionLibraryItem) => {
    if (action.is_system) return;
    const newVal = !action.is_active;
    if (supabase) {
      await supabase.from("tc_action_library").update({ is_active: newVal }).eq("id", action.id);
    }
    setActions((prev) => {
      const next = prev.map((a) => a.id === action.id ? { ...a, is_active: newVal } : a);
      localStorage.setItem(LS_ACTIONS_KEY, JSON.stringify(next));
      return next;
    });
  };

  // ── Process CRUD ─────────────────────────────────────────────────────────────

  const handleSaveProcess = async (p: Omit<ProcessRecord, "id"> & { id?: string }) => {
    const isNew = !p.id;
    const newId = p.id ?? `proc_${Date.now()}`;

    if (supabase) {
      if (isNew) {
        const { error } = await supabase.from("tc_processes").insert({
          id: newId, name: p.name, description: p.description,
          is_final: p.is_final, sort_order: p.sort_order, status: p.status,
        });
        if (error) { console.error("Insert process:", error.message); return; }
      } else {
        const { error } = await supabase.from("tc_processes").update({
          name: p.name, description: p.description,
          is_final: p.is_final, status: p.status,
        }).eq("id", p.id!);
        if (error) { console.error("Update process:", error.message); return; }
      }
    }

    const full: ProcessRecord = { ...p, id: newId, action_steps: p.action_steps };
    setProcesses((prev) => {
      const next = isNew ? [full, ...prev] : prev.map((x) => (x.id === full.id ? full : x));
      localStorage.setItem(LS_PROCESSES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteProcess = async (id: string) => {
    const proc = processes.find((p) => p.id === id);
    if (!confirm(`Delete process "${proc?.name}"? This cannot be undone.`)) return;
    if (supabase) {
      const { error } = await supabase.from("tc_processes").delete().eq("id", id);
      if (error) { console.error("Delete process:", error.message); return; }
    }
    setProcesses((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem(LS_PROCESSES_KEY, JSON.stringify(next));
      return next;
    });
  };

  // ── Grouped actions for display ──────────────────────────────────────────────

  const filteredActions = actions.filter((a) => {
    const q = actionSearch.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.action_key.includes(q) || a.description.toLowerCase().includes(q);
    const matchCat = actionFilter === "All" || a.category === actionFilter;
    return matchSearch && matchCat;
  });

  const groupedActions = ALL_CATEGORIES.reduce<Record<string, ActionLibraryItem[]>>((acc, cat) => {
    acc[cat] = filteredActions.filter((a) => a.category === cat);
    return acc;
  }, {});

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const filteredProcesses = processes.filter((p) => {
    const q = processSearch.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-gray-600 font-medium">Super Admin Access Required</p>
        <p className="text-sm text-gray-400 mt-1">Only Super Admins can configure processes and the action library.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Super Admin → Processes</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Configure processes and manage the Action Library used by operators in the process wizard.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertCircle size={13} />
            <span>Changes here affect all operators immediately. <strong>Super Admin only.</strong></span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-1 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("action-library")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === "action-library"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <BookOpen size={14} />
            Action Library
          </button>
          <button
            onClick={() => setActiveTab("processes")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === "processes"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Settings size={14} />
            Processes
            {processes.length > 0 && (
              <span className="ml-1 text-xs bg-gray-200 text-gray-600 rounded-full px-1.5">{processes.length}</span>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading…</div>
      ) : (
        <>
          {/* ── Action Library Tab ──────────────────────────────────────────── */}
          {activeTab === "action-library" && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search actions…"
                    value={actionSearch}
                    onChange={(e) => setActionSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value as ActionCategory | "All")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Categories</option>
                  {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <button
                  onClick={() => { setEditingAction(null); setShowActionModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition ml-auto"
                >
                  <Plus size={14} /> Add Custom Action
                </button>
              </div>

              {/* Grouped by category */}
              {ALL_CATEGORIES.map((cat) => {
                const items = groupedActions[cat] ?? [];
                if (items.length === 0) return null;
                const isOpen = expandedCategories.has(cat);

                return (
                  <div key={cat} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${CATEGORY_COLORS[cat as ActionCategory] ?? "bg-gray-100 text-gray-600"}`}>
                          {cat}
                        </span>
                        <span className="text-xs text-gray-400">{items.length} action{items.length !== 1 ? "s" : ""}</span>
                      </div>
                      {isOpen ? <ChevronDown size={15} className="text-gray-400" /> : <ChevronRight size={15} className="text-gray-400" />}
                    </button>

                    {isOpen && (
                      <div className="border-t border-gray-100">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Key</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Description</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Output</th>
                              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {items.map((action) => (
                              <tr key={action.id} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{action.name}</span>
                                    {action.is_system && (
                                      <span className="text-xs bg-red-100 text-red-600 rounded px-1.5 py-0.5 font-medium">system</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-2.5 hidden md:table-cell">
                                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{action.action_key}</code>
                                </td>
                                <td className="px-4 py-2.5 text-gray-500 text-xs max-w-xs truncate hidden lg:table-cell">
                                  {action.description || "—"}
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${action.produces_output ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                    {action.produces_output ? "Yes" : "No"}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5">
                                  {action.is_system ? (
                                    <span className="text-xs text-gray-400">—</span>
                                  ) : (
                                    <button
                                      onClick={() => handleToggleActive(action)}
                                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition ${action.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                    >
                                      {action.is_active ? "Active" : "Inactive"}
                                    </button>
                                  )}
                                </td>
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => { setEditingAction(action); setShowActionModal(true); }}
                                      className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                                      title={action.is_system ? "View" : "Edit"}
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    {!action.is_system && (
                                      <button
                                        onClick={() => handleDeleteAction(action.id)}
                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Delete"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}

              <p className="text-xs text-gray-400 px-1">
                {filteredActions.length} action{filteredActions.length !== 1 ? "s" : ""} shown ·{" "}
                {actions.filter((a) => a.is_active).length} active ·{" "}
                {actions.filter((a) => a.is_system).length} system (non-editable)
              </p>
            </div>
          )}

          {/* ── Processes Tab ──────────────────────────────────────────────── */}
          {activeTab === "processes" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search processes…"
                    value={processSearch}
                    onChange={(e) => setProcessSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => { setEditingProcess(null); setShowProcessModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus size={14} /> New Process
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {filteredProcesses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-4xl mb-3">🔄</div>
                    <p className="text-gray-600 font-medium">No processes configured</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first process to define the action sequences operators follow.</p>
                    <button
                      onClick={() => { setEditingProcess(null); setShowProcessModal(true); }}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                      + Create First Process
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Process Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Steps</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProcesses.map((proc) => (
                        <tr key={proc.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-medium text-gray-900">{proc.name}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate hidden md:table-cell">
                            {proc.description || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {(proc.action_steps?.length ?? 0) + 2} steps
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${proc.is_final ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                              {proc.is_final ? "Final (QR)" : "Interim"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${proc.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                              {proc.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => { setEditingProcess(proc); setShowProcessModal(true); }}
                                className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteProcess(proc.id)}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showActionModal && (
        <ActionModal
          action={editingAction}
          onClose={() => { setShowActionModal(false); setEditingAction(null); }}
          onSave={handleSaveAction}
          existingActions={actions}
        />
      )}
      {showProcessModal && (
        <ProcessModal
          process={editingProcess}
          actions={actions}
          onClose={() => { setShowProcessModal(false); setEditingProcess(null); }}
          onSave={handleSaveProcess}
        />
      )}
    </div>
  );
};

export default SuperAdminProcesses;
