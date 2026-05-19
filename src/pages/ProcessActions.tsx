import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Search, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProcessAction {
  id: string;
  name: string;
  description: string;
  color: string;
  status: "Active" | "Inactive";
}

const LS_KEY = "tc_process_actions";

const DEFAULT_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // purple
  "#06B6D4", // cyan
  "#F97316", // orange
  "#EC4899", // pink
];

const DEFAULT_ACTIONS: ProcessAction[] = [
  { id: "pa1", name: "Receive", description: "Receiving raw materials or goods", color: "#10B981", status: "Active" },
  { id: "pa2", name: "Process", description: "Processing or transforming goods", color: "#3B82F6", status: "Active" },
  { id: "pa3", name: "Pack", description: "Packaging finished products", color: "#8B5CF6", status: "Active" },
  { id: "pa4", name: "Ship", description: "Dispatching to next destination", color: "#F59E0B", status: "Active" },
  { id: "pa5", name: "Inspect", description: "Quality control inspection", color: "#EF4444", status: "Active" },
];

function loadLocal(): ProcessAction[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as ProcessAction[];
      if (Array.isArray(p) && p.length > 0) return p;
    }
  } catch {}
  return DEFAULT_ACTIONS;
}

function saveLocal(list: ProcessAction[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  readOnly?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ProcessActionsPage: React.FC<Props> = ({ readOnly = false }) => {
  const [actions, setActions] = useState<ProcessAction[]>(loadLocal);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ProcessAction | null>(null);
  const [form, setForm] = useState({ name: "", description: "", color: DEFAULT_COLORS[0], status: "Active" as "Active" | "Inactive" });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load from Supabase
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase
      .from("tc_process_actions")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        setLoading(false);
        if (error) {
          console.warn("⚠️ Supabase tc_process_actions load failed:", error.message);
          return;
        }
        if (data && data.length > 0) {
          const rows: ProcessAction[] = data.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            color: r.color,
            status: r.status as "Active" | "Inactive",
          }));
          setActions(rows);
          saveLocal(rows);
        } else {
          // Seed defaults
          const toSeed = loadLocal();
          supabase!
            .from("tc_process_actions")
            .insert(toSeed.map((a) => ({ id: a.id, name: a.name, description: a.description, color: a.color, status: a.status })))
            .then(({ error: seedErr }) => {
              if (seedErr) console.warn("⚠️ Seeding tc_process_actions failed:", seedErr.message);
            });
        }
      });
  }, []);

  const filtered = actions.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", color: DEFAULT_COLORS[0], status: "Active" });
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (action: ProcessAction) => {
    setEditing(action);
    setForm({ name: action.name, description: action.description, color: action.color, status: action.status });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError("Name is required."); return; }
    if (actions.some((a) => a.name.toLowerCase() === form.name.trim().toLowerCase() && a.id !== editing?.id)) {
      setFormError("An action with this name already exists.");
      return;
    }

    if (editing) {
      if (supabase) {
        const { error } = await supabase
          .from("tc_process_actions")
          .update({ name: form.name.trim(), description: form.description.trim(), color: form.color, status: form.status })
          .eq("id", editing.id);
        if (error) console.error("❌ Supabase update tc_process_actions:", error.message);
      }
      setActions((prev) => {
        const next = prev.map((a) => a.id === editing.id ? { ...a, ...form, name: form.name.trim(), description: form.description.trim() } : a);
        saveLocal(next);
        return next;
      });
    } else {
      const newAction: ProcessAction = { id: `pa${Date.now()}`, name: form.name.trim(), description: form.description.trim(), color: form.color, status: form.status };
      if (supabase) {
        const { error } = await supabase
          .from("tc_process_actions")
          .insert({ id: newAction.id, name: newAction.name, description: newAction.description, color: newAction.color, status: newAction.status });
        if (error) console.error("❌ Supabase insert tc_process_actions:", error.message);
      }
      setActions((prev) => {
        const next = [newAction, ...prev];
        saveLocal(next);
        return next;
      });
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this process action?")) return;
    if (supabase) {
      const { error } = await supabase.from("tc_process_actions").delete().eq("id", id);
      if (error) console.error("❌ Supabase delete tc_process_actions:", error.message);
    }
    setActions((prev) => {
      const next = prev.filter((a) => a.id !== id);
      saveLocal(next);
      return next;
    });
  };

  const toggleStatus = async (action: ProcessAction) => {
    const newStatus = action.status === "Active" ? "Inactive" : "Active";
    if (supabase) {
      const { error } = await supabase.from("tc_process_actions").update({ status: newStatus }).eq("id", action.id);
      if (error) console.error("❌ Supabase update status tc_process_actions:", error.message);
    }
    setActions((prev) => {
      const next = prev.map((a) => a.id === action.id ? { ...a, status: newStatus } : a);
      saveLocal(next);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Process Actions</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Define the action types used when recording process steps.
            </p>
          </div>
          {!readOnly && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={15} /> Add Action
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search actions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">⚙️</div>
            <p className="text-gray-500 text-sm">
              {search ? "No actions match your search." : "No process actions defined yet."}
            </p>
            {!readOnly && !search && (
              <button
                onClick={openCreate}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                + Add First Action
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Color</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                {!readOnly && (
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((action) => (
                <tr key={action.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <span
                      className="inline-block w-5 h-5 rounded-full border border-gray-200"
                      style={{ backgroundColor: action.color }}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{action.name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell max-w-xs truncate">{action.description || "—"}</td>
                  <td className="px-4 py-3">
                    {readOnly ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${action.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {action.status}
                      </span>
                    ) : (
                      <button
                        onClick={() => toggleStatus(action)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition ${action.status === "Active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                      >
                        {action.status}
                      </button>
                    )}
                  </td>
                  {!readOnly && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(action)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(action.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Count */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 px-1">
          {filtered.length} action{filtered.length !== 1 ? "s" : ""} shown
          {actions.filter((a) => a.status === "Active").length !== actions.length && (
            <> · {actions.filter((a) => a.status === "Active").length} active</>
          )}
        </p>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900">
                {editing ? "Edit Process Action" : "New Process Action"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={form.name}
                  onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setFormError(""); }}
                  placeholder="e.g. Receive, Process, Ship..."
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${formError ? "border-red-400" : "border-gray-300"}`}
                />
                {formError && <p className="text-xs text-red-500 mt-1">{formError}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  maxLength={100}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description of this action"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className="w-7 h-7 rounded-full border-2 transition"
                      style={{
                        backgroundColor: c,
                        borderColor: form.color === c ? "#1e40af" : "transparent",
                        boxShadow: form.color === c ? "0 0 0 2px #93c5fd" : "none",
                      }}
                    >
                      {form.color === c && <Check size={12} className="text-white mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "Active" | "Inactive" }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                {editing ? "Save Changes" : "Create Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessActionsPage;
