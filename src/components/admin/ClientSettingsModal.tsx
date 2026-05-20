import React, { useState, useEffect, useCallback } from "react";
import { X, Plus, Trash2, Save, Settings, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id?: string;
  name: string;
  description: string;
  sort_order: number;
  _deleted?: boolean;
}

interface Props {
  clientId: string;
  clientName: string;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ClientSettingsModal: React.FC<Props> = ({ clientId, clientName, onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "supabase-functions-get-client-categories",
        { body: { client_id: clientId } }
      );
      if (fnError) throw fnError;
      setCategories(
        (data?.data ?? []).map((c: Category) => ({ ...c, _deleted: false }))
      );
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleAdd = () => {
    setCategories((prev) => [
      ...prev,
      { name: "", description: "", sort_order: prev.length, _deleted: false },
    ]);
  };

  const handleChange = (idx: number, field: "name" | "description", value: string) => {
    setCategories((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
  };

  const handleDelete = (idx: number) => {
    const cat = categories[idx];
    if (cat.id) {
      // Existing record: mark as deleted for confirmation
      setDeleteConfirm(idx);
    } else {
      // New (unsaved) row: remove immediately
      setCategories((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm === null) return;
    setCategories((prev) => prev.filter((_, i) => i !== deleteConfirm));
    setDeleteConfirm(null);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    // Validate: no empty names
    const trimmed = categories.filter((c) => c.name.trim());
    if (trimmed.length < categories.length) {
      setError("All categories must have a name. Remove empty rows before saving.");
      return;
    }

    // Check for duplicate names
    const names = trimmed.map((c) => c.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) {
      setError("Duplicate category names are not allowed.");
      return;
    }

    setSaving(true);
    try {
      const { error: fnError } = await supabase.functions.invoke(
        "supabase-functions-save-client-categories",
        {
          body: {
            client_id: clientId,
            categories: trimmed.map((c, i) => ({
              name: c.name.trim(),
              description: c.description?.trim() ?? "",
              sort_order: i,
            })),
          },
        }
      );
      if (fnError) throw fnError;
      setSuccess(true);
      await fetchCategories();
    } catch (e: unknown) {
      setError((e as Error).message ?? "Failed to save categories");
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Client Settings</h3>
              <p className="text-xs text-gray-500">{clientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Section header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-800">📁 Action Categories</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage action categories available to this client. These appear in the client's action dropdown.
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-1.5 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
            >
              <Plus size={13} /> Add Category
            </button>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
              ✓ Categories saved successfully.
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span className="text-sm">Loading categories…</span>
            </div>
          ) : (
            <>
              {/* Table */}
              {categories.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                  No categories yet. Click <strong>"Add Category"</strong> to get started.
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                        <th className="px-4 py-3 w-8">#</th>
                        <th className="px-4 py-3">Name <span className="text-red-500">*</span></th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 w-16 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {categories.map((cat, idx) => (
                        <tr key={cat.id ?? `new-${idx}`} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-gray-400 text-xs">{idx + 1}</td>
                          <td className="px-4 py-2.5">
                            <input
                              value={cat.name}
                              onChange={(e) => handleChange(idx, "name", e.target.value)}
                              placeholder="e.g. Movement"
                              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              value={cat.description}
                              onChange={(e) => handleChange(idx, "description", e.target.value)}
                              placeholder="Optional description"
                              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <button
                              onClick={() => handleDelete(idx)}
                              className="text-gray-400 hover:text-red-600 transition"
                              title="Delete category"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition shadow-sm"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="text-3xl mb-3">🗑️</div>
            <h4 className="font-bold text-gray-900 mb-2">Delete Category</h4>
            <p className="text-sm text-gray-600 mb-5">
              Delete <strong>"{categories[deleteConfirm]?.name}"</strong>? This will be removed on save.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSettingsModal;
