import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Pencil, Check } from "lucide-react";

// ─── Storage key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "tc_storage_requirements";

const DEFAULT_REQUIREMENTS = [
  "Dry storage normal temperature",
  "Fridge 2-5 °C",
  "Freezer -18°C",
];

export const loadStorageRequirements = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch { /* ignore */ }
  // Seed defaults on first load
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REQUIREMENTS));
  return DEFAULT_REQUIREMENTS;
};

const saveStorageRequirements = (list: string[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  readOnly?: boolean;
}

const StorageRequirementsModal: React.FC<Props> = ({ onClose, readOnly = false }) => {
  const [items, setItems] = useState<string[]>(loadStorageRequirements);
  const [newValue, setNewValue] = useState("");
  const [error, setError] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editError, setEditError] = useState("");

  // Persist whenever items change
  useEffect(() => {
    if (!readOnly) saveStorageRequirements(items);
  }, [items, readOnly]);

  const handleAdd = () => {
    const trimmed = newValue.trim().slice(0, 50);
    if (!trimmed) { setError("Please enter a value."); return; }
    if (items.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      setError("This storage requirement already exists.");
      return;
    }
    setItems((prev) => [...prev, trimmed]);
    setNewValue("");
    setError("");
  };

  const handleDelete = (idx: number) => {
    if (idx < 3) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditingValue(items[idx]);
    setEditError("");
  };

  const confirmEdit = (idx: number) => {
    const trimmed = editingValue.trim().slice(0, 50);
    if (!trimmed) { setEditError("Value cannot be empty."); return; }
    if (items.some((item, i) => i !== idx && item.toLowerCase() === trimmed.toLowerCase())) {
      setEditError("This storage requirement already exists.");
      return;
    }
    setItems((prev) => prev.map((item, i) => (i === idx ? trimmed : item)));
    setEditingIdx(null);
    setEditError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-base font-bold text-gray-900">Storage Requirements</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {readOnly
                ? "View the storage options available in product storage dropdown"
                : "Manage the options available in product storage dropdown"}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* List */}
          <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50"
              >
                {editingIdx === idx ? (
                  /* Inline edit input */
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingValue}
                        maxLength={50}
                        autoFocus
                        onChange={(e) => { setEditingValue(e.target.value); setEditError(""); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmEdit(idx);
                          if (e.key === "Escape") { setEditingIdx(null); setEditError(""); }
                        }}
                        className={`flex-1 border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${editError ? "border-red-400" : "border-gray-300"}`}
                      />
                      <button
                        onClick={() => confirmEdit(idx)}
                        className="text-green-500 hover:text-green-700 transition shrink-0"
                        title="Save"
                      >
                        <Check size={15} />
                      </button>
                    </div>
                    {editError && <p className="text-xs text-red-500 pl-0.5">{editError}</p>}
                    <p className="text-xs text-gray-400 text-right">{editingValue.length}/50</p>
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-gray-800 flex-1 truncate">{item}</span>
                    {idx < 3 ? (
                      /* Default items */
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!readOnly && (
                          <button
                            onClick={() => startEdit(idx)}
                            className="text-blue-400 hover:text-blue-600 transition"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                        )}
                        <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 bg-gray-200 rounded-full">
                          Default
                        </span>
                      </div>
                    ) : (
                      /* Custom items */
                      readOnly ? (
                        <span className="text-[10px] text-blue-500 font-medium px-2 py-0.5 bg-blue-50 rounded-full shrink-0">
                          Custom
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => startEdit(idx)}
                            className="text-blue-400 hover:text-blue-600 transition"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(idx)}
                            className="text-red-400 hover:text-red-600 transition"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>

          {/* Add new — admin only */}
          {!readOnly && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">
                Add new option <span className="text-gray-400">(max 50 chars)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newValue}
                  maxLength={50}
                  onChange={(e) => { setNewValue(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  placeholder="e.g. Ambient 15-25 °C"
                  className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-400" : "border-gray-300"}`}
                />
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shrink-0"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <p className="text-xs text-gray-400 text-right">{newValue.length}/50</p>
            </div>
          )}

          {/* Read-only hint */}
          {readOnly && (
            <p className="text-xs text-gray-400 italic text-center">
              Contact your administrator to modify storage options.
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
