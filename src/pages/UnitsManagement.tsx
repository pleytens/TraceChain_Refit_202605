import React, { useState } from "react";

interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  type: string;
  status: "Active" | "Inactive";
}

const initialUnits: Unit[] = [
  { id: "u1", name: "Kilogram", abbreviation: "kg", type: "Weight", status: "Active" },
  { id: "u2", name: "Gram", abbreviation: "g", type: "Weight", status: "Active" },
  { id: "u3", name: "Litre", abbreviation: "L", type: "Volume", status: "Active" },
  { id: "u4", name: "Millilitre", abbreviation: "mL", type: "Volume", status: "Active" },
  { id: "u5", name: "Piece", abbreviation: "pcs", type: "Quantity", status: "Active" },
  { id: "u6", name: "Box", abbreviation: "box", type: "Quantity", status: "Inactive" },
];

const UnitsManagement: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [form, setForm] = useState({ name: "", abbreviation: "", type: "", status: "Active" as "Active" | "Inactive" });

  const filtered = units.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.abbreviation.toLowerCase().includes(search.toLowerCase()) ||
      u.type.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingUnit(null);
    setForm({ name: "", abbreviation: "", type: "", status: "Active" });
    setShowModal(true);
  };

  const openEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setForm({ name: unit.name, abbreviation: unit.abbreviation, type: unit.type, status: unit.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.abbreviation.trim()) return;
    if (editingUnit) {
      setUnits((prev) => prev.map((u) => (u.id === editingUnit.id ? { ...u, ...form } : u)));
    } else {
      setUnits((prev) => [
        { id: `u${Date.now()}`, ...form },
        ...prev,
      ]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this unit?")) {
      setUnits((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Units Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage measurement units used across the platform</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <span className="text-base">+</span>
          Add Unit
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search by name, abbreviation or type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-5 py-3 font-semibold text-gray-600">#</th>
                <th className="px-5 py-3 font-semibold text-gray-600">Name</th>
                <th className="px-5 py-3 font-semibold text-gray-600">Abbreviation</th>
                <th className="px-5 py-3 font-semibold text-gray-600">Type</th>
                <th className="px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-5 py-3 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                    No units found.
                  </td>
                </tr>
              ) : (
                filtered.map((unit, idx) => (
                  <tr key={unit.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 text-gray-400">{idx + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{unit.name}</td>
                    <td className="px-5 py-3 text-gray-600">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{unit.abbreviation}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{unit.type}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          unit.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(unit)}
                          className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(unit.id)}
                          className="text-xs px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">
                {editingUnit ? "Edit Unit" : "Add Unit"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Kilogram"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Abbreviation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.abbreviation}
                  onChange={(e) => setForm((f) => ({ ...f, abbreviation: e.target.value }))}
                  placeholder="e.g. kg"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input
                  type="text"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  placeholder="e.g. Weight, Volume, Quantity"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "Active" | "Inactive" }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name.trim() || !form.abbreviation.trim()}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition"
              >
                {editingUnit ? "Save Changes" : "Add Unit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitsManagement;
