import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Pencil, Check, Thermometer, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StorageRequirement {
  id: string;
  name: string;
  code: string;
  description: string;
  temperature_min_c: number | null;
  temperature_max_c: number | null;
  requires_cold_chain: boolean;
  requires_hazmat: boolean;
  is_active: boolean;
}

// Legacy helper kept for backward compatibility
export const loadStorageRequirements = (): string[] => {
  return ["Ambient", "Chilled", "Frozen", "Dry Store", "Hazardous"];
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  readOnly?: boolean;
}

const StorageRequirementsModal: React.FC<Props> = ({ onClose, readOnly = false }) => {
  const [items, setItems] = useState<StorageRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add state
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  // Load from Supabase
  useEffect(() => {
    supabase
      .from("tc_storage_requirements")
      .select("*")
      .order("name")
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          setItems((data ?? []) as StorageRequirement[]);
        }
        setLoading(false);
      });
  }, []);

  const handleAdd = async () => {
    const name = newName.trim().slice(0, 50);
    const code = newCode.trim().toUpperCase().replace(/\s+/g, "_").slice(0, 20);
    if (!name) { setAddError("Name is required."); return; }
    if (!code) { setAddError("Code is required."); return; }
    if (items.some((i) => i.code === code)) {
      setAddError("A requirement with this code already exists.");
      return;
    }
    setAdding(true);
    setAddError("");
    const newId = crypto.randomUUID();
    const { error: e } = await supabase.from("tc_storage_requirements").insert({
      id: newId,
      name,
      code,
      description: newDesc.trim(),
      is_active: true,
    });
    if (e) {
      setAddError(e.message);
    } else {
      const { data } = await supabase.from("tc_storage_requirements").select("*").order("name");
      setItems((data ?? []) as StorageRequirement[]);
      setNewName("");
      setNewCode("");
      setNewDesc("");
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    const { error: e } = await supabase.from("tc_storage_requirements").delete().eq("id", id);
    if (e) { setError(e.message); return; }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const startEdit = (item: StorageRequirement) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDesc(item.description);
    setEditError("");
  };

  const confirmEdit = async () => {
    const name = editName.trim().slice(0, 50);
    if (!name) { setEditError("Name cannot be empty."); return; }
    setSaving(true);
    setEditError("");
    const { error: e } = await supabase
      .from("tc_storage_requirements")
      .update({ name, description: editDesc.trim(), updated_at: new Date().toISOString() })
      .eq("id", editingId!);
    if (e) {
      setEditError(e.message);
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === editingId ? { ...i, name, description: editDesc.trim() } : i))
      );
      setEditingId(null);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-bold text-gray-900">Storage Requirements</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {readOnly
                ? "View the available storage conditions"
                : "Manage storage conditions used in locations and materials"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle size={14} />{error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mr-2" />
              Loading…
            </div>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50"
                >
                  {editingId === item.id ? (
                    <div className="flex-1 flex flex-col gap-2">
                      <input
                        type="text"
                        value={editName}
                        maxLength={50}
                        autoFocus
                        onChange={(e) => { setEditName(e.target.value); setEditError(""); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmEdit();
                          if (e.key === "Escape") { setEditingId(null); setEditError(""); }
                        }}
                        placeholder="Name"
                        className={`w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${editError ? "border-red-400" : "border-gray-300"}`}
                      />
                      <input
                        type="text"
                        value={editDesc}
                        maxLength={100}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {editError && <p className="text-xs text-red-500">{editError}</p>}
                      <div className="flex gap-2">
                        <button
                          onClick={confirmEdit}
                          disabled={saving}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
                        >
                          <Check size={12} /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 border border-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-800">{item.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded font-mono">{item.code}</span>
                          {item.requires_cold_chain && (
                            <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">
                              <Thermometer size={9} /> Cold
                            </span>
                          )}
                          {item.requires_hazmat && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded font-medium">⚠ Hazmat</span>
                          )}
                          {!item.is_active && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded font-medium">Inactive</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>
                        )}
                      </div>
                      {!readOnly && (
                        <div className="flex items-center gap-1 shrink-0 mt-0.5">
                          <button
                            onClick={() => startEdit(item)}
                            className="text-blue-400 hover:text-blue-600 transition"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-400 hover:text-red-600 transition"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))}
              {items.length === 0 && (
                <li className="text-xs text-gray-400 italic text-center py-4">No storage requirements defined.</li>
              )}
            </ul>
          )}

          {/* Add new */}
          {!readOnly && (
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-600">Add New Requirement</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newName}
                  maxLength={50}
                  onChange={(e) => { setNewName(e.target.value); setAddError(""); }}
                  placeholder="Name (e.g. Controlled Temp)"
                  className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${addError && !newName ? "border-red-400" : "border-gray-300"}`}
                />
                <input
                  type="text"
                  value={newCode}
                  maxLength={20}
                  onChange={(e) => { setNewCode(e.target.value.toUpperCase()); setAddError(""); }}
                  placeholder="Code (e.g. CTRL_TEMP)"
                  className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${addError && !newCode ? "border-red-400" : "border-gray-300"}`}
                />
              </div>
              <input
                type="text"
                value={newDesc}
                maxLength={100}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {addError && <p className="text-xs text-red-500">{addError}</p>}
              <button
                onClick={handleAdd}
                disabled={adding}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
              >
                <Plus size={14} /> Add Requirement
              </button>
            </div>
          )}

          {readOnly && (
            <p className="text-xs text-gray-400 italic text-center">
              Contact your administrator to modify storage requirements.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageRequirementsModal;
