import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2, X, Search, Edit2, ChevronDown, Eye } from "lucide-react";
import { loadStorageRequirements } from "@/components/modals/StorageRequirementsModal";
import { useUnits } from "@/context/UnitsContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

// ─── Activity Log ─────────────────────────────────────────────────────────────

interface ActivityEntry {
  id: string;
  userName: string;
  date: string;
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
  locationRoom: string;
}

interface Product {
  id: string;
  name: string;
  productCategory: string;
  commercialName: string;
  internalId: string;
  gs1Id: string;
  barcodeId: string;
  packingItem: string;
  unit: string;
  unitDefaultQuantity: string;
  storageRequirement: string;
  storagePostAddress: PostAddress;
  other1: string;
  other2: string;
  other3: string;
  createdAt: string;
  activityLog: ActivityEntry[];
}

// ─── Library Data ─────────────────────────────────────────────────────────────

const PRODUCT_NAME_LIBRARY = [
  "Green Tea (500g)", "Black Tea (250g)", "Jasmine Tea (100g)", "Dried Mango Slices",
  "Coconut Sugar (1kg)", "Jasmine Rice (5kg)", "Glutinous Rice (2kg)", "Cassava Chips",
  "Black Pepper Powder (100g)", "Sea Salt (500g)", "Raw Honey (250ml)", "Palm Sugar Block",
  "Wheat Flour (1kg)", "Tapioca Starch (500g)", "Soybean Oil (1L)", "Sesame Oil (500ml)",
  "Fish Sauce (700ml)", "Soy Sauce (500ml)", "Oyster Sauce (300g)", "Coconut Milk (400ml)",
  "Chili Paste (200g)", "Garlic Powder (100g)", "Turmeric Powder (50g)", "Lemongrass Tea (20 bags)",
  "Mung Bean Vermicelli (200g)", "Black Bean Paste (250g)", "Chickpea Flour (500g)", "Argan Oil (100ml)",
];

const PRODUCT_CATEGORY_LIBRARY = [
  "Beverages", "Dried Goods", "Grains & Rice", "Oils & Fats",
  "Condiments & Sauces", "Spices & Herbs", "Dairy & Alternatives", "Snacks & Confectionery",
  "Fresh Produce", "Frozen Foods", "Organic Products", "Health & Wellness",
  "Baby & Infant", "Seafood & Fish", "Meat & Poultry", "Bakery & Pastry",
  "Packaging & Containers", "Other",
];

const PACKING_ITEM_LIBRARY = [
  "Retail Bag (Zipper)", "Retail Box (Cardboard)", "Glass Jar", "PET Bottle",
  "Aluminium Can", "Vacuum Pouch", "Tetrapak Carton", "Flexible Stand-up Pouch",
  "Tin Can", "Paper Wrap", "Blister Pack", "Shrink Wrap",
  "Jute Bag", "PP Woven Bag", "Wooden Crate", "Pallet (Wooden)",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => crypto.randomUUID();
const today = () => new Date().toISOString().slice(0, 10);

const formatAddress = (a: PostAddress) => {
  const parts = [a.houseNumber, a.streetName, a.district, a.postCode, a.city, a.country, a.locationRoom].filter(Boolean);
  return parts.join(", ") || "—";
};

const emptyAddress = (): PostAddress => ({
  houseNumber: "", streetName: "", district: "", postCode: "", city: "", country: "", locationRoom: "",
});

const emptyProduct = (): Omit<Product, "id" | "createdAt" | "activityLog"> => ({
  name: "", productCategory: "", commercialName: "", internalId: "",
  gs1Id: "", barcodeId: "", packingItem: "", unit: "", unitDefaultQuantity: "",
  storageRequirement: "",
  storagePostAddress: emptyAddress(), other1: "", other2: "", other3: "",
});

// ─── Supabase helpers ─────────────────────────────────────────────────────────

type DbRow = {
  id: string;
  name: string;
  product_category: string;
  commercial_name: string;
  internal_id: string;
  gs1_id: string;
  barcode_id: string;
  packing_item: string;
  unit: string;
  unit_default_quantity: string;
  storage_requirement: string;
  storage_house_number: string;
  storage_street_name: string;
  storage_district: string;
  storage_post_code: string;
  storage_city: string;
  storage_country: string;
  storage_location_room: string;
  other1: string;
  other2: string;
  other3: string;
  activity_log: ActivityEntry[];
  created_at: string;
};

function rowToProduct(row: DbRow): Product {
  return {
    id: row.id,
    name: row.name,
    productCategory: row.product_category,
    commercialName: row.commercial_name,
    internalId: row.internal_id,
    gs1Id: row.gs1_id,
    barcodeId: row.barcode_id,
    packingItem: row.packing_item,
    unit: row.unit,
    unitDefaultQuantity: row.unit_default_quantity,
    storageRequirement: row.storage_requirement,
    storagePostAddress: {
      houseNumber: row.storage_house_number,
      streetName: row.storage_street_name,
      district: row.storage_district,
      postCode: row.storage_post_code,
      city: row.storage_city,
      country: row.storage_country,
      locationRoom: row.storage_location_room,
    },
    other1: row.other1,
    other2: row.other2,
    other3: row.other3,
    activityLog: Array.isArray(row.activity_log) ? row.activity_log : [],
    createdAt: row.created_at,
  };
}

function productToRow(p: Product): DbRow {
  return {
    id: p.id,
    name: p.name,
    product_category: p.productCategory,
    commercial_name: p.commercialName,
    internal_id: p.internalId,
    gs1_id: p.gs1Id,
    barcode_id: p.barcodeId,
    packing_item: p.packingItem,
    unit: p.unit,
    unit_default_quantity: p.unitDefaultQuantity,
    storage_requirement: p.storageRequirement,
    storage_house_number: p.storagePostAddress.houseNumber,
    storage_street_name: p.storagePostAddress.streetName,
    storage_district: p.storagePostAddress.district,
    storage_post_code: p.storagePostAddress.postCode,
    storage_city: p.storagePostAddress.city,
    storage_country: p.storagePostAddress.country,
    storage_location_room: p.storagePostAddress.locationRoom,
    other1: p.other1,
    other2: p.other2,
    other3: p.other3,
    activity_log: p.activityLog,
    created_at: p.createdAt,
  };
}

// ─── localStorage fallback ────────────────────────────────────────────────────

const LS_KEY = "tc_settings_products";
const lsLoad = (): Product[] => {
  try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : []; }
  catch { return []; }
};
const lsSave = (list: Product[]) => localStorage.setItem(LS_KEY, JSON.stringify(list));

// ─── AutocompleteInput ────────────────────────────────────────────────────────

interface AutocompleteInputProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ value, onChange, options, placeholder, error }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = options.filter((o) => o.toLowerCase().includes(value.toLowerCase())).slice(0, 10);

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
            <li key={opt} onMouseDown={() => { onChange(opt); setOpen(false); }}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer">
              {opt}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
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

// ─── AddProductModal ──────────────────────────────────────────────────────────

interface AddProductModalProps {
  onClose: () => void;
  onSave: (p: Product) => void;
  onDelete?: () => void;
  editingProduct?: Product | null;
  viewOnly?: boolean;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onSave, onDelete, editingProduct, viewOnly = false }) => {
  const isEdit = !!editingProduct;
  const { activeUnits } = useUnits();
  const { currentUser } = useAuth();
  const UNIT_ITEM_LIBRARY = activeUnits.map((u) => `${u.name} (${u.abbreviation})`);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState<Omit<Product, "id" | "createdAt" | "activityLog">>(
    editingProduct
      ? {
          name: editingProduct.name, productCategory: editingProduct.productCategory,
          commercialName: editingProduct.commercialName, internalId: editingProduct.internalId,
          gs1Id: editingProduct.gs1Id, barcodeId: editingProduct.barcodeId,
          packingItem: editingProduct.packingItem, unit: editingProduct.unit,
          unitDefaultQuantity: editingProduct.unitDefaultQuantity,
          storageRequirement: editingProduct.storageRequirement ?? "",
          storagePostAddress: editingProduct.storagePostAddress,
          other1: editingProduct.other1, other2: editingProduct.other2, other3: editingProduct.other3,
        }
      : emptyProduct()
  );

  const [nameError, setNameError] = useState("");
  const [storageOptions, setStorageOptions] = useState<string[]>(() => loadStorageRequirements());

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const setAddr = (field: keyof PostAddress, val: string) =>
    setForm((prev) => ({ ...prev, storagePostAddress: { ...prev.storagePostAddress, [field]: val } }));

  const handleSubmit = () => {
    if (!form.name.trim()) { setNameError("Product name is required."); return; }
    onSave({
      id: editingProduct?.id ?? uid(),
      ...form,
      name: form.name.trim(),
      other2: form.other2.slice(0, 50),
      other3: form.other3.slice(0, 50),
      createdAt: editingProduct?.createdAt ?? new Date().toISOString(),
      activityLog: [
        ...(editingProduct?.activityLog ?? []),
        {
          id: uid(),
          userName: currentUser
            ? `${currentUser.firstName}${currentUser.lastName ? " " + currentUser.lastName : ""}`.trim() || currentUser.email
            : "Unknown",
          date: new Date().toISOString(),
          activity: isEdit ? "MODIFIED" : "CREATE",
        } as ActivityEntry,
      ],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{viewOnly ? "View Product" : isEdit ? "Edit Product" : "Add a Product"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-7 overflow-y-auto max-h-[75vh]">

          {/* Name */}
          <Section title="Product Name">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <AutocompleteInput
              value={form.name}
              onChange={(v) => { set("name", v); setNameError(""); }}
              options={PRODUCT_NAME_LIBRARY}
              placeholder="Type to search library or enter a custom name…"
              error={nameError}
            />
            <p className="text-xs text-gray-400 mt-1">Start typing to match from the library, or enter a new custom name.</p>
          </Section>

          {/* Product Category */}
          <Section title="Product Category">
            <label className="block text-xs font-medium text-gray-600 mb-1">Product Category</label>
            <AutocompleteInput
              value={form.productCategory}
              onChange={(v) => set("productCategory", v)}
              options={PRODUCT_CATEGORY_LIBRARY}
              placeholder="Search or enter category…"
            />
            <p className="text-xs text-gray-400 mt-1">Choose from list or enter a custom category.</p>
          </Section>

          {/* Identifiers */}
          <Section title="Identifiers">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                ["commercialName", "Commercial Name", "e.g. Brand display name"],
                ["internalId", "Internal ID", "e.g. PRD-001"],
                ["gs1Id", "GS1 ID", "e.g. 0614141123452"],
                ["barcodeId", "Bar Code ID", "e.g. EAN-13 / UPC"],
              ] as [keyof typeof form, string, string][]).map(([field, label, ph]) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    type="text"
                    value={form[field] as string}
                    onChange={(e) => set(field, e.target.value)}
                    placeholder={ph}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* Packing & Unit */}
          <Section title="Packing & Unit">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Packing Item</label>
                <AutocompleteInput
                  value={form.packingItem}
                  onChange={(v) => set("packingItem", v)}
                  options={PACKING_ITEM_LIBRARY}
                  placeholder="e.g. Retail Box, Glass Jar…"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                <AutocompleteInput
                  value={form.unit}
                  onChange={(v) => set("unit", v)}
                  options={UNIT_ITEM_LIBRARY}
                  placeholder="Search units…"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit Default Quantity</label>
                <input
                  type="number" min="0" step="any"
                  value={form.unitDefaultQuantity}
                  onChange={(e) => set("unitDefaultQuantity", e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Section>

          {/* Storage Requirements */}
          <Section title="Storage Requirement">
            <label className="block text-xs font-medium text-gray-600 mb-1">Storage Requirement</label>
            <div className="relative">
              <select
                value={form.storageRequirement}
                onChange={(e) => set("storageRequirement", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 bg-white"
              >
                <option value="">— Select a storage requirement —</option>
                {storageOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Options are managed in the avatar menu → Storage Requirements.</p>
          </Section>

          {/* Storage Post Address */}
          <Section title="Storage Post Address">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-gray-200 rounded-xl p-4 bg-gray-50">
              {([
                ["houseNumber", "House N°", "123"],
                ["streetName", "Street Name", "Main Street"],
                ["district", "District", ""],
                ["postCode", "Post Code", ""],
                ["city", "City", ""],
                ["country", "Country", ""],
                ["locationRoom", "Location / Room", "e.g. Warehouse A, Room 3"],
              ] as [keyof PostAddress, string, string][]).map(([field, label, ph]) => (
                <div key={field} className={field === "locationRoom" ? "sm:col-span-2" : ""}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {label}{field === "locationRoom" && <span className="text-gray-400 font-normal ml-1">(max 50 chars)</span>}
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.storagePostAddress[field]}
                    onChange={(e) => setAddr(field, e.target.value)}
                    placeholder={ph}
                    maxLength={field === "locationRoom" ? 50 : undefined}
                  />
                  {field === "locationRoom" && (
                    <p className="text-xs text-gray-400 mt-1 text-right">{form.storagePostAddress.locationRoom.length}/50</p>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Other Fields */}
          <Section title="Other Fields">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Other 1</label>
                <input
                  type="text" value={form.other1}
                  onChange={(e) => set("other1", e.target.value)}
                  placeholder="Optional"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Other 2 <span className="text-gray-400 font-normal">(max 50 chars)</span>
                </label>
                <input
                  type="text" maxLength={50} value={form.other2}
                  onChange={(e) => set("other2", e.target.value)}
                  placeholder="Optional — VARCHAR50"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.other2.length}/50</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Other 3 <span className="text-gray-400 font-normal">(max 50 chars)</span>
                </label>
                <input
                  type="text" maxLength={50} value={form.other3}
                  onChange={(e) => set("other3", e.target.value)}
                  placeholder="Optional — VARCHAR50"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.other3.length}/50</p>
              </div>
            </div>
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
                    if (!editingProduct) return;
                    const userName = currentUser
                      ? `${currentUser.firstName}${currentUser.lastName ? " " + currentUser.lastName : ""}`.trim() || currentUser.email
                      : "Unknown";
                    const cleanEntry: ActivityEntry = {
                      id: uid(),
                      userName,
                      date: new Date().toISOString(),
                      activity: "History Deleted",
                    };
                    onSave({ ...editingProduct, activityLog: [cleanEntry] });
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
                  {(editingProduct?.activityLog ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-3 text-gray-400 text-center italic">No activity recorded yet.</td>
                    </tr>
                  ) : (
                    [...(editingProduct?.activityLog ?? [])].reverse().map((entry) => (
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
                  <span className="text-sm text-red-600">Delete this product?</span>
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
              <button type="button" onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Close
              </button>
            ) : (
              <>
                <button type="button" onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="button" onClick={handleSubmit}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                  {isEdit ? "Save Changes" : "Save Product"}
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

const SettingsProducts: React.FC = () => {
  const { currentUser } = useAuth();
  const canEdit =
    currentUser?.role === "SuperAdmin" ||
    currentUser?.role === "Admin" ||
    currentUser?.role === "TraceChainAdminPortalAdmin" ||
    currentUser?.role === "TraceChainClientPortalAdmin";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // ── Load from Supabase or localStorage ──
  useEffect(() => {
    if (supabase) {
      supabase
        .from("tc_settings_products")
        .select("*")
        .then(({ data, error }) => {
          if (error) {
            console.error("❌ Supabase fetch tc_settings_products:", error.message, error.details, error.hint);
            // Fall back to localStorage
            setProducts(lsLoad());
          } else {
            const rows = (data as DbRow[]).map(rowToProduct);
            if (rows.length > 0) {
              // Sort newest first by created_at
              rows.sort((a, b) => (b.createdAt > a.createdAt ? -1 : 1));
              setProducts(rows);
              // Sync localStorage with Supabase data
              lsSave(rows);
            } else {
              // Supabase returned empty — check localStorage for any locally-saved products
              const local = lsLoad();
              setProducts(local);
            }
          }
          setLoading(false);
        });
    } else {
      setProducts(lsLoad());
      setLoading(false);
    }
  }, []);

  const handleSave = async (p: Product) => {
    // Determine if this is a new product by checking if any existing product has the same id
    const isNew = !products.some((x) => x.id === p.id);
    if (supabase) {
      const row = productToRow(p);
      if (isNew) {
        const { data, error } = await supabase
          .from("tc_settings_products")
          .insert(row)
          .select()
          .single();
        if (error) {
          console.error("❌ Supabase insert tc_settings_products:", error.message, error.details, error.hint);
          alert(`⚠️ Could not save to database: ${error.message}\n\nProduct saved locally instead and will reappear until the page is fully refreshed.`);
          // Fall back: keep in local state + localStorage so it persists until Supabase is fixed
          setProducts((prev) => {
            const next = [p, ...prev];
            lsSave(next);
            return next;
          });
          return;
        }
        setProducts((prev) => {
          const next = [rowToProduct(data as DbRow), ...prev];
          lsSave(next);
          return next;
        });
      } else {
        const { error } = await supabase
          .from("tc_settings_products")
          .update(row)
          .eq("id", p.id);
        if (error) {
          console.error("❌ Supabase update tc_settings_products:", error.message, error.details, error.hint);
        }
        setProducts((prev) => {
          const next = prev.map((x) => (x.id === p.id ? p : x));
          lsSave(next);
          return next;
        });
      }
    } else {
      setProducts((prev) => {
        const next = isNew ? [p, ...prev] : prev.map((x) => (x.id === p.id ? p : x));
        lsSave(next);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (supabase) {
      const { error } = await supabase.from("tc_settings_products").delete().eq("id", id);
      if (error) console.error("❌ Supabase delete tc_settings_products:", error.message);
    }
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      lsSave(next);
      return next;
    });
    setShowModal(false);
    setEditingProduct(null);
  };

  const openCreate = () => { setEditingProduct(null); setShowModal(true); };
  const openEdit = (p: Product) => { setEditingProduct(p); setShowModal(true); };
  const openView = (p: Product) => { setViewingProduct(p); };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.productCategory.toLowerCase().includes(q) ||
      p.commercialName.toLowerCase().includes(q) ||
      p.internalId.toLowerCase().includes(q) ||
      p.gs1Id.toLowerCase().includes(q) ||
      p.barcodeId.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Loading products…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Products</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage product definitions used in your processes.</p>
        </div>
        {canEdit && (
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={15} /> Add Product
        </button>
        )}
      </div>

      {/* Search bar */}
      {products.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Table / Empty state */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-gray-700 font-medium">No products yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first product to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Commercial Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Internal ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">GS1 ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Barcode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Packing</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Storage Req.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Storage Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-10 text-center text-gray-400 text-sm">
                      No products match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => canEdit ? openEdit(p) : openView(p)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-gray-500">{p.productCategory || "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{p.commercialName || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{p.internalId || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{p.gs1Id || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{p.barcodeId || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{p.packingItem || "—"}</td>
                      <td className="px-4 py-3">
                        {p.unit ? <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{p.unit}</span> : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{p.unitDefaultQuantity || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate" title={p.storageRequirement || ""}>
                        {p.storageRequirement ? (
                          <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{p.storageRequirement}</span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate" title={formatAddress(p.storagePostAddress)}>
                        {formatAddress(p.storagePostAddress)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {products.length} product{products.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddProductModal
          onClose={() => { setShowModal(false); setEditingProduct(null); }}
          onSave={handleSave}
          onDelete={editingProduct ? () => handleDelete(editingProduct.id) : undefined}
          editingProduct={editingProduct}
        />
      )}

      {/* View-only modal for normal users */}
      {viewingProduct && (
        <AddProductModal
          onClose={() => setViewingProduct(null)}
          onSave={() => {}}
          editingProduct={viewingProduct}
          viewOnly
        />
      )}
    </div>
  );
};

export default SettingsProducts;
