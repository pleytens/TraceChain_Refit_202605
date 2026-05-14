import React, { useState } from "react";

interface Partner {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

const samplePartners: Partner[] = [
  { id: 1, name: "AgriLink Cambodia", contactPerson: "Sovann Pich", email: "sovann@agrilink.kh", phone: "+855 12 345 678", address: "Phnom Penh, Cambodia", createdAt: "2024-01-15" },
  { id: 2, name: "Mekong Export Co.", contactPerson: "Dara Chea", email: "dara@mekongexport.com", phone: "+855 17 654 321", address: "Kampot Province, Cambodia", createdAt: "2024-02-20" },
  { id: 3, name: "UNIDO Cambodia", contactPerson: "Marie Dupont", email: "marie@unido.org", phone: "+855 23 987 654", address: "Phnom Penh, Cambodia", createdAt: "2024-03-05" },
  { id: 4, name: "GS1 Cambodia", contactPerson: "Keang Rithea", email: "rithea@gs1.org.kh", phone: "+855 11 223 344", address: "Phnom Penh, Cambodia", createdAt: "2024-03-22" },
];

interface PartnerModalProps {
  partner?: Partner | null;
  onClose: () => void;
  onSave: (p: Partial<Partner>) => void;
}

const PartnerModal: React.FC<PartnerModalProps> = ({ partner, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: partner?.name ?? "",
    contactPerson: partner?.contactPerson ?? "",
    email: partner?.email ?? "",
    phone: partner?.phone ?? "",
    address: partner?.address ?? "",
  });

  const fields = [
    { label: "Partner / Organization Name", key: "name", required: true },
    { label: "Contact Person", key: "contactPerson", required: true },
    { label: "Email Address", key: "email", required: true },
    { label: "Phone Number", key: "phone", required: false },
    { label: "Address", key: "address", required: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">
            {partner ? "Edit Partner" : "New Partner"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {fields.map((f) => (
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

const Partners: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>(samplePartners);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editPartner, setEditPartner] = useState<Partner | null>(null);

  const filtered = partners.filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data: Partial<Partner>) => {
    if (editPartner) {
      setPartners(partners.map((p) => (p.id === editPartner.id ? { ...p, ...data } : p)));
    } else {
      setPartners([...partners, { id: Date.now(), createdAt: new Date().toISOString().slice(0, 10), ...data } as Partner]);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this partner?")) setPartners(partners.filter((p) => p.id !== id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">Partners</h2>
        <button
          onClick={() => { setEditPartner(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New Partner
        </button>
      </div>

      <div className="px-6 py-3 border-b border-gray-50">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search partners..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-5 py-3 text-left">Actions</th>
              <th className="px-5 py-3 text-left">Organization</th>
              <th className="px-5 py-3 text-left">Contact Person</th>
              <th className="px-5 py-3 text-left">Email</th>
              <th className="px-5 py-3 text-left">Phone</th>
              <th className="px-5 py-3 text-left">Address</th>
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
                        onClick={() => { setEditPartner(row); setShowModal(true); }}
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
                <td className="px-5 py-3 font-medium text-gray-800">{row.name}</td>
                <td className="px-5 py-3 text-gray-600">{row.contactPerson}</td>
                <td className="px-5 py-3 text-gray-500">{row.email}</td>
                <td className="px-5 py-3 text-gray-500">{row.phone}</td>
                <td className="px-5 py-3 text-gray-500">{row.address}</td>
                <td className="px-5 py-3 text-gray-500">{row.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
        <span>Showing {filtered.length} of {partners.length} partners</span>
        <div className="flex gap-1">
          <button className="px-2 py-1 border border-gray-200 rounded">‹</button>
          <button className="px-2 py-1 border border-green-500 bg-green-500 text-white rounded">1</button>
          <button className="px-2 py-1 border border-gray-200 rounded">›</button>
        </div>
      </div>

      {showModal && (
        <PartnerModal
          partner={editPartner}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Partners;
