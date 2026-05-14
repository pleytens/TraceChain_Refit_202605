import React, { useState } from "react";

interface Customer {
  id: string;
  tcId: string;
  name: string;
  coreActive: boolean;
  addOns: { name: string; active: boolean }[];
  status: "Active" | "Inactive";
  yearlyRevenue: number;
  country: string;
}

const initialCustomers: Customer[] = [
  {
    id: "c1",
    tcId: "100001",
    name: "Acme Food Co.",
    coreActive: true,
    addOns: [
      { name: "Traceability Reports", active: true },
      { name: "Event Module", active: false },
      { name: "Analytics Pro", active: true },
    ],
    status: "Active",
    yearlyRevenue: 24500,
    country: "Cambodia",
  },
  {
    id: "c2",
    tcId: "100002",
    name: "Green Valley Farms",
    coreActive: true,
    addOns: [
      { name: "Traceability Reports", active: true },
      { name: "Event Module", active: true },
      { name: "Analytics Pro", active: false },
    ],
    status: "Active",
    yearlyRevenue: 18200,
    country: "Vietnam",
  },
  {
    id: "c3",
    tcId: "100003",
    name: "Pacific Seafood Ltd.",
    coreActive: true,
    addOns: [
      { name: "Traceability Reports", active: false },
      { name: "Event Module", active: false },
      { name: "Analytics Pro", active: false },
    ],
    status: "Inactive",
    yearlyRevenue: 0,
    country: "Thailand",
  },
];

type ModalMode = "create" | "edit" | null;

export default function TVAdminDashboard() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState<Partial<Customer> & { tcIdInput?: string }>({});
  const [formError, setFormError] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tcId.includes(search)
  );

  const openCreate = () => {
    setForm({ name: "", tcIdInput: "", status: "Active", yearlyRevenue: 0, country: "", coreActive: true, addOns: [{ name: "Traceability Reports", active: false }, { name: "Event Module", active: false }, { name: "Analytics Pro", active: false }] });
    setFormError("");
    setEditTarget(null);
    setModalMode("create");
  };

  const openEdit = (c: Customer) => {
    setForm({ ...c, tcIdInput: c.tcId });
    setFormError("");
    setEditTarget(c);
    setModalMode("edit");
  };

  const validateForm = (): string | null => {
    if (!form.name?.trim()) return "Customer name is required.";
    if (!form.tcIdInput?.trim()) return "TC ID is required.";
    if (!/^\d{6}$/.test(form.tcIdInput.trim())) return "TC ID must be exactly 6 digits.";
    const exists = customers.find((c) => c.tcId === form.tcIdInput && c.id !== editTarget?.id);
    if (exists) return "TC ID must be unique.";
    return null;
  };

  const handleSave = () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    if (modalMode === "create") {
      const newCust: Customer = {
        id: `c-${Date.now()}`,
        tcId: form.tcIdInput!.trim(),
        name: form.name!.trim(),
        coreActive: form.coreActive ?? true,
        addOns: form.addOns ?? [],
        status: form.status ?? "Active",
        yearlyRevenue: form.yearlyRevenue ?? 0,
        country: form.country?.trim() ?? "",
      };
      setCustomers((prev) => [newCust, ...prev]);
    } else if (modalMode === "edit" && editTarget) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editTarget.id
            ? { ...c, tcId: form.tcIdInput!.trim(), name: form.name!.trim(), coreActive: form.coreActive ?? c.coreActive, addOns: form.addOns ?? c.addOns, status: form.status ?? c.status, yearlyRevenue: form.yearlyRevenue ?? c.yearlyRevenue, country: form.country?.trim() ?? c.country }
            : c
        )
      );
    }
    setModalMode(null);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const totalRevenue = customers.reduce((s, c) => s + c.yearlyRevenue, 0);
  const activeCount = customers.filter((c) => c.status === "Active").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Customers", value: customers.length, icon: "🏢", color: "bg-blue-50 border-blue-200 text-blue-700" },
          { label: "Active Customers", value: activeCount, icon: "✅", color: "bg-green-50 border-green-200 text-green-700" },
          { label: "Yearly Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: "💰", color: "bg-purple-50 border-purple-200 text-purple-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-5 py-4 flex items-center gap-4 ${s.color}`}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div className="text-xs font-medium opacity-70">{s.label}</div>
              <div className="text-2xl font-bold">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-base">Customer Management</h2>
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or TC ID..."
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 w-56"
            />
            <button
              onClick={openCreate}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-sm"
            >
              <span>+</span> New Customer
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3">TC ID</th>
                <th className="px-6 py-3">Customer Name</th>
                <th className="px-6 py-3">TC Core</th>
                <th className="px-6 py-3">Add-ons</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Yearly Revenue</th>
                <th className="px-6 py-3">Country</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-400 py-10">No customers found.</td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">{c.tcId}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{c.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${c.coreActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.coreActive ? "✓ Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {c.addOns.map((a) => (
                        <span
                          key={a.name}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.active ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400 line-through"}`}
                        >
                          {a.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${c.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-medium">${c.yearlyRevenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-500">{c.country || "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline">Edit</button>
                      <span className="text-gray-300">|</span>
                      <button onClick={() => setDeleteTarget(c)} className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">{modalMode === "create" ? "Add New Customer" : "Edit Customer"}</h3>
              <button onClick={() => setModalMode(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-red-700 text-sm">{formError}</div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Customer Name <span className="text-red-500">*</span></label>
                  <input value={form.name ?? ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Acme Corp" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">TC ID <span className="text-red-500">*</span></label>
                  <input value={form.tcIdInput ?? ""} onChange={(e) => setForm((p) => ({ ...p, tcIdInput: e.target.value }))} placeholder="6 digits" maxLength={6} className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <p className="text-xs text-gray-400">Unique 6-digit number</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Country</label>
                  <input value={form.country ?? ""} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} placeholder="e.g. Cambodia" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Yearly Revenue ($)</label>
                  <input type="number" value={form.yearlyRevenue ?? 0} onChange={(e) => setForm((p) => ({ ...p, yearlyRevenue: Number(e.target.value) }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select value={form.status ?? "Active"} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as "Active" | "Inactive" }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              {/* Core */}
              <div className="flex items-center gap-3 pt-1">
                <input type="checkbox" id="core" checked={form.coreActive ?? true} onChange={(e) => setForm((p) => ({ ...p, coreActive: e.target.checked }))} className="w-4 h-4 accent-green-600" />
                <label htmlFor="core" className="text-sm font-medium text-gray-700">TraceChain Core Active</label>
              </div>

              {/* Add-ons */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Add-ons</label>
                {(form.addOns ?? []).map((addon, i) => (
                  <div key={addon.name} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addon.active}
                      onChange={(e) => {
                        const updated = [...(form.addOns ?? [])];
                        updated[i] = { ...updated[i], active: e.target.checked };
                        setForm((p) => ({ ...p, addOns: updated }));
                      }}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">{addon.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModalMode(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
              <button onClick={handleSave} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition shadow-sm">
                {modalMode === "create" ? "Add Customer" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="font-bold text-gray-900 text-base mb-2">Delete Customer</h3>
            <p className="text-sm text-gray-600 mb-5">Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteTarget(null)} className="px-5 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={handleDelete} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
