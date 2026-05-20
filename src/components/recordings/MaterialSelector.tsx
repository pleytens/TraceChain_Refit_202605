import React, { useState, useEffect } from "react";
import { Search, Package, X, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { RecordingMaterial } from "@/types/recording";

interface Props {
  selected: RecordingMaterial[];
  onChange: (materials: RecordingMaterial[]) => void;
  disabled?: boolean;
}

const FALLBACK_MATERIALS: RecordingMaterial[] = [
  { id: "m1", name: "Flour", supplierName: "ABC Supplies", importPackingItem: "25kg bag", importUnitItem: "kg", batchNumber: "F202605" },
  { id: "m2", name: "Water", supplierName: "XYZ Water Co.", importPackingItem: "1L bottle", importUnitItem: "L", batchNumber: "W202605" },
  { id: "m3", name: "Salt", supplierName: "Ocean Salt Ltd", importPackingItem: "5kg bag", importUnitItem: "kg", batchNumber: "S202605" },
  { id: "m4", name: "Sugar", supplierName: "Sweet Farm", importPackingItem: "10kg bag", importUnitItem: "kg", batchNumber: "SG202605" },
];

const MaterialSelector: React.FC<Props> = ({ selected, onChange, disabled = false }) => {
  const [allMaterials, setAllMaterials] = useState<RecordingMaterial[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) { setAllMaterials(FALLBACK_MATERIALS); return; }
    setLoading(true);
    supabase
      .from("tc_materials")
      .select("id, name, supplier_name, import_packing_item, import_unit_item")
      .order("name")
      .then(({ data, error }) => {
        setLoading(false);
        if (error || !data || data.length === 0) {
          setAllMaterials(FALLBACK_MATERIALS);
          return;
        }
        setAllMaterials(
          data.map((m: any) => ({
            id: m.id,
            name: m.name,
            supplierName: m.supplier_name || "",
            importPackingItem: m.import_packing_item || "",
            importUnitItem: m.import_unit_item || "",
            batchNumber: "",
          }))
        );
      });
  }, []);

  const selectedIds = selected.map((m) => m.id);
  const filtered = allMaterials.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      (m.supplierName ?? "").toLowerCase().includes(query.toLowerCase())
  );

  const toggle = (mat: RecordingMaterial) => {
    if (selectedIds.includes(mat.id)) {
      onChange(selected.filter((m) => m.id !== mat.id));
    } else {
      onChange([...selected, { ...mat, quantity: undefined }]);
    }
  };

  const updateQty = (id: string, qty: string) => {
    onChange(
      selected.map((m) =>
        m.id === id ? { ...m, quantity: qty === "" ? undefined : parseFloat(qty) } : m
      )
    );
  };

  const updateBatch = (id: string, batch: string) => {
    onChange(selected.map((m) => (m.id === id ? { ...m, batchNumber: batch } : m)));
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      {!disabled && (
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search materials…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Material list */}
      {!disabled && (
        <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-4 text-xs text-gray-400 text-center">Loading materials…</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-4 text-xs text-gray-400 text-center">No materials found.</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-500 font-semibold">Name</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-semibold">Supplier</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-semibold">Packing</th>
                  <th className="px-3 py-2 text-left text-gray-500 font-semibold">Unit</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((mat) => {
                  const isSelected = selectedIds.includes(mat.id);
                  return (
                    <tr
                      key={mat.id}
                      onClick={() => toggle(mat)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-3 py-2 font-medium text-gray-800">{mat.name}</td>
                      <td className="px-3 py-2 text-gray-500">{mat.supplierName || "—"}</td>
                      <td className="px-3 py-2 text-gray-500">{mat.importPackingItem || "—"}</td>
                      <td className="px-3 py-2 text-gray-500">{mat.importUnitItem || "—"}</td>
                      <td className="px-2 py-2">
                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                            <X size={10} className="text-white" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center shrink-0">
                            <Plus size={10} className="text-gray-400" />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Selected materials with quantity input */}
      {selected.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {disabled ? "Selected Materials" : "Set Quantity for Each"}
          </p>
          {selected.map((mat) => (
            <div
              key={mat.id}
              className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl"
            >
              <Package size={14} className="text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{mat.name}</p>
                <p className="text-xs text-gray-400">
                  {mat.supplierName && <span>{mat.supplierName} · </span>}
                  {mat.importPackingItem && <span>{mat.importPackingItem}</span>}
                </p>
              </div>

              {/* Batch # */}
              {!disabled && (
                <input
                  type="text"
                  placeholder="Batch #"
                  value={mat.batchNumber ?? ""}
                  onChange={(e) => updateBatch(mat.id, e.target.value)}
                  className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              )}
              {disabled && mat.batchNumber && (
                <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded px-2 py-1">
                  #{mat.batchNumber}
                </span>
              )}

              {/* Quantity */}
              {!disabled ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="Qty"
                    min={0}
                    value={mat.quantity ?? ""}
                    onChange={(e) => updateQty(mat.id, e.target.value)}
                    className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <span className="text-xs text-gray-500 shrink-0">{mat.importUnitItem || "unit"}</span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-gray-700 shrink-0">
                  {mat.quantity ?? "—"} {mat.importUnitItem || ""}
                </span>
              )}

              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange(selected.filter((m) => m.id !== mat.id))}
                  className="text-gray-300 hover:text-red-400 transition shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {disabled && selected.length === 0 && (
        <p className="text-xs text-gray-400 italic">No materials selected.</p>
      )}
    </div>
  );
};

export default MaterialSelector;
