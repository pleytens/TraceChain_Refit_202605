import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, X, Pencil, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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

interface CustomerForm {
  customerName: string;
  industryCategory: string;
  customerType: string;
  postAddresses: PostAddress[];
  telephones: TelephoneDetail[];
  emails: EmailDetail[];
  contacts: ContactDetail[];
  contractDetail: ContractDetail;
  deliveryAddresses: PostAddress[];
  activityLog: ActivityEntry[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ADDRESS_TYPE_OPTIONS: string[] = ["office", "home", "warehouse", "P/O", "Attn"];
const INDUSTRY_CATEGORIES = [
  "Agriculture", "Manufacturing", "Retail", "Wholesale", "Logistics",
  "Technology", "Food & Beverage", "Textile", "Chemical",
  "Healthcare", "Education", "Finance", "Hospitality", "Other",
];
const CUSTOMER_TYPES = [
  "Limited", "Inc.", "JSC", "LLC", "PLC", "Co., Ltd.", "GmbH",
  "Sole Proprietorship", "Partnership", "Government", "NGO", "Other",
];

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

const defaultForm = (): CustomerForm => ({
  customerName: "",
  industryCategory: "",
  customerType: "",
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
  deliveryAddresses: [],
  activityLog: [],
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

// ─── AddCustomerModal ─────────────────────────────────────────────────────────

interface AddCustomerModalProps {
  onClose: () => void;
  onSave: (customer: CustomerForm) => void;
  existingNames: string[];
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ onClose, onSave, existingNames }) => {
  const { currentUser } = useAuth();
  const [form, setForm] = useState<CustomerForm>(defaultForm());
  const [errors, setErrors] = useState<{ customerName?: string }>({});

  const set = (field: keyof CustomerForm, value: unknown) =>
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

  // Delivery Addresses
  const updateDeliveryAddress = (id: string, updated: PostAddress) =>
    set("deliveryAddresses", form.deliveryAddresses.map((a) => (a.id === id ? updated : a)));
  const addDeliveryAddress = () => {
    if (form.deliveryAddresses.length >= 20) return;
    set("deliveryAddresses", [...form.deliveryAddresses, emptyAddress()]);
  };
  const removeDeliveryAddress = (id: string) =>
    set("deliveryAddresses", form.deliveryAddresses.filter((a) => a.id !== id));

  const handleSubmit = () => {
    const newErrors: typeof errors = {};
    if (!form.customerName.trim()) {
      newErrors.customerName = "Customer name is required.";
    } else if (existingNames.map((n) => n.toLowerCase()).includes(form.customerName.trim().toLowerCase())) {
      newErrors.customerName = "A customer with this name already exists.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const userName = currentUser
      ? `${currentUser.firstName}${currentUser.lastName ? " " + currentUser.lastName : ""}`.trim() || currentUser.email
      : "Unknown";
    const entry: ActivityEntry = { id: uid(), userName, date: new Date().toISOString(), activity: "CREATE" };
    onSave({ ...form, activityLog: [...form.activityLog, entry] });
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
          <h2 className="text-lg font-bold text-gray-900">Add a Customer</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-7 overflow-y-auto max-h-[75vh]">

          {/* 1. Customer Name */}
          <Section title="1. Customer Name">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.customerName ? "border-red-400" : "border-gray-300"}`}
                value={form.customerName}
                onChange={(e) => {
                  set("customerName", e.target.value);
                  if (errors.customerName) setErrors({});
                }}
                placeholder="Enter customer name"
              />
              {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
            </div>
          </Section>

          {/* 2. Industry Category */}
          <Section title="2. Industry Category">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Industry Category</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.industryCategory}
                onChange={(e) => set("industryCategory", e.target.value)}
              >
                <option value="">— Select —</option>
                {INDUSTRY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </Section>

          {/* 3. Customer Type */}
          <Section title="3. Customer Type">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Customer Type</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.customerType}
                onChange={(e) => set("customerType", e.target.value)}
              >
                <option value="">— Select —</option>
                {CUSTOMER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
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

          {/* 5. Telephone Details */}
          <Section title="5. Telephone Details">
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

          {/* 5.1 Email Addresses */}
          <Section title="5.1 Email Addresses">
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

          {/* 5.2 Contact Details */}
          <Section title="5.2 Contact Details">
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

          {/* 6. Contract Details */}
          <Section title="6. Contract Details">
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

          {/* 7. Delivery Addresses */}
          <Section title={`7. Delivery Addresses (${form.deliveryAddresses.length}/20)`}>
            <div className="space-y-4">
              {form.deliveryAddresses.length === 0 && (
                <p className="text-xs text-gray-400 italic">No delivery addresses added yet.</p>
              )}
              {form.deliveryAddresses.map((addr, i) => (
                <PostAddressForm
                  key={addr.id}
                  address={addr}
                  index={i}
                  title={`Delivery Address ${i + 1}`}
                  onChange={(updated) => updateDeliveryAddress(addr.id, updated)}
                  onRemove={() => removeDeliveryAddress(addr.id)}
                  showRemove
                />
              ))}
              {form.deliveryAddresses.length < 20 ? (
                <button type="button" onClick={addDeliveryAddress} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 transition">
                  <Plus size={14} /> Add delivery address
                </button>
              ) : (
                <p className="text-xs text-orange-500">Maximum of 20 delivery addresses reached.</p>
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
            Save Customer
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── EditCustomerModal ────────────────────────────────────────────────────────

interface EditCustomerModalProps {
  customer: CustomerForm;
  viewOnly: boolean;
  onClose: () => void;
  onSave: (updated: CustomerForm) => void;
  onDelete: () => void;
  existingNames: string[];
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  customer,
  viewOnly,
  onClose,
  onSave,
  onDelete,
  existingNames,
}) => {
  const { currentUser } = useAuth();
  const [form, setForm] = useState<CustomerForm>(JSON.parse(JSON.stringify(customer)));
  const [errors, setErrors] = useState<{ customerName?: string }>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (field: keyof CustomerForm, value: unknown) =>
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

  // Delivery Addresses
  const updateDeliveryAddress = (id: string, updated: PostAddress) =>
    set("deliveryAddresses", form.deliveryAddresses.map((a) => (a.id === id ? updated : a)));
  const addDeliveryAddress = () => {
    if (form.deliveryAddresses.length >= 20) return;
    set("deliveryAddresses", [...form.deliveryAddresses, emptyAddress()]);
  };
  const removeDeliveryAddress = (id: string) =>
    set("deliveryAddresses", form.deliveryAddresses.filter((a) => a.id !== id));

  const handleSubmit = () => {
    const newErrors: typeof errors = {};
    if (!form.customerName.trim()) {
      newErrors.customerName = "Customer name is required.";
    } else if (
      form.customerName.trim().toLowerCase() !== customer.customerName.toLowerCase() &&
      existingNames.map((n) => n.toLowerCase()).includes(form.customerName.trim().toLowerCase())
    ) {
      newErrors.customerName = "A customer with this name already exists.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const userName = currentUser
      ? `${currentUser.firstName}${currentUser.lastName ? " " + currentUser.lastName : ""}`.trim() || currentUser.email
      : "Unknown";
    const entry: ActivityEntry = { id: uid(), userName, date: new Date().toISOString(), activity: "MODIFIED" };
    onSave({ ...form, activityLog: [...(form.activityLog ?? []), entry] });
    onClose();
  };

  const addressTypeOptions = [
    ...ADDRESS_TYPE_OPTIONS,
    ...form.postAddresses
      .filter((a) => a.type === "__custom__" && a.customType.trim())
      .map((a) => a.customType),
  ];

  const inputClass = (err?: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      viewOnly ? "bg-gray-50 text-gray-700 cursor-default" : err ? "border-red-400" : "border-gray-300"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {viewOnly ? <Eye size={18} className="text-gray-500" /> : <Pencil size={18} className="text-blue-600" />}
            <h2 className="text-lg font-bold text-gray-900">
              {viewOnly ? "View Customer" : "Edit Customer"}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        {viewOnly && (
          <div className="mx-6 mt-4 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-2.5 rounded-lg">
            <span>🔒</span>
            <span>You have read-only access. Contact your administrator to make changes.</span>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 space-y-7 overflow-y-auto max-h-[70vh]">

          {/* 1. Customer Name */}
          <Section title="1. Customer Name">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Customer Name {!viewOnly && <span className="text-red-500">*</span>}
              </label>
              <input
                className={inputClass(errors.customerName)}
                value={form.customerName}
                readOnly={viewOnly}
                onChange={(e) => { set("customerName", e.target.value); if (errors.customerName) setErrors({}); }}
              />
              {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>}
            </div>
          </Section>

          {/* 2. Industry Category */}
          <Section title="2. Industry Category">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Industry Category</label>
              {viewOnly ? (
                <input className={inputClass()} value={form.industryCategory || "—"} readOnly />
              ) : (
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.industryCategory}
                  onChange={(e) => set("industryCategory", e.target.value)}
                >
                  <option value="">— Select —</option>
                  {INDUSTRY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
          </Section>

          {/* 3. Customer Type */}
          <Section title="3. Customer Type">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Customer Type</label>
              {viewOnly ? (
                <input className={inputClass()} value={form.customerType || "—"} readOnly />
              ) : (
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.customerType}
                  onChange={(e) => set("customerType", e.target.value)}
                >
                  <option value="">— Select —</option>
                  {CUSTOMER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
            </div>
          </Section>

          {/* 4. Post Addresses */}
          <Section title="4. Post Addresses">
            <div className="space-y-4">
              {form.postAddresses.map((addr, i) => (
                viewOnly ? (
                  <div key={addr.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-2">
                    <span className="text-sm font-semibold text-gray-700">Address {i + 1}</span>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                      {addr.addressName && <div><span className="text-gray-500 text-xs">Name:</span> {addr.addressName}</div>}
                      {addr.type && <div><span className="text-gray-500 text-xs">Type:</span> {addr.type === "__custom__" ? addr.customType : addr.type}</div>}
                      {addr.houseNumber && <div><span className="text-gray-500 text-xs">House N°:</span> {addr.houseNumber}</div>}
                      {addr.streetName && <div><span className="text-gray-500 text-xs">Street:</span> {addr.streetName}</div>}
                      {addr.city && <div><span className="text-gray-500 text-xs">City:</span> {addr.city}</div>}
                      {addr.country && <div><span className="text-gray-500 text-xs">Country:</span> {addr.country}</div>}
                    </div>
                  </div>
                ) : (
                  <PostAddressForm
                    key={addr.id}
                    address={addr}
                    index={i}
                    onChange={(updated) => updateAddress(addr.id, updated)}
                    onRemove={() => removeAddress(addr.id)}
                    showRemove={form.postAddresses.length > 1}
                  />
                )
              ))}
              {!viewOnly && (
                <button type="button" onClick={addAddress} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 transition">
                  <Plus size={14} /> Add another address
                </button>
              )}
            </div>
          </Section>

          {/* 5. Telephone Details */}
          <Section title="5. Telephone Details">
            <div className="space-y-3">
              {form.telephones.map((tel) => (
                <div key={tel.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone N°</label>
                    <input
                      className={inputClass()}
                      value={tel.number}
                      readOnly={viewOnly}
                      onChange={(e) => updateTel(tel.id, "number", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Address Type</label>
                    {viewOnly ? (
                      <input className={inputClass()} value={tel.addressTypeRef} readOnly />
                    ) : (
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={tel.addressTypeRef} onChange={(e) => updateTel(tel.id, "addressTypeRef", e.target.value)}>
                        {addressTypeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )}
                  </div>
                  {!viewOnly && form.telephones.length > 1 && (
                    <div className="flex items-end justify-end">
                      <button type="button" onClick={() => removeTel(tel.id)} className="text-red-400 hover:text-red-600 pb-2"><Trash2 size={15} /></button>
                    </div>
                  )}
                </div>
              ))}
              {!viewOnly && (
                <button type="button" onClick={addTel} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 transition">
                  <Plus size={14} /> Add telephone
                </button>
              )}
            </div>
          </Section>

          {/* 5.1 Email Addresses */}
          <Section title="5.1 Email Addresses">
            <div className="space-y-3">
              {form.emails.map((em) => (
                <div key={em.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                    <input
                      className={inputClass()}
                      value={em.email}
                      readOnly={viewOnly}
                      onChange={(e) => updateEmail(em.id, "email", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Address Type</label>
                    {viewOnly ? (
                      <input className={inputClass()} value={em.addressTypeRef} readOnly />
                    ) : (
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={em.addressTypeRef} onChange={(e) => updateEmail(em.id, "addressTypeRef", e.target.value)}>
                        {addressTypeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )}
                  </div>
                  {!viewOnly && form.emails.length > 1 && (
                    <div className="flex items-end justify-end">
                      <button type="button" onClick={() => removeEmail(em.id)} className="text-red-400 hover:text-red-600 pb-2"><Trash2 size={15} /></button>
                    </div>
                  )}
                </div>
              ))}
              {!viewOnly && (
                <button type="button" onClick={addEmail} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 transition">
                  <Plus size={14} /> Add email
                </button>
              )}
            </div>
          </Section>

          {/* 5.2 Contact Details */}
          <Section title="5.2 Contact Details">
            <div className="space-y-3">
              {form.contacts.map((c) => (
                <div key={c.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(["name", "firstName", "lastName"] as const).map((field) => (
                      <div key={field}>
                        <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{field === "firstName" ? "First Name" : field === "lastName" ? "Last Name" : "Name"}</label>
                        <input className={inputClass()} value={c[field]} readOnly={viewOnly} onChange={(e) => updateContact(c.id, field, e.target.value)} />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Address Type</label>
                      {viewOnly ? (
                        <input className={inputClass()} value={c.addressTypeRef} readOnly />
                      ) : (
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={c.addressTypeRef} onChange={(e) => updateContact(c.id, "addressTypeRef", e.target.value)}>
                          {addressTypeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      )}
                    </div>
                  </div>
                  {!viewOnly && form.contacts.length > 1 && (
                    <div className="flex justify-end">
                      <button type="button" onClick={() => removeContact(c.id)} className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1">
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {!viewOnly && (
                <button type="button" onClick={addContact} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 transition">
                  <Plus size={14} /> Add contact
                </button>
              )}
            </div>
          </Section>

          {/* 6. Contract Details */}
          <Section title="6. Contract Details">
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
                    className={inputClass()}
                    value={form.contractDetail[field]}
                    readOnly={viewOnly}
                    onChange={(e) => updateContract(field, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* 7. Delivery Addresses */}
          <Section title={`7. Delivery Addresses (${form.deliveryAddresses.length}/20)`}>
            <div className="space-y-4">
              {form.deliveryAddresses.length === 0 && (
                <p className="text-xs text-gray-400 italic">No delivery addresses added yet.</p>
              )}
              {form.deliveryAddresses.map((addr, i) => (
                viewOnly ? (
                  <div key={addr.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-2">
                    <span className="text-sm font-semibold text-gray-700">Delivery Address {i + 1}</span>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                      {addr.city && <div><span className="text-gray-500 text-xs">City:</span> {addr.city}</div>}
                      {addr.country && <div><span className="text-gray-500 text-xs">Country:</span> {addr.country}</div>}
                    </div>
                  </div>
                ) : (
                  <PostAddressForm
                    key={addr.id}
                    address={addr}
                    index={i}
                    title={`Delivery Address ${i + 1}`}
                    onChange={(updated) => updateDeliveryAddress(addr.id, updated)}
                    onRemove={() => removeDeliveryAddress(addr.id)}
                    showRemove
                  />
                )
              ))}
              {!viewOnly && form.deliveryAddresses.length < 20 && (
                <button type="button" onClick={addDeliveryAddress} className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800 transition">
                  <Plus size={14} /> Add delivery address
                </button>
              )}
            </div>
          </Section>

        </div>

        {/* Activity History */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Activity History</h3>
            {(currentUser?.role === "Admin" || currentUser?.role === "SuperAdmin") && (
              <button
                type="button"
                onClick={() => {
                  const userName = currentUser
                    ? `${currentUser.firstName}${currentUser.lastName ? " " + currentUser.lastName : ""}`.trim() || currentUser.email
                    : "Unknown";
                  const cleanEntry: ActivityEntry = {
                    id: uid(),
                    userName,
                    date: new Date().toISOString(),
                    activity: "History Deleted",
                  };
                  onSave({ ...form, activityLog: [cleanEntry] });
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
                {(customer.activityLog ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-3 text-gray-400 text-center italic">No activity recorded yet.</td>
                  </tr>
                ) : (
                  [...(customer.activityLog ?? [])].reverse().map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-3 py-2 text-gray-700">{entry.userName}</td>
                      <td className="px-3 py-2 text-gray-500">{formatActivityDate(entry.date)}</td>
                      <td className="px-3 py-2">
                        {entry.activity === "CREATE" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">CREATE</span>
                        ) : entry.activity === "History Deleted" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">History Deleted</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">MODIFIED</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200">
          {/* Delete side */}
          <div>
            {!viewOnly && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600">Delete this customer?</span>
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
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              {viewOnly ? "Close" : "Cancel"}
            </button>
            {!viewOnly && (
              <button type="button" onClick={handleSubmit} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const CUSTOMERS_STORAGE_KEY = "tc_settings_customers";

interface SettingsCustomersProps {
  readOnly?: boolean;
}

const SettingsCustomers: React.FC<SettingsCustomersProps> = ({ readOnly = false }) => {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [customers, setCustomers] = useState<CustomerForm[]>(() => {
    try {
      const stored = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed as CustomerForm[];
      }
    } catch {}
    return [];
  });

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
  }, [customers]);

  const existingNames = customers.map((c) => c.customerName);

  // Determine if the current user can edit/delete
  const canEdit =
    !readOnly &&
    (currentUser?.role === "SuperAdmin" ||
      currentUser?.role === "Admin" ||
      currentUser?.role === "TraceChainAdminPortalAdmin" ||
      currentUser?.role === "TraceChainClientPortalAdmin");

  const handleRowClick = (index: number) => {
    setEditIndex(index);
  };

  const handleSaveEdit = (updated: CustomerForm) => {
    setCustomers((prev) => {
      const next = prev.map((c, i) => (i === editIndex ? updated : c));
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setEditIndex(null);
  };

  const handleDelete = () => {
    setCustomers((prev) => {
      const next = prev.filter((_, i) => i !== editIndex);
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setEditIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Read-only banner */}
      {readOnly && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-2.5 rounded-lg">
          <span>🔒</span>
          <span>You have read-only access. Contact your administrator to make changes.</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center justify-between">
        <p className="text-sm text-gray-500">Manage customer profiles, details and configurations.</p>
        {canEdit && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={15} /> Add Customer
          </button>
        )}
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-4xl mb-3">🤝</div>
          <p className="text-gray-500 text-sm">No customers added yet.</p>
          {canEdit && (
            <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
              + Add Customer
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">First Delivery Address</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-24">Delivery Addresses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c, i) => {
                const firstDA = c.deliveryAddresses[0];
                const addressParts = firstDA
                  ? [
                      firstDA.addressName,
                      firstDA.houseNumber,
                      firstDA.streetName,
                      firstDA.district,
                      firstDA.city,
                    ].filter(Boolean).join(", ")
                  : "—";
                return (
                <tr
                  key={i}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(i)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{c.customerName}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    {firstDA ? (
                      <span className="block truncate" title={addressParts}>{addressParts}</span>
                    ) : (
                      <span className="text-gray-400 italic text-xs">No delivery address</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-center">{c.deliveryAddresses.length}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add modal */}
      {canEdit && showModal && (
        <AddCustomerModal
          onClose={() => setShowModal(false)}
          onSave={(customer) => {
            const next = [...customers, customer];
            setCustomers(next);
            localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(next));
          }}
          existingNames={existingNames}
        />
      )}

      {/* Edit / View modal */}
      {editIndex !== null && (
        <EditCustomerModal
          customer={customers[editIndex]}
          viewOnly={!canEdit}
          onClose={() => setEditIndex(null)}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
          existingNames={existingNames}
        />
      )}
    </div>
  );
};

export default SettingsCustomers;
