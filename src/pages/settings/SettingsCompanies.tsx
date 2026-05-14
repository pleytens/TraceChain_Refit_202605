import React, { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AddressType = string;

interface PostAddress {
  id: string;
  addressName: string;
  type: AddressType;
  customType: string;
  houseNumber: string;
  streetName: string;
  district: string;
  postCode: string;
  city: string;
  country: string;
}

interface ContactDetail {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  addressTypeRef: string;
}

interface TelephoneDetail {
  id: string;
  number: string;
  addressTypeRef: string;
}

interface EmailDetail {
  id: string;
  email: string;
  addressTypeRef: string;
}

interface ContractDetail {
  invoiceCustomerIDN: string;
  invoicePostAddress: string;
  invoiceEmail: string;
  invoiceTelNumber: string;
  taxID: string;
  invoiceContactName: string;
}

interface SupplierForm {
  supplierName: string;
  businessCategory: string;
  supplierType: string;
  postAddresses: PostAddress[];
  telephones: TelephoneDetail[];
  emails: EmailDetail[];
  contacts: ContactDetail[];
  contractDetail: ContractDetail;
  materialOriginAddresses: PostAddress[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ADDRESS_TYPE_OPTIONS: string[] = ["office", "home", "warehouse", "P/O", "Attn"];
const BUSINESS_CATEGORIES = ["Agriculture", "Manufacturing", "Retail", "Wholesale", "Logistics", "Technology", "Food & Beverage", "Textile", "Chemical", "Other"];
const SUPPLIER_TYPES = ["Limited", "Inc.", "JSC", "LLC", "PLC", "Co., Ltd.", "GmbH", "Sole Proprietorship", "Partnership", "Other"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

const emptyAddress = (): PostAddress => ({
  id: uid(),
  addressName: "",
  type: "office",
  customType: "",
  houseNumber: "",
  streetName: "",
  district: "",
  postCode: "",
  city: "",
  country: "",
});

const defaultForm = (): SupplierForm => ({
  supplierName: "",
  businessCategory: "",
  supplierType: "",
  postAddresses: [emptyAddress()],
  telephones: [{ id: uid(), number: "", addressTypeRef: "office" }],
  emails: [{ id: uid(), email: "", addressTypeRef: "office" }],
  contacts: [{ id: uid(), name: "", firstName: "", lastName: "", addressTypeRef: "office" }],
  contractDetail: {
    invoiceCustomerIDN: "",
    invoicePostAddress: "",
    invoiceEmail: "",
    invoiceTelNumber: "",
    taxID: "",
    invoiceContactName: "",
  },
  materialOriginAddresses: [],
});

// ─── AddressTypeSelect ────────────────────────────────────────────────────────

interface AddressTypeSelectProps {
  value: string;
  customValue: string;
  onChange: (type: string, custom: string) => void;
  label?: string;
}

const AddressTypeSelect: React.FC<AddressTypeSelectProps> = ({ value, customValue, onChange, label }) => {
  const isCustom = !ADDRESS_TYPE_OPTIONS.includes(value);
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <div className="flex gap-2">
        <select
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={isCustom ? "__custom__" : value}
          onChange={(e) => {
            if (e.target.value === "__custom__") {
              onChange("__custom__", customValue);
            } else {
              onChange(e.target.value, "");
            }
          }}
        >
          {ADDRESS_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
          <option value="__custom__">+ Add custom…</option>
        </select>
        {(isCustom || value === "__custom__") && (
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Custom type"
            value={customValue}
            onChange={(e) => onChange("__custom__", e.target.value)}
          />
        )}
      </div>
    </div>
  );
};

// ─── PostAddressForm ──────────────────────────────────────────────────────────

interface PostAddressFormProps {
  address: PostAddress;
  index: number;
  onChange: (updated: PostAddress) => void;
  onRemove?: () => void;
  showRemove?: boolean;
  title?: string;
}

const PostAddressForm: React.FC<PostAddressFormProps> = ({ address, index, onChange, onRemove, showRemove = true, title }) => {
  const update = (field: keyof PostAddress, val: string) => onChange({ ...address, [field]: val });

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">{title ?? `Address ${index + 1}`}</span>
        {showRemove && onRemove && (
          <button type="button" onClick={onRemove} className="text-red-400 hover:text-red-600 transition">
            <Trash2 size={15} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Address Name</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={address.addressName} onChange={(e) => update("addressName", e.target.value)} placeholder="e.g. Head Office" />
        </div>
        <AddressTypeSelect
          label="Type"
          value={address.type}
          customValue={address.customType}
          onChange={(type, custom) => onChange({ ...address, type, customType: custom })}
        />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">House N°</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={address.houseNumber} onChange={(e) => update("houseNumber", e.target.value)} placeholder="123" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Street Name</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={address.streetName} onChange={(e) => update("streetName", e.target.value)} placeholder="Main Street" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">District</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={address.district} onChange={(e) => update("district", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Post Code</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={address.postCode} onChange={(e) => update("postCode", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={address.city} onChange={(e) => update("city", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
          <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={address.country} onChange={(e) => update("country", e.target.value)} />
        </div>
      </div>
    </div>
  );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1">{title}</h3>
    {children}
  </div>
);

// ─── AddSupplierModal ─────────────────────────────────────────────────────────

interface AddSupplierModalProps {
  onClose: () => void;
  onSave: (supplier: SupplierForm) => void;
  existingNames: string[];
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ onClose, onSave, existingNames }) => {
  const [form, setForm] = useState<SupplierForm>(defaultForm());
  const [errors, setErrors] = useState<{ supplierName?: string }>({});

  const set = (field: keyof SupplierForm, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // PostAddresses
  const updateAddress = (id: string, updated: PostAddress) =>
    set("postAddresses", form.postAddresses.map((a) => (a.id === id ? updated : a)));
  const addAddress = () => set("postAddresses", [...form.postAddresses, emptyAddress()]);
  const removeAddress = (id: string) =>
    set("postAddresses", form.postAddresses.filter((a) => a.id !== id));

  // Telephones
  const updateTel = (id: string, field: keyof TelephoneDetail, val: string) =>
    set("telephones", form.telephones.map((t) => (t.id === id ? { ...t, [field]: val } : t)));
  const addTel = () => set("telephones", [...form.telephones, { id: uid(), number: "", addressTypeRef: "office" }]);
  const removeTel = (id: string) => set("telephones", form.telephones.filter((t) => t.id !== id));

  // Emails
  const updateEmail = (id: string, field: keyof EmailDetail, val: string) =>
    set("emails", form.emails.map((e) => (e.id === id ? { ...e, [field]: val } : e)));
  const addEmail = () => set("emails", [...form.emails, { id: uid(), email: "", addressTypeRef: "office" }]);
  const removeEmail = (id: string) => set("emails", form.emails.filter((e) => e.id !== id));

  // Contacts
  const updateContact = (id: string, field: keyof ContactDetail, val: string) =>
    set("contacts", form.contacts.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
  const addContact = () => set("contacts", [...form.contacts, { id: uid(), name: "", firstName: "", lastName: "", addressTypeRef: "office" }]);
  const removeContact = (id: string) => set("contacts", form.contacts.filter((c) => c.id !== id));

  // Contract
  const updateContract = (field: keyof ContractDetail, val: string) =>
    set("contractDetail", { ...form.contractDetail, [field]: val });

  // Material Origin Addresses
  const updateMaterialAddress = (id: string, updated: PostAddress) =>
    set("materialOriginAddresses", form.materialOriginAddresses.map((a) => (a.id === id ? updated : a)));
  const addMaterialAddress = () => {
    if (form.materialOriginAddresses.length >= 20) return;
    set("materialOriginAddresses", [...form.materialOriginAddresses, emptyAddress()]);
  };
  const removeMaterialAddress = (id: string) =>
    set("materialOriginAddresses", form.materialOriginAddresses.filter((a) => a.id !== id));

  const handleSubmit = () => {
    const newErrors: typeof errors = {};
    if (!form.supplierName.trim()) {
      newErrors.supplierName = "Supplier name is required.";
    } else if (existingNames.map((n) => n.toLowerCase()).includes(form.supplierName.trim().toLowerCase())) {
      newErrors.supplierName = "A supplier with this name already exists.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSave(form);
    onClose();
  };

  const addressTypeOptions = [
    ...ADDRESS_TYPE_OPTIONS,
    ...form.postAddresses
      .filter((a) => a.type === "__custom__" && a.customType.trim())
      .map((a) => a.customType),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Add a Supplier</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-7 overflow-y-auto max-h-[75vh]">

          {/* 1. Supplier Name */}
          <Section title="1. Supplier Name">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <input
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.supplierName ? "border-red-400" : "border-gray-300"}`}
                value={form.supplierName}
                onChange={(e) => {
                  set("supplierName", e.target.value);
                  if (errors.supplierName) setErrors({});
                }}
                placeholder="Enter supplier name"
              />
              {errors.supplierName && <p className="text-red-500 text-xs mt-1">{errors.supplierName}</p>}
            </div>
          </Section>

          {/* 2. Business Category */}
          <Section title="2. Business Category">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Business Category</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.businessCategory}
                onChange={(e) => set("businessCategory", e.target.value)}
              >
                <option value="">— Select —</option>
                {BUSINESS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </Section>

          {/* 3. Supplier Type */}
          <Section title="3. Supplier Type">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Supplier Type</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.supplierType}
                onChange={(e) => set("supplierType", e.target.value)}
              >
                <option value="">— Select —</option>
                {SUPPLIER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </Section>

          {/* 4. Post Addresses */}
          <Section title="4. Post Addresses">
            <div className="space-y-4">
              {form.postAddresses.map((addr, i) => (
                <PostAddressForm
                  key={addr.id}
                  address={addr}
                  index={i}
                  onChange={(updated) => updateAddress(addr.id, updated)}
                  onRemove={() => removeAddress(addr.id)}
                  showRemove={form.postAddresses.length > 1}
                />
              ))}
              <button type="button" onClick={addAddress} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 transition">
                <Plus size={14} /> Add another address
              </button>
            </div>
          </Section>

          {/* 4. Telephone Details */}
          <Section title="4. Telephone Details">
            <div className="space-y-3">
              {form.telephones.map((tel) => (
                <div key={tel.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone N°</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={tel.number}
                      onChange={(e) => updateTel(tel.id, "number", e.target.value)}
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Address Type</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={tel.addressTypeRef}
                      onChange={(e) => updateTel(tel.id, "addressTypeRef", e.target.value)}
                    >
                      {addressTypeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end justify-end">
                    {form.telephones.length > 1 && (
                      <button type="button" onClick={() => removeTel(tel.id)} className="text-red-400 hover:text-red-600 pb-2">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" onClick={addTel} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 transition">
                <Plus size={14} /> Add telephone
              </button>
            </div>
          </Section>

          {/* 4.1 Email Addresses */}
          <Section title="4.1 Email Addresses">
            <div className="space-y-3">
              {form.emails.map((em) => (
                <div key={em.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={em.email}
                      onChange={(e) => updateEmail(em.id, "email", e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Address Type</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={em.addressTypeRef}
                      onChange={(e) => updateEmail(em.id, "addressTypeRef", e.target.value)}
                    >
                      {addressTypeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end justify-end">
                    {form.emails.length > 1 && (
                      <button type="button" onClick={() => removeEmail(em.id)} className="text-red-400 hover:text-red-600 pb-2">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" onClick={addEmail} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 transition">
                <Plus size={14} /> Add email
              </button>
            </div>
          </Section>

          {/* 4.2 Contact Details */}
          <Section title="4.2 Contact Details">
            <div className="space-y-3">
              {form.contacts.map((c) => (
                <div key={c.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={c.name} onChange={(e) => updateContact(c.id, "name", e.target.value)} placeholder="Full name" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={c.firstName} onChange={(e) => updateContact(c.id, "firstName", e.target.value)} placeholder="First name" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                      <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={c.lastName} onChange={(e) => updateContact(c.id, "lastName", e.target.value)} placeholder="Last name" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Address Type</label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={c.addressTypeRef} onChange={(e) => updateContact(c.id, "addressTypeRef", e.target.value)}>
                        {addressTypeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>
                  {form.contacts.length > 1 && (
                    <div className="flex justify-end">
                      <button type="button" onClick={() => removeContact(c.id)} className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1">
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button type="button" onClick={addContact} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 transition">
                <Plus size={14} /> Add contact
              </button>
            </div>
          </Section>

          {/* 5. Contract Details */}
          <Section title="5. Contract Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-gray-200 rounded-xl p-4 bg-gray-50">
              {([
                { field: "invoiceCustomerIDN" as const, label: "Invoice Customer IDN #" },
                { field: "invoicePostAddress" as const, label: "Invoice Post Address" },
                { field: "invoiceEmail" as const, label: "Invoice Email" },
                { field: "invoiceTelNumber" as const, label: "Invoice Tel N°" },
                { field: "taxID" as const, label: "Tax ID" },
                { field: "invoiceContactName" as const, label: "Invoice Contact Name" },
              ]).map(({ field, label }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.contractDetail[field]}
                    onChange={(e) => updateContract(field, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* 6. Material Origin Addresses */}
          <Section title={`6. Material Origin Post Addresses (${form.materialOriginAddresses.length}/20)`}>
            <div className="space-y-4">
              {form.materialOriginAddresses.length === 0 && (
                <p className="text-xs text-gray-400 italic">No material origin addresses added yet.</p>
              )}
              {form.materialOriginAddresses.map((addr, i) => (
                <PostAddressForm
                  key={addr.id}
                  address={addr}
                  index={i}
                  title={`Material Origin Address ${i + 1}`}
                  onChange={(updated) => updateMaterialAddress(addr.id, updated)}
                  onRemove={() => removeMaterialAddress(addr.id)}
                  showRemove
                />
              ))}
              {form.materialOriginAddresses.length < 20 ? (
                <button type="button" onClick={addMaterialAddress} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 transition">
                  <Plus size={14} /> Add material origin address
                </button>
              ) : (
                <p className="text-xs text-orange-500">Maximum of 20 material origin addresses reached.</p>
              )}
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Save Supplier
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const SettingsSuppliers: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierForm[]>([]);

  const existingNames = suppliers.map((s) => s.supplierName);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
        <p className="text-sm text-gray-500">Manage Supplier profiles, details and configurations.</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={15} /> Add Supplier
        </button>
      </div>

      {suppliers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-3">🏭</div>
          <p className="text-gray-500 text-sm">No suppliers added yet.</p>
          <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
            + Add Supplier
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Supplier Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Business Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Supplier Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Addresses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suppliers.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.supplierName}</td>
                  <td className="px-4 py-3 text-gray-600">{s.businessCategory || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{s.supplierType || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{s.postAddresses.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddSupplierModal
          onClose={() => setShowModal(false)}
          onSave={(supplier) => setSuppliers((prev) => [...prev, supplier])}
          existingNames={existingNames}
        />
      )}
    </div>
  );
};

export default SettingsSuppliers;
