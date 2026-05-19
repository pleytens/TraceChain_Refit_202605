import React, { useState } from "react";
import { useSuppliers, Supplier } from "@/context/SuppliersContext";

interface ModalProps {
  supplier?: Supplier | null;
  onClose: () => void;
  onSave: (s: Partial<Supplier>) => void;
}

const SupplierModal: React.FC<ModalProps> = ({ supplier, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<"info" | "account">("info");
  const [form, setForm] = useState({
    gs1Code: supplier?.gs1Code ?? "",
    name: supplier?.name ?? "",
    address: supplier?.address ?? "",
    email: supplier?.email ?? "",
    phoneNumber: "",
    website: "",
    tenantName: "",
    adminEmail: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">
            {supplier ? "Edit Supplier" : "New Supplier"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {(["info", "account"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-t-lg border ${
                activeTab === tab
                  ? "border-b-white bg-white text-green-600 font-semibold border-gray-200"
                  : "text-gray-500 border-transparent"
              }`}
            >
              {tab === "info" ? "Supplier Information" : "Account"}
            </button>
          ))}
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">
          {activeTab === "info" && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Supplier Logo</label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-green-400 transition-colors">
                  <p className="text-gray-400 text-sm">🏭 Choose logo</p>
                </div>
              </div>
              {[
                { label: "GS1 Code", key: "gs1Code", required: true },
                { label: "Supplier Name", key: "name", required: true },
                { label: "Email Address", key: "email", required: true },
                { label: "Phone Number", key: "phoneNumber", required: true },
                { label: "Address", key: "address", required: false },
                { label: "Website URL", key: "website", required: false },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm text-gray-600 mb-1">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {["Country", "Province", "District", "Ward"].map((loc) => (
                  <div key={loc}>
                    <label className="block text-sm text-gray-600 mb-1">{loc} <span className="text-red-500">*</span></label>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-500">
                      <option value="">-- Select {loc} --</option>
                      <option>Cambodia</option>
                      <option>Phnom Penh</option>
                    </select>
                  </div>
                ))}
              </div>
            </>
          )}
          {activeTab === "account" && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tenant Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.tenantName}
                  onChange={(e) => setForm({ ...form, tenantName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              {!supplier && (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Admin Email <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.adminEmail}
                      onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Password <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Enter password..."
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="border border-gray-200 rounded-lg px-3 text-gray-500 hover:bg-gray-50"
                      >
                        {showPassword ? "🙈" : "👁"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            Close
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            ✓ Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Suppliers: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);

  const filtered = suppliers.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.gs1Code.includes(search)
  );

  const handleSave = async (data: Partial<Supplier>) => {
    try {
      if (editSupplier) {
        await updateSupplier(editSupplier.id, data);
      } else {
        await addSupplier({
          gs1Code: (data as any).gs1Code ?? "",
          name: (data as any).name ?? "",
          address: (data as any).address ?? "",
          email: (data as any).email ?? "",
        });
      }
    } catch (err: any) {
      alert("❌ Failed to save supplier: " + (err?.message ?? "Unknown error") + "\n\nCheck the browser console (F12) for more details.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this supplier?")) await deleteSupplier(id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">Suppliers</h2>
        <button
          onClick={() => { setEditSupplier(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New Supplier
        </button>
      </div>

      <div className="px-6 py-3 border-b border-gray-50">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-5 py-3 text-left">Actions</th>
              <th className="px-5 py-3 text-left">GS1 Code</th>
              <th className="px-5 py-3 text-left">Supplier Name</th>
              <th className="px-5 py-3 text-left">Address</th>
              <th className="px-5 py-3 text-left">Admin Email</th>
              <th className="px-5 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="relative group">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1">
                      ⚙ Actions ▾
                    </button>
                    <div className="absolute left-0 top-7 hidden group-hover:block z-10 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[120px]">
                      <button
                        onClick={() => { setEditSupplier(row); setShowModal(true); }}
                        className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        ✏ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-gray-600">{row.gs1Code}</td>
                <td className="px-5 py-3 font-medium text-gray-800">{row.name}</td>
                <td className="px-5 py-3 text-gray-500">{row.address}</td>
                <td className="px-5 py-3 text-gray-500">{row.email}</td>
                <td className="px-5 py-3 text-gray-500">{row.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
        <span>Showing {filtered.length} of {suppliers.length} suppliers</span>
        <div className="flex gap-1">
          <button className="px-2 py-1 border border-gray-200 rounded">‹</button>
          <button className="px-2 py-1 border border-green-500 bg-green-500 text-white rounded">1</button>
          <button className="px-2 py-1 border border-gray-200 rounded">›</button>
        </div>
      </div>

      {showModal && (
        <SupplierModal
          supplier={editSupplier}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Suppliers;
