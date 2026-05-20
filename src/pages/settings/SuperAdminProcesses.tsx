import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit2, Search, X, ChevronDown, ChevronRight, Settings, BookOpen, AlertCircle, Eye, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_ACTIONS as DB_DEFAULT_ACTIONS } from "@/lib/dbInit";
import NewActionModal from "@/components/actions/NewActionModal";
import type { ActionAttributes } from "@/types/attribute";
// ActionLibraryRow from @/types/action is structurally identical to ActionLibraryItem below

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
  is_used: boolean;
  sort_order: number;
  required_variable_categories?: { who: boolean; when: boolean; what: boolean; where: boolean };
  custom_params?: ActionCustomParam[];
}

export interface ActionStepVariableDetails {
  what: boolean;
  who: boolean;
  when: boolean;
  where: boolean;
}

interface ProcessRecord {
  id: string;
  name: string;
  description: string;
  is_final: boolean;
  sort_order: number;
  status: "ACTIVE" | "INACTIVE";
  is_used: boolean;
  process_type?: string | null;
  action_steps?: { action_id: string; step_order: number; notes: string; variable_details?: ActionStepVariableDetails }[];
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

// ActionModal is replaced by NewActionModal (wizard) – see src/components/actions/NewActionModal.tsx

// ─── Process Modal ────────────────────────────────────────────────────────────

interface ProcessModalProps {
  process: ProcessRecord | null;
  actions: ActionLibraryItem[];
  onClose: () => void;
  onSave: (p: Omit<ProcessRecord, "id"> & { id?: string }) => Promise<void>;
  onStatusUpdated?: (id: string, status: "ACTIVE" | "INACTIVE") => void;
}

// Status-change confirmation modal
const StatusConfirmModal: React.FC<{ onConfirm: () => void | Promise<void>; onCancel: () => void }> = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertTriangle size={16} className="text-amber-600" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900">Confirm Status Change</h4>
          <p className="text-xs text-gray-500 mt-1">
            Changing status to <strong>Active</strong> is permanent for this edit session. You will not be able to modify action steps again without setting the process to Inactive first.
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition">
          Confirm Active
        </button>
      </div>
    </div>
  </div>
);

const ProcessModal: React.FC<ProcessModalProps> = ({ process, actions, onClose, onSave, onStatusUpdated }) => {
  const isEdit = !!process;
  const isNewProcess = !process;
  const nonSystemActions = actions.filter((a) => !a.is_system && a.is_active);

  // Track original status to detect if this process has recordings (used)
  const isUsedInRecordings = process?.is_used === true;

  const [form, setForm] = useState({
    name: process?.name ?? "",
    description: process?.description ?? "",
    is_final: process?.is_final ?? false,
    status: (process?.status || "INACTIVE") as "ACTIVE" | "INACTIVE",
    action_steps: process?.action_steps ?? [] as { action_id: string; step_order: number; notes: string; variable_details?: ActionStepVariableDetails }[],
  });
  const [error, setError] = useState("");

  // Track if user changed from Active → Inactive within this session (one-time)
  const [statusChangedToActive, setStatusChangedToActive] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const pendingStatusRef = useRef<"ACTIVE" | "INACTIVE" | null>(null);

  // The SAVED status in the DB (original process status before any pending changes)
  const savedStatus = process?.status ?? "INACTIVE";

  // Determine edit permissions based on SAVED status (not pending form status)
  // A process is read-only only if it is ALREADY ACTIVE in the DB
  const isActiveProcess = !isNewProcess && savedStatus === "ACTIVE";
  // Fields and steps are editable unless the saved process is active or used in recordings
  const canEditFields = !isUsedInRecordings && (savedStatus === "INACTIVE" || isNewProcess);
  const canEditSteps = canEditFields;

  const handleStatusChange = (newStatus: "ACTIVE" | "INACTIVE") => {
    if (newStatus === "ACTIVE" && form.status === "INACTIVE") {
      // Show confirmation warning before switching to Active
      pendingStatusRef.current = newStatus;
      setShowStatusConfirm(true);
    } else {
      // For any other transition (e.g., ACTIVE → INACTIVE), just update local state
      setForm((f) => ({ ...f, status: newStatus }));
    }
  };

  const confirmStatusChange = () => {
    const newStatus = pendingStatusRef.current;
    if (newStatus) {
      // Only update local form state — do NOT save to DB yet.
      // The status will be saved when the user clicks "Save Changes".
      setForm((f) => ({ ...f, status: newStatus }));
      setStatusChangedToActive(true);
    }
    setShowStatusConfirm(false);
    pendingStatusRef.current = null;
  };

  const cancelStatusChange = () => {
    setShowStatusConfirm(false);
    pendingStatusRef.current = null;
  };

  const addActionStep = () => {
    if (!canEditSteps) return;
    const defaultAction = nonSystemActions[0];
    const defaultVd = defaultAction?.required_variable_categories
      ? {
          what: defaultAction.required_variable_categories.what ?? false,
          who: defaultAction.required_variable_categories.who ?? false,
          when: defaultAction.required_variable_categories.when ?? false,
          where: defaultAction.required_variable_categories.where ?? false,
        }
      : { what: false, who: false, when: false, where: false };
    setForm((f) => ({
      ...f,
      action_steps: [...f.action_steps, { action_id: defaultAction?.id ?? "", step_order: f.action_steps.length + 1, notes: "", variable_details: defaultVd }],
    }));
  };

  const removeActionStep = (i: number) => {
    if (!canEditSteps) return;
    setForm((f) => ({ ...f, action_steps: f.action_steps.filter((_, idx) => idx !== i) }));
  };

  const updateActionStep = (i: number, field: string, val: string) => {
    if (!canEditSteps) return;
    setForm((f) => ({
      ...f,
      action_steps: f.action_steps.map((s, idx) => {
        if (idx !== i) return s;
        const updated = { ...s, [field]: val };
        // When changing the action, auto-populate variable_details from the new action's required_variable_categories
        if (field === "action_id") {
          const newAction = actions.find((a) => a.id === val);
          if (newAction?.required_variable_categories) {
            updated.variable_details = {
              what: newAction.required_variable_categories.what ?? false,
              who: newAction.required_variable_categories.who ?? false,
              when: newAction.required_variable_categories.when ?? false,
              where: newAction.required_variable_categories.where ?? false,
            };
          }
        }
        return updated;
      }),
    }));
  };

  const toggleVariableDetail = (i: number, key: keyof ActionStepVariableDetails) => {
    if (!canEditSteps) return;
    setForm((f) => ({
      ...f,
      action_steps: f.action_steps.map((s, idx) =>
        idx === i
          ? {
              ...s,
              variable_details: {
                ...(s.variable_details ?? { what: false, who: false, when: false, where: false }),
                [key]: !(s.variable_details?.[key] ?? false),
              },
            }
          : s
      ),
    }));
  };

  // Save button: disabled if < 1 user step (i.e. only START+END = 2 total logical steps)
  const canSave = form.action_steps.length >= 1;

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Process name is required."); return; }
    if (!canSave) { setError("Minimum 3 steps required (START + END + 1 action)."); return; }
    setSaving(true);
    await onSave({
      ...(process?.id ? { id: process.id } : {}),
      name: form.name.trim(),
      description: form.description.trim(),
      is_final: form.is_final,
      status: form.status,
      sort_order: process?.sort_order ?? 0,
      is_used: process?.is_used ?? false,
      process_type: process?.process_type ?? null,
      action_steps: form.action_steps,
    });
    setSaving(false);
    onClose();
  };

  // Action row icon logic
  const getStepIcons = (i: number) => {
    if (isUsedInRecordings) {
      return (
        <button
          type="button"
          title="Read-only (Used in Recordings)"
          className="p-1 text-gray-400 rounded"
        >
          <Eye size={13} />
        </button>
      );
    }
    if (form.status === "INACTIVE" || isNewProcess) {
      return (
        <button
          type="button"
          onClick={() => removeActionStep(i)}
          title="Delete action"
          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
        >
          <Trash2 size={12} />
        </button>
      );
    }
    // Active (Unused) — read-only
    return (
      <button
        type="button"
        title="Read-only (set status to Inactive to modify)"
        className="p-1 text-gray-400 rounded cursor-default"
      >
        <Eye size={13} />
      </button>
    );
  };

  return (
    <>
      {showStatusConfirm && (
        <StatusConfirmModal onConfirm={confirmStatusChange} onCancel={cancelStatusChange} />
      )}

      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 py-10 px-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-bold text-gray-900">
              {isEdit ? "Edit Process" : "New Process"}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Process Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Process Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => { if (!isActiveProcess && !isUsedInRecordings) { setForm((f) => ({ ...f, name: e.target.value })); setError(""); } }}
                readOnly={isActiveProcess || isUsedInRecordings}
                placeholder="e.g. Raw Material Intake, Transformation, Packaging…"
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isActiveProcess || isUsedInRecordings ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => { if (!isActiveProcess && !isUsedInRecordings) setForm((f) => ({ ...f, description: e.target.value })); }}
                readOnly={isActiveProcess || isUsedInRecordings}
                rows={2}
                placeholder="Brief description of this process…"
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${isActiveProcess || isUsedInRecordings ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* ── Action Steps (moved ABOVE Final Process / Status) ─────────── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-semibold text-gray-700">Action Steps</p>
                  <p className="text-xs text-gray-400">PROCESS_START and PROCESS_END are automatic.</p>
                </div>
                <button
                  type="button"
                  onClick={addActionStep}
                  disabled={nonSystemActions.length === 0 || !canEditSteps}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  title={!canEditSteps ? "Set status to Inactive to add steps" : "Add step"}
                >
                  <Plus size={12} /> Add Step
                </button>
              </div>

              {/* System START */}
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg mb-1.5">
                <span className="text-xs font-mono font-semibold text-gray-500 w-6 text-center">S</span>
                <span className="text-xs font-semibold text-gray-600">PROCESS_START</span>
                <span className="ml-auto text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-medium">system</span>
                <span className="text-xs text-gray-400">auto</span>
              </div>

              {form.action_steps.map((step, i) => {
                const action = actions.find((a) => a.id === step.action_id);
                const rowEditable = canEditSteps;
                const vd = step.variable_details ?? { what: false, who: false, when: false, where: false };
                const VD_LABELS: { key: keyof ActionStepVariableDetails; label: string; color: string }[] = [
                  { key: "what",  label: "What",  color: "orange" },
                  { key: "who",   label: "Who",   color: "blue"   },
                  { key: "when",  label: "When",  color: "green"  },
                  { key: "where", label: "Where", color: "purple" },
                ];
                return (
                  <div
                    key={i}
                    className={`mb-1.5 rounded-lg border transition ${
                      rowEditable ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <span className="text-xs text-gray-400 font-mono w-6 text-center shrink-0">{i + 1}</span>
                      {rowEditable ? (
                        <select
                          value={step.action_id}
                          onChange={(e) => updateActionStep(i, "action_id", e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {nonSystemActions.map((a) => (
                            <option key={a.id} value={a.id}>{a.name} ({a.category})</option>
                          ))}
                        </select>
                      ) : (
                        <span className="flex-1 text-xs text-gray-700 font-medium truncate">
                          {action?.name ?? "Unknown action"}
                        </span>
                      )}
                      {action && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${CATEGORY_COLORS[action.category] ?? "bg-gray-100 text-gray-600"}`}>
                          {action.produces_output ? "→ output" : "no output"}
                        </span>
                      )}
                      {getStepIcons(i)}
                    </div>
                    {/* Variable Details: What / Who / When / Where */}
                    <div className="flex items-center gap-1.5 px-3 pb-2">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mr-1">Attributes:</span>
                      {VD_LABELS.map(({ key, label, color }) => {
                        const active = vd[key];
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => rowEditable && toggleVariableDetail(i, key)}
                            disabled={!rowEditable}
                            title={rowEditable ? `Toggle ${label}` : "Set Inactive to edit"}
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border transition ${
                              active
                                ? color === "orange"
                                  ? "bg-orange-100 text-orange-700 border-orange-300"
                                  : color === "blue"
                                  ? "bg-blue-100 text-blue-700 border-blue-300"
                                  : color === "green"
                                  ? "bg-green-100 text-green-700 border-green-300"
                                  : "bg-purple-100 text-purple-700 border-purple-300"
                                : "bg-gray-50 text-gray-400 border-gray-200"
                            } disabled:cursor-not-allowed`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {form.action_steps.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-3 border border-dashed border-gray-200 rounded-lg">
                  No action steps added. Add steps between PROCESS_START and PROCESS_END.
                </p>
              )}

              {/* System END */}
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg mt-1.5">
                <span className="text-xs font-mono font-semibold text-gray-500 w-6 text-center">E</span>
                <span className="text-xs font-semibold text-gray-600">PROCESS_END</span>
                <span className="ml-auto text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-medium">system</span>
                <span className="text-xs text-gray-400">issues QR if final</span>
              </div>
            </div>

            {/* ── Final Process + Status (moved BELOW action steps) ─────────── */}
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
                  onChange={(e) => handleStatusChange(e.target.value as "ACTIVE" | "INACTIVE")}
                  disabled={isUsedInRecordings}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="INACTIVE">Inactive</option>
                  <option value="ACTIVE">Active</option>
                </select>
                {form.status === "ACTIVE" && isActiveProcess && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertTriangle size={10} /> Set to Inactive to edit steps.
                  </p>
                )}
              </div>
            </div>

            {/* Minimum steps warning — only relevant when editing/creating (not for read-only Active) */}
            {!canSave && !isActiveProcess && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700">
                  Minimum 3 steps required (START + END + 1 action). Add at least one action step.
                </p>
              </div>
            )}

            {isActiveProcess && !isUsedInRecordings && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
                <AlertCircle size={14} className="text-blue-500 shrink-0" />
                <p className="text-xs text-blue-700">
                  This process is <strong>Active</strong> and is read-only. Set status to <strong>Inactive</strong> to edit name, description, or action steps.
                </p>
              </div>
            )}

            {!isActiveProcess && statusChangedToActive && form.status === "ACTIVE" && !isUsedInRecordings && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700">
                  Status set to <strong>Active</strong>. Click <strong>Save Changes</strong> to apply. Once saved, name, description, and steps will be read-only.
                </p>
              </div>
            )}

            {isUsedInRecordings && (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                <Eye size={14} className="text-gray-500 shrink-0" />
                <p className="text-xs text-gray-600">
                  This process has been used in recordings and is <strong>read-only</strong>.
                </p>
              </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition disabled:opacity-40">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave || isUsedInRecordings || saving}
              title={
                isUsedInRecordings
                  ? "Process is used in recordings and cannot be modified"
                  : !canSave
                  ? "Add at least 1 action step to save"
                  : ""
              }
              className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Process"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "processes" | "action-library";

const SuperAdminProcesses: React.FC = () => {
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "SuperAdmin" || currentUser?.role === "Admin" || currentUser?.role === "TraceChainClientPortalAdmin";

  const [activeTab, setActiveTab] = useState<Tab>("processes");
  const [loading, setLoading] = useState(true);

  // Action Library state
  const [actions, setActions] = useState<ActionLibraryItem[]>([]);
  const [actionSearch, setActionSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionCategory | "All">("All");
  const [showActionModal, setShowActionModal] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionLibraryItem | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(ALL_CATEGORIES));
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  // Processes state
  const [processes, setProcesses] = useState<ProcessRecord[]>([]);
  const [processSearch, setProcessSearch] = useState("");
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [editingProcess, setEditingProcess] = useState<ProcessRecord | null>(null);
  const [expandedProcessId, setExpandedProcessId] = useState<string | null>(null);

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
            is_used: r.is_used ?? false,
            sort_order: r.sort_order,
            required_variable_categories: r.required_variable_categories ?? { who: false, when: false, what: false, where: false },
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
        const [{ data: pData, error: pErr }, { data: sData }] = await Promise.all([
          supabase.from("tc_processes").select("*").order("sort_order"),
          supabase.from("tc_process_action_steps").select("id, process_id, action_id, step_order, notes, variable_details").order("step_order"),
        ]);
        if (!pErr && pData) {
          const stepsMap: Record<string, any[]> = {};
          (sData ?? []).forEach((s: any) => {
            if (!stepsMap[s.process_id]) stepsMap[s.process_id] = [];
            stepsMap[s.process_id].push(s);
          });
          const procs = pData.map((r) => ({
            id: r.id, name: r.name, description: r.description ?? "",
            is_final: r.is_final ?? false, sort_order: r.sort_order ?? 0,
            status: ((r.status as "ACTIVE" | "INACTIVE") || "INACTIVE") as "ACTIVE" | "INACTIVE",
            is_used: r.is_used ?? false,
            process_type: r.process_type ?? null,
            action_steps: (stepsMap[r.id] ?? []).map((s: any) => ({
              action_id: s.action_id,
              step_order: s.step_order,
              notes: s.notes ?? "",
              variable_details: s.variable_details ?? { what: false, who: false, when: false, where: false },
            })),
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
  // Accepts payload from NewActionModal wizard (action_key replaces "short")

  const handleSaveAction = async (a: {
    id?: string;
    name: string;
    action_key: string;
    category: ActionCategory;
    description: string;
    is_active: boolean;
    attributes?: ActionAttributes;
  }) => {
    const isNew = !a.id;
    const newId = a.id ?? `act_custom_${Date.now()}`;
    const maxOrder = Math.max(0, ...actions.filter((x) => !x.is_system).map((x) => x.sort_order));

    const requiredVarCats = a.attributes?.flags
      ? { who: a.attributes.flags.who ?? false, when: a.attributes.flags.when ?? false, what: a.attributes.flags.what ?? false, where: a.attributes.flags.where ?? false }
      : { who: false, when: false, what: false, where: false };

    const fullAction: ActionLibraryItem = {
      id: newId,
      action_key: a.action_key,
      name: a.name,
      category: a.category,
      description: a.description,
      produces_output: false,
      custom_param_example: "",
      is_system: false,
      is_active: a.is_active,
      is_used: actions.find((x) => x.id === a.id)?.is_used ?? false,
      sort_order: isNew ? maxOrder + 1 : (actions.find((x) => x.id === a.id)?.sort_order ?? 0),
      required_variable_categories: requiredVarCats,
    };

    if (supabase) {
      if (isNew) {
        const { error } = await supabase.from("tc_action_library").insert({
          id: fullAction.id, action_key: fullAction.action_key, name: fullAction.name,
          category: fullAction.category, description: fullAction.description,
          produces_output: false, custom_param_example: "",
          is_system: false, is_active: fullAction.is_active, sort_order: fullAction.sort_order,
          required_variable_categories: requiredVarCats,
        });
        if (error) { console.error("Insert action_library:", error.message); return; }
      } else {
        const { error } = await supabase.from("tc_action_library").update({
          name: fullAction.name, category: fullAction.category,
          description: fullAction.description, is_active: fullAction.is_active,
          required_variable_categories: requiredVarCats,
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
    setShowActionModal(false);
    setEditingAction(null);
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
        // Don't pass id — let the DB auto-generate via DEFAULT gen_random_uuid()::text
        const { data: inserted, error } = await supabase.from("tc_processes").insert({
          name: p.name, description: p.description,
          is_final: p.is_final, sort_order: p.sort_order,
          status: p.status ?? "INACTIVE",
          is_used: false,
        }).select().single();
        if (error) {
          console.error("Insert process error:", error.message, error.details, error.hint);
          alert(`Failed to create process: ${error.message}`);
          return;
        }
        // Insert action steps
        if (p.action_steps && p.action_steps.length > 0) {
          const steps = p.action_steps.map((s, idx) => ({
            process_id: inserted.id,
            action_id: s.action_id,
            step_order: s.step_order ?? idx + 1,
            notes: s.notes ?? "",
            variable_details: s.variable_details ?? { what: false, who: false, when: false, where: false },
          }));
          const { error: stepsError } = await supabase.from("tc_process_action_steps").insert(steps);
          if (stepsError) console.error("Insert process steps:", stepsError.message);
        }
        const full: ProcessRecord = {
          id: inserted.id, name: inserted.name, description: inserted.description,
          is_final: inserted.is_final, sort_order: inserted.sort_order, status: inserted.status,
          is_used: inserted.is_used ?? false,
          process_type: inserted.process_type ?? null,
          action_steps: p.action_steps,
        };
        setProcesses((prev) => {
          const next = [full, ...prev];
          localStorage.setItem(LS_PROCESSES_KEY, JSON.stringify(next));
          return next;
        });
        return;
      } else {
        const { error } = await supabase.from("tc_processes").update({
          name: p.name, description: p.description,
          is_final: p.is_final, status: p.status ?? "INACTIVE",
        }).eq("id", p.id!);
        if (error) {
          console.error("Update process error:", error.message);
          alert(`Failed to update process: ${error.message}`);
          return;
        }
        // Re-insert action steps: delete old ones first
        if (p.action_steps !== undefined) {
          await supabase.from("tc_process_action_steps").delete().eq("process_id", p.id!);
          if (p.action_steps.length > 0) {
            const steps = p.action_steps.map((s, idx) => ({
              process_id: p.id!,
              action_id: s.action_id,
              step_order: s.step_order ?? idx + 1,
              notes: s.notes ?? "",
              variable_details: s.variable_details ?? { what: false, who: false, when: false, where: false },
            }));
            const { error: stepsError } = await supabase.from("tc_process_action_steps").insert(steps);
            if (stepsError) console.error("Update process steps:", stepsError.message);
          }
        }
        // Update local state immediately after successful edit
        const full: ProcessRecord = { ...p, id: p.id!, is_used: p.is_used ?? false, process_type: p.process_type ?? null, action_steps: p.action_steps };
        setProcesses((prev) => {
          const next = prev.map((x) => (x.id === full.id ? full : x));
          localStorage.setItem(LS_PROCESSES_KEY, JSON.stringify(next));
          return next;
        });
        // Notify parent about status change (previously done via auto-save, now done here)
        if (p.status) {
          handleProcessStatusUpdated(p.id!, p.status as "ACTIVE" | "INACTIVE");
        }
        return;
      }
    }

    // Fallback: no supabase (localStorage only)
    const full: ProcessRecord = { ...p, id: newId, is_used: p.is_used ?? false, action_steps: p.action_steps };
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

  const handleProcessStatusUpdated = (id: string, status: "ACTIVE" | "INACTIVE") => {
    setProcesses((prev) => {
      const next = prev.map((p) => p.id === id ? { ...p, status } : p);
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

  const filteredProcesses = processes
    .filter((p) => {
      const q = processSearch.toLowerCase();
      return !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      // Pin asset_in at top (-2), asset_out second (-1), rest by sort_order
      const pinOrder = (p: ProcessRecord) => {
        if (p.process_type === "asset_in")  return -2;
        if (p.process_type === "asset_out") return -1;
        return 0;
      };
      const pa = pinOrder(a);
      const pb = pinOrder(b);
      if (pa !== pb) return pa - pb;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
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
            <h2 className="text-base font-bold text-gray-900">Process & Action</h2>
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

              {/* Table header */}
              <div className="grid grid-cols-[1.8fr_10rem_2fr_7rem_9rem] gap-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div>Action Name</div>
                <div>Short</div>
                <div className="hidden md:block">Description</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>

              {/* Flat action rows */}
              <div className="space-y-2">
                {filteredActions.map((action) => {
                  const isActionOpen = expandedAction === action.id;
                  return (
                    <div key={action.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Action row */}
                      <div className="grid grid-cols-[1.8fr_10rem_2fr_7rem_9rem] gap-2 px-4 py-3 items-center hover:bg-gray-50/60 transition">
                        {/* Action Name */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-gray-900 text-sm truncate">{action.name}</span>
                          {action.is_system && (
                            <span className="shrink-0 text-xs bg-red-100 text-red-600 rounded px-1.5 py-0.5 font-medium">system</span>
                          )}
                          {action.is_used && (
                            <span className="shrink-0 text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5 font-medium">in use</span>
                          )}
                        </div>

                        {/* Short (action_key) */}
                        <div>
                          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{action.action_key}</code>
                        </div>

                        {/* Description */}
                        <div className="text-xs text-gray-400 truncate hidden md:block">
                          {action.description || "—"}
                        </div>

                        {/* Status */}
                        <div>
                          {action.is_system ? (
                            <span className="text-xs text-gray-400">—</span>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleActive(action); }}
                              className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition ${action.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                            >
                              {action.is_active ? "Active" : "Inactive"}
                            </button>
                          )}
                        </div>

                        {/* Actions + chevron */}
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingAction(action); setShowActionModal(true); }}
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                            title={action.is_system ? "View" : action.is_used ? "View (read-only)" : "Edit"}
                          >
                            {action.is_used && !action.is_system ? <Eye size={13} /> : <Edit2 size={13} />}
                          </button>
                          {!action.is_system && !action.is_used && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteAction(action.id); }}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => setExpandedAction(isActionOpen ? null : action.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title={isActionOpen ? "Collapse" : "Expand"}
                          >
                            {isActionOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isActionOpen && (
                        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/70 space-y-4">
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
                              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sort Order</h5>
                              <span className="text-sm font-mono text-gray-700">{action.sort_order}</span>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Action Key</h5>
                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{action.action_key}</code>
                          </div>

                          {/* Attributes */}
                          {!action.is_system && (
                            <div>
                              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Required Attributes</h5>
                              <div className="flex flex-wrap gap-2">
                                {(["who", "when", "what", "where"] as const).map((k) => {
                                  const on = action.required_variable_categories?.[k] ?? false;
                                  return (
                                    <span
                                      key={k}
                                      className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${on ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}
                                    >
                                      {k}: {on ? "✓" : "✗"}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

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

              <div className="space-y-2">
                {filteredProcesses.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-16 text-center">
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
                  <>
                    {/* Table header */}
                    <div className="grid grid-cols-[1.8fr_2fr_8rem_8rem_9rem] gap-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <div>Process Name</div>
                      <div className="hidden md:block">Description</div>
                      <div>Type</div>
                      <div>Status</div>
                      <div className="text-right">Actions</div>
                    </div>

                    {filteredProcesses.map((proc) => {
                      const isExpanded = expandedProcessId === proc.id;
                      const isAssetIn  = proc.process_type === "asset_in";
                      const isAssetOut = proc.process_type === "asset_out";
                      const totalSteps = (proc.action_steps?.length ?? 0) + 2;

                      return (
                        <div key={proc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                          {/* Process Row */}
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
                            <div>
                              {proc.status === "INACTIVE" ? (
                                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                                  Inactive
                                </span>
                              ) : proc.is_used ? (
                                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                                  Active – in use
                                </span>
                              ) : (
                                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                                  Active – Unused
                                </span>
                              )}
                            </div>

                            {/* Actions + Expand chevron at end */}
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { setEditingProcess(processes.find((p) => p.id === proc.id) ?? proc); setShowProcessModal(true); }}
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
                              <span className="text-xs text-gray-400 mx-1">{totalSteps} steps</span>
                              <button
                                onClick={() => setExpandedProcessId(isExpanded ? null : proc.id)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                title={isExpanded ? "Collapse" : "Expand"}
                              >
                                {isExpanded
                                  ? <ChevronDown size={15} className="text-gray-400" />
                                  : <ChevronRight size={15} className="text-gray-400" />
                                }
                              </button>
                            </div>
                          </div>

                          {/* Expanded: Action Steps */}
                          {isExpanded && (
                            <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50 space-y-2">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                Process Steps
                              </p>

                              {/* PROCESS_START */}
                              <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg">
                                <span className="text-xs font-mono font-bold text-gray-500 w-6 text-center shrink-0">S</span>
                                <span className="text-xs font-semibold text-gray-600">PROCESS_START</span>
                                <span className="ml-auto text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-medium">system</span>
                                <span className="text-xs text-gray-400">auto</span>
                              </div>

                              {/* User action steps */}
                              {(proc.action_steps ?? [])
                                .slice()
                                .sort((a, b) => a.step_order - b.step_order)
                                .map((step, idx) => {
                                  const action = actions.find((a) => a.id === step.action_id);
                                  return (
                                    <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-lg">
                                      <span className="text-xs font-mono text-gray-400 w-6 text-center shrink-0">{idx + 1}</span>
                                      <span className="text-sm font-medium text-gray-800 flex-1 truncate">
                                        {action?.name ?? step.action_id}
                                      </span>
                                      {action && (
                                        <>
                                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${CATEGORY_COLORS[action.category] ?? "bg-gray-100 text-gray-600"}`}>
                                            {action.category}
                                          </span>
                                          {action.produces_output && (
                                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium shrink-0">
                                              → output
                                            </span>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  );
                                })}

                              {(proc.action_steps?.length ?? 0) === 0 && (
                                <p className="text-xs text-gray-400 italic text-center py-2">No action steps defined.</p>
                              )}

                              {/* PROCESS_END */}
                              <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg">
                                <span className="text-xs font-mono font-bold text-gray-500 w-6 text-center shrink-0">E</span>
                                <span className="text-xs font-semibold text-gray-600">PROCESS_END</span>
                                <span className="ml-auto text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-medium">system</span>
                                <span className="text-xs text-gray-400">
                                  {proc.is_final ? "issues QR code · locks product" : "destination carries to next process"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showActionModal && (
        <NewActionModal
          action={editingAction}
          existingActions={actions}
          onClose={() => { setShowActionModal(false); setEditingAction(null); }}
          onSave={handleSaveAction}
        />
      )}
      {showProcessModal && (
        <ProcessModal
          process={editingProcess}
          actions={actions}
          onClose={() => { setShowProcessModal(false); setEditingProcess(null); }}
          onSave={handleSaveProcess}
          onStatusUpdated={handleProcessStatusUpdated}
        />
      )}
    </div>
  );
};

export default SuperAdminProcesses;
