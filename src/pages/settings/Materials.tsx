import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2, X, Search, ChevronDown, Edit2, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useUnits } from "@/context/UnitsContext";

// ─── Activity Log ─────────────────────────────────────────────────────────────

interface ActivityEntry {
  id: string;
  userName: string;
  date: string; // ISO string stored, formatted on display
  activity: "CREATE" | "MODIFIED";
}

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const formatActivityDate = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostAddress {
  houseNumber: string;
  streetName: string;
  district: string;
  postCode: string;
  city: string;
  country: string;
}

interface Supplier {
  id: string;
  name: string;
  materialOriginAddresses: PostAddress[];
}

interface Material {
  id: string;
  name: string;
  supplierId: string;
  supplierName: string;
  materialCategory: string;
  importPackingItem: string;
  importUnitItem: string;
  importPackingUnitDefaultQty: string;
  originPostAddress: PostAddress;
  createdAt: string;
  activityLog: ActivityEntry[];
}

// ─── Library Data ─────────────────────────────────────────────────────────────

const MATERIAL_NAME_LIBRARY = [
  "Green Tea Leaves", "Black Tea Leaves", "Jasmine Flowers", "Dried Mango",
  "Sugarcane", "Rice (Jasmine)", "Rice (Glutinous)", "Cassava",
  "Fresh Pepper", "Black Pepper", "Salt (Sea)", "Salt (Rock)",
  "Coconut (Whole)", "Coconut Milk", "Palm Sugar", "Honey (Raw)",
  "Wheat Flour", "Tapioca Starch", "Cornstarch", "Soybean",
  "Mung Bean", "Black Bean", "Red Bean", "Chickpea",
  "Fresh Ginger", "Turmeric Root", "Lemongrass", "Galangal",
  "Chili (Red)", "Chili (Green)", "Garlic", "Shallot",
  "Fish Sauce", "Soy Sauce", "Oyster Sauce", "Sesame Oil",
  "Sunflower Oil", "Palm Oil", "Beeswax", "Argan Oil",
];

const MATERIAL_CATEGORY_LIBRARY = [
  "Grains & Cereals", "Vegetables", "Fruits", "Herbs & Spices",
  "Oils & Fats", "Sweeteners", "Legumes & Pulses", "Seafood & Fish",
  "Dairy & Eggs", "Meat & Poultry", "Beverages & Extracts",
  "Condiments & Sauces", "Packaging Materials", "Chemicals & Additives",
  "Fibres & Textiles", "Wood & Timber", "Minerals", "Other Raw Materials",
];

const PACKING_ITEM_LIBRARY = [
  "Jute Bag", "PP Woven Bag", "Paper Bag (Kraft)", "Cardboard Box",
  "Wooden Crate", "Plastic Drum", "Metal Drum", "IBC Tank",
  "Pallet (Wooden)", "Pallet (Plastic)", "Big Bag (FIBC)", "Vacuum Bag",
  "Net Bag", "Mesh Sack", "Bottle (PET)", "Bottle (Glass)",
  "Can (Tin)", "Flexible Pouch", "Tetrapak", "Bulk Tanker",
];

// ─── Load Suppliers from shared localStorage (written by SettingsCompanies) ───

const SETTINGS_SUPPLIERS_KEY = "tc_settings_suppliers";

const loadSuppliersFromStorage = (): Supplier[] => {
  try {
    const stored = localStorage.getItem(SETTINGS_SUPPLIERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        // Map SupplierForm → local Supplier shape
        return parsed.map((s: { supplierName?: string; materialOriginAddresses?: PostAddress[] }, i: number) => ({
          id: `stored-${i}`,
          name: s.supplierName ?? "",
          materialOriginAddresses: Array.isArray(s.materialOriginAddresses) ? s.materialOriginAddresses : [],
        })).filter((s: Supplier) => s.name.trim() !== "");
      }
    }
  } catch {}
  return [];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => new Date().toISOString().slice(0, 10);

const formatAddress = (a: PostAddress) => {
  const parts = [a.houseNumber, a.streetName, a.district, a.postCode, a.city, a.country].filter(Boolean);
  return parts.join(", ") || "—";
};

const emptyAddress = (): PostAddress => ({
  houseNumber: "", streetName: "", district: "", postCode: "", city: "", country: "",
});

// ─── AutocompleteInput ────────────────────────────────────────────────────────

interface AutocompleteInputProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value, onChange, options, placeholder, error,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 10);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 ${error ? "border-red-400" : "border-gray-300"}`}
      />
      <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.map((opt) => (
            <li
              key={opt}
              onMouseDown={() => { onChange(opt); setOpen(false); }}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// ─── SupplierSearchSelect ─────────────────────────────────────────────────────

interface SupplierSearchSelectProps {
  value: string;
  onChange: (id: string, name: string) => void;
  suppliers: Supplier[];
  error?: string;
}

const SupplierSearchSelect: React.FC<SupplierSearchSelectProps> = ({ value, onChange, suppliers, error }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = suppliers.find((s) => s.id === value);
  const filtered = suppliers.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex items-center justify-between w-full border rounded-lg px-3 py-2 text-sm cursor-pointer bg-white ${error ? "border-red-400" : "border-gray-300"} focus-within:ring-2 focus-within:ring-blue-500`}
        onClick={() => setOpen((o) => !o)}
      >
        {selected ? (
          <span className="text-gray-800 font-medium">{selected.name}</span>
        ) : (
          <span className="text-gray-400">Search and select a supplier…</span>
        )}
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to filter…"
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-gray-400 text-center">No suppliers found</li>
            ) : (
              filtered.map((s) => (
                <li
                  key={s.id}
                  onMouseDown={() => { onChange(s.id, s.name); setOpen(false); setQuery(""); }}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${s.id === value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}
                >
                  {s.name}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// ─── AddressSelector ──────────────────────────────────────────────────────────

interface AddressSelectorProps {
  addresses: PostAddress[];
  selected: PostAddress;
  onChange: (a: PostAddress) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ addresses, selected, onChange }) => {
  const [mode, setMode] = useState<"library" | "manual">(
    addresses.length > 0 ? "library" : "manual"
  );

  const update = (field: keyof PostAddress, val: string) =>
    onChange({ ...selected, [field]: val });

  return (
    <div className="space-y-3">
      {addresses.length > 0 && (
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMode("library")}
            className={`px-3 py-1 rounded-full border font-medium transition ${mode === "library" ? "bg-blue-600 text-white border-blue-600" : "text-gray-500 border-gray-300 hover:border-blue-400"}`}
          >
            From supplier addresses
          </button>
          <button
            type="button"
            onClick={() => { setMode("manual"); onChange(emptyAddress()); }}
            className={`px-3 py-1 rounded-full border font-medium transition ${mode === "manual" ? "bg-blue-600 text-white border-blue-600" : "text-gray-500 border-gray-300 hover:border-blue-400"}`}
          >
            Enter manually
          </button>
        </div>
      )}

      {mode === "library" && addresses.length > 0 ? (
        <div className="space-y-2">
          {addresses.map((a, i) => {
            const formatted = formatAddress(a);
            const isSelected = formatAddress(selected) === formatted;
            return (
              <label key={i} className={`flex items-start gap-2 p-3 border rounded-lg cursor-pointer transition ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                <input type="radio" checked={isSelected} onChange={() => onChange(a)} className="mt-0.5 accent-blue-600" />
                <span className="text-sm text-gray-700">{formatted}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-gray-200 rounded-xl p-4 bg-gray-50">
          {([
            ["houseNumber", "House N°", "123"],
            ["streetName", "Street Name", "Main Street"],
            ["district", "District", ""],
            ["postCode", "Post Code", ""],
            ["city", "City", ""],
            ["country", "Country", ""],
          ] as [keyof PostAddress, string, string][]).map(([field, label, placeholder]) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selected[field]}
                onChange={(e) => update(field, e.target.value)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Section ──────────────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2">
    <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1">{title}</h3>
    {children}
  </div>
);

// ─── AddMaterialModal ─────────────────────────────────────────────────────────

interface AddMaterialModalProps {
  onClose: () => void;
  onSave: (m: Material) => void;
  onDelete?: () => void;
  suppliers: Supplier[];
  materials: Material[];
  editingMaterial?: Material | null;
  viewOnly?: boolean;
}

interface FormErrors {
  name?: string;
  supplierId?: string;
}

const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  onClose, onSave, onDelete, suppliers, materials, editingMaterial, viewOnly = false,
}) => {
  const { currentUser } = useAuth();
  const isEdit = !!editingMaterial;
  const { activeUnits } = useUnits();
  const UNIT_ITEM_LIBRARY = activeUnits.map((u) => `${u.name} (${u.abbreviation})`);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    name: editingMaterial?.name ?? "",
    supplierId: editingMaterial?.supplierId ?? "",
    supplierName: editingMaterial?.supplierName ?? "",
    materialCategory: editingMaterial?.materialCategory ?? "",
    importPackingItem: editingMaterial?.importPackingItem ?? "",
    importUnitItem: editingMaterial?.importUnitItem ?? "",
    importPackingUnitDefaultQty: editingMaterial?.importPackingUnitDefaultQty ?? "",
    originPostAddress: editingMaterial?.originPostAddress ?? emptyAddress(),
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const selectedSupplier = suppliers.find((s) => s.id === form.supplierId) ?? null;

  // Auto-propose qty from history when supplier+packing+unit match
  useEffect(() => {
    if (isEdit) return;
    if (!form.supplierId || !form.importPackingItem || !form.importUnitItem) return;
    const match = [...materials].reverse().find(
      (m) =>
        m.supplierId === form.supplierId &&
        m.importPackingItem === form.importPackingItem &&
        m.importUnitItem === form.importUnitItem
    );
    if (match && form.importPackingUnitDefaultQty === "") {
      setForm((prev) => ({ ...prev, importPackingUnitDefaultQty: match.importPackingUnitDefaultQty }));
    }
  }, [form.supplierId, form.importPackingItem, form.importUnitItem]);

  // Auto-propose last used address for this supplier
  useEffect(() => {
    if (isEdit) return;
    if (!form.supplierId) return;
    const match = [...materials].reverse().find((m) => m.supplierId === form.supplierId);
    if (match && !form.originPostAddress.city && !form.originPostAddress.streetName) {
      setForm((prev) => ({ ...prev, originPostAddress: match.originPostAddress }));
    }
  }, [form.supplierId]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = () => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Material name is required.";
    if (!form.supplierId) errs.supplierId = "Please select a supplier.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const userName = currentUser
      ? `${currentUser.firstName}${currentUser.lastName ? " " + currentUser.lastName : ""}`.trim() || currentUser.email
      : "Unknown";

    const newEntry: ActivityEntry = {
      id: uid(),
      userName,
      date: new Date().toISOString(),
      activity: isEdit ? "MODIFIED" : "CREATE",
    };

    const existingLog: ActivityEntry[] = editingMaterial?.activityLog ?? [];

    onSave({
      id: editingMaterial?.id ?? uid(),
      name: form.name.trim(),
      supplierId: form.supplierId,
      supplierName: form.supplierName,
      materialCategory: form.materialCategory,
      importPackingItem: form.importPackingItem,
      importUnitItem: form.importUnitItem,
      importPackingUnitDefaultQty: form.importPackingUnitDefaultQty,
      originPostAddress: form.originPostAddress,
      createdAt: editingMaterial?.createdAt ?? today(),
      activityLog: [...existingLog, newEntry],
    });
    onClose();
  };

  const qtyProposal = (() => {
    if (isEdit || !form.supplierId || !form.importPackingItem || !form.importUnitItem) return null;
    return [...materials].reverse().find(
      (m) =>
        m.supplierId === form.supplierId &&
        m.importPackingItem === form.importPackingItem &&
        m.importUnitItem === form.importUnitItem
    ) ?? null;
  })();

  const addressProposal = (() => {
    if (isEdit || !form.supplierId) return null;
    return [...materials].reverse().find((m) => m.supplierId === form.supplierId) ?? null;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {viewOnly ? "View Material" : isEdit ? "Edit Material" : "Add a Material"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-7 overflow-y-auto max-h-[75vh]">

          {/* 2.1 Material Name */}
          <Section title="Material Name">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Material Name <span className="text-red-500">*</span>
              </label>
              <AutocompleteInput
                value={form.name}
                onChange={(v) => { set("name", v); if (errors.name) setErrors({}); }}
                options={MATERIAL_NAME_LIBRARY}
                placeholder="Type to search library or enter a custom name…"
                error={errors.name}
              />
              <p className="text-xs text-gray-400 mt-1">Start typing to match from the library, or enter a new custom name.</p>
            </div>
          </Section>

          {/* 2.2 Supplier Name */}
          <Section title="Supplier Name">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Supplier <span className="text-red-500">*</span>
              </label>
              <SupplierSearchSelect
                value={form.supplierId}
                onChange={(id, name) => {
                  setForm((prev) => ({
                    ...prev,
                    supplierId: id,
                    supplierName: name,
                    originPostAddress: emptyAddress(),
                  }));
                  if (errors.supplierId) setErrors({});
                }}
                suppliers={suppliers}
                error={errors.supplierId}
              />
            </div>
          </Section>

          {/* 2.3 Material Category */}
          <Section title="Material Category">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Material Category</label>
              <AutocompleteInput
                value={form.materialCategory}
                onChange={(v) => set("materialCategory", v)}
                options={MATERIAL_CATEGORY_LIBRARY}
                placeholder="Search or enter category…"
              />
            </div>
          </Section>

          {/* Packing & Unit */}
          <Section title="Packing & Unit">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Import Packing Item</label>
                <AutocompleteInput
                  value={form.importPackingItem}
                  onChange={(v) => set("importPackingItem", v)}
                  options={PACKING_ITEM_LIBRARY}
                  placeholder="e.g. Jute Bag, Cardboard Box…"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Import Unit Item</label>
                <AutocompleteInput
                  value={form.importUnitItem}
                  onChange={(v) => set("importUnitItem", v)}
                  options={UNIT_ITEM_LIBRARY}
                  placeholder="e.g. kg, L, pcs…"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Unit Default Quantity
                  {qtyProposal && (
                    <span className="ml-2 text-xs text-blue-500 font-normal">
                      ↩ {qtyProposal.importPackingUnitDefaultQty}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.importPackingUnitDefaultQty}
                  onChange={(e) => set("importPackingUnitDefaultQty", e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Pre-filled from last matching Supplier + Packing + Unit. Can be overwritten.
                </p>
              </div>
            </div>
          </Section>

          {/* 2.7 Origin Post Address */}
          <Section title="Origin Post Address">
            {!form.supplierId ? (
              <p className="text-xs text-gray-400 italic">Select a supplier first to see address options.</p>
            ) : (
              <div>
                {addressProposal && (
                  <p className="text-xs text-blue-500 mb-2">
                    ↩ Last used address for this supplier is proposed. Can be overwritten.
                  </p>
                )}
                <AddressSelector
                  addresses={selectedSupplier?.materialOriginAddresses ?? []}
                  selected={form.originPostAddress}
                  onChange={(a) => set("originPostAddress", a)}
                />
              </div>
            )}
          </Section>

        </div>

        {/* Activity History */}
        {isEdit && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Activity History</h3>
              {(currentUser?.role === "Admin" || currentUser?.role === "SuperAdmin") && (
                <button
                  type="button"
                  onClick={() => {
                    if (!editingMaterial) return;
                    const userName = currentUser
                      ? `${currentUser.firstName}${currentUser.lastName ? " " + currentUser.lastName : ""}`.trim() || currentUser.email
                      : "Unknown";
                    const cleanEntry: ActivityEntry = {
                      id: uid(),
                      userName,
                      date: new Date().toISOString(),
                      activity: "History Deleted",
                    };
                    onSave({ ...editingMaterial, activityLog: [cleanEntry] });
                    onClose();
                  }}
                  className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded px-2 py-1 transition-colors"
                >
                  Clean History
                </button>
              )}
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase">User Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(editingMaterial?.activityLog ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-3 text-gray-400 text-center italic">No activity recorded yet.</td>
                    </tr>
                  ) : (
                    [...(editingMaterial?.activityLog ?? [])].reverse().map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-3 py-2 text-gray-700">{entry.userName}</td>
                        <td className="px-3 py-2 text-gray-500">{formatActivityDate(entry.date)}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            entry.activity === "CREATE"
                              ? "bg-green-100 text-green-700"
                              : entry.activity === "History Deleted"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>{entry.activity}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200">
          {/* Delete side */}
          <div>
            {!viewOnly && isEdit && onDelete && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600">Delete this material?</span>
                  <button
                    type="button"
                    onClick={() => { onDelete(); onClose(); }}
                    className="px-3 py-1.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )
            )}
          </div>
          {/* Save / Close side */}
          <div className="flex items-center gap-3">
            {viewOnly ? (
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Close
              </button>
            ) : (
              <>
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="button" onClick={handleSubmit} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                  {isEdit ? "Save Changes" : "Save Material"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "tc_materials";

const loadMaterials = (): Material[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Material[]) : [];
  } catch {
    return [];
  }
};

const saveMaterials = (list: Material[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

// ─── Supabase row ↔ Material helpers ─────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMaterial(row: any): Material {
  // Support BOTH old schema (data JSONB blob) and new flat-column schema
  if (row.data && typeof row.data === "object") {
    // Old schema: everything stored in `data` JSONB column
    const d = row.data as Material;
    return {
      id: d.id ?? row.id,
      name: d.name ?? "",
      supplierId: d.supplierId ?? "",
      supplierName: d.supplierName ?? "",
      materialCategory: d.materialCategory ?? "",
      importPackingItem: d.importPackingItem ?? "",
      importUnitItem: d.importUnitItem ?? "",
      importPackingUnitDefaultQty: d.importPackingUnitDefaultQty ?? "",
      originPostAddress: d.originPostAddress ?? {
        houseNumber: "", streetName: "", district: "", postCode: "", city: "", country: "",
      },
      activityLog: Array.isArray(d.activityLog) ? d.activityLog : [],
      createdAt: d.createdAt ?? row.created_at ?? "",
    };
  }
  // New flat-column schema
  return {
    id: row.id,
    name: row.name ?? "",
    supplierId: row.supplier_id ?? "",
    supplierName: row.supplier_name ?? "",
    materialCategory: row.material_category ?? "",
    importPackingItem: row.import_packing_item ?? "",
    importUnitItem: row.import_unit_item ?? "",
    importPackingUnitDefaultQty: row.import_packing_unit_default_qty ?? "",
    originPostAddress: {
      houseNumber: row.origin_house_number ?? "",
      streetName: row.origin_street_name ?? "",
      district: row.origin_district ?? "",
      postCode: row.origin_post_code ?? "",
      city: row.origin_city ?? "",
      country: row.origin_country ?? "",
    },
    activityLog: Array.isArray(row.activity_log) ? row.activity_log : [],
    createdAt: row.created_at ?? "",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function materialToRow(m: Material): any {
  return {
    id: m.id,
    name: m.name,
    supplier_id: m.supplierId,
    supplier_name: m.supplierName,
    material_category: m.materialCategory,
    import_packing_item: m.importPackingItem,
    import_unit_item: m.importUnitItem,
    import_packing_unit_default_qty: m.importPackingUnitDefaultQty,
    origin_house_number: m.originPostAddress.houseNumber,
    origin_street_name: m.originPostAddress.streetName,
    origin_district: m.originPostAddress.district,
    origin_post_code: m.originPostAddress.postCode,
    origin_city: m.originPostAddress.city,
    origin_country: m.originPostAddress.country,
    activity_log: m.activityLog,
    created_at: m.createdAt,
  };
}

const Materials: React.FC = () => {
  const { currentUser } = useAuth();
  const canEdit =
    currentUser?.role === "SuperAdmin" ||
    currentUser?.role === "Admin" ||
    currentUser?.role === "TraceChainAdminPortalAdmin" ||
    currentUser?.role === "TraceChainClientPortalAdmin";

  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(loadSuppliersFromStorage);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<Material | null>(null);

  // Load materials from Supabase on mount
  useEffect(() => {
    const fetchMaterials = async () => {
      if (supabase) {
        const { data, error } = await supabase
          .from("tc_materials")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          const loaded = data.map(rowToMaterial);
          setMaterials(loaded);
          saveMaterials(loaded);
        } else {
          console.error("❌ Supabase fetch tc_materials:", error?.message);
          setMaterials(loadMaterials());
        }
      } else {
        setMaterials(loadMaterials());
      }
    };
    fetchMaterials();
  }, []);

  // Reload suppliers from localStorage whenever this component mounts
  useEffect(() => {
    setSuppliers(loadSuppliersFromStorage());
  }, []);

  // Also listen for cross-tab storage changes
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === SETTINGS_SUPPLIERS_KEY) {
        setSuppliers(loadSuppliersFromStorage());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const filtered = materials.filter((m) => {
    const q = search.toLowerCase();
    return (
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.supplierName.toLowerCase().includes(q) ||
      m.materialCategory.toLowerCase().includes(q) ||
      m.importPackingItem.toLowerCase().includes(q)
    );
  });

  const handleSave = async (m: Material) => {
    const row = materialToRow(m);
    if (supabase) {
      if (editingMaterial) {
        const { error } = await supabase
          .from("tc_materials")
          .update(row)
          .eq("id", m.id);
        if (error) {
          console.error("❌ Supabase update error (tc_materials):", error.message);
          return;
        }
        setMaterials((prev) => {
          const next = prev.map((x) => (x.id === m.id ? m : x));
          saveMaterials(next);
          return next;
        });
      } else {
        const { error } = await supabase
          .from("tc_materials")
          .insert(row);
        if (error) {
          console.error("❌ Supabase insert error (tc_materials):", error.message);
          return;
        }
        setMaterials((prev) => {
          const next = [m, ...prev];
          saveMaterials(next);
          return next;
        });
      }
    } else {
      setMaterials((prev) => {
        const next = editingMaterial
          ? prev.map((x) => (x.id === m.id ? m : x))
          : [m, ...prev];
        saveMaterials(next);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (supabase) {
      const { error } = await supabase.from("tc_materials").delete().eq("id", id);
      if (error) {
        console.error("❌ Supabase delete error (tc_materials):", error.message);
        return;
      }
    }
    setMaterials((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveMaterials(next);
      return next;
    });
    setShowModal(false);
    setEditingMaterial(null);
  };

  const openCreate = () => { setEditingMaterial(null); setShowModal(true); };
  const openEdit = (m: Material) => { setEditingMaterial(m); setShowModal(true); };
  const openView = (m: Material) => { setViewingMaterial(m); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Materials</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage raw material definitions used in your processes.</p>
        </div>
        {canEdit && (
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={15} /> Add Material
        </button>
        )}
      </div>

      {/* Search bar */}
      {materials.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search materials…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Table / Empty state */}
      {materials.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-3">🧱</div>
          <p className="text-gray-700 font-medium">No materials yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first material to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Material Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Packing</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Origin Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                      No materials match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => canEdit ? openEdit(m) : openView(m)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                      <td className="px-4 py-3 text-gray-700">{m.supplierName}</td>
                      <td className="px-4 py-3 text-gray-500">{m.materialCategory || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{m.importPackingItem || "—"}</td>
                      <td className="px-4 py-3">
                        {m.importUnitItem
                          ? <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{m.importUnitItem}</span>
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{m.importPackingUnitDefaultQty || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate" title={formatAddress(m.originPostAddress)}>
                        {formatAddress(m.originPostAddress)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {materials.length} material{materials.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddMaterialModal
          onClose={() => { setShowModal(false); setEditingMaterial(null); }}
          onSave={handleSave}
          onDelete={editingMaterial ? () => handleDelete(editingMaterial.id) : undefined}
          suppliers={suppliers}
          materials={materials}
          editingMaterial={editingMaterial}
        />
      )}

      {/* View-only modal for normal users */}
      {viewingMaterial && (
        <AddMaterialModal
          onClose={() => setViewingMaterial(null)}
          onSave={() => {}}
          suppliers={suppliers}
          materials={materials}
          editingMaterial={viewingMaterial}
          viewOnly
        />
      )}
    </div>
  );
};

export default Materials;
