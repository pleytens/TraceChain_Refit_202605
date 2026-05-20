import React, { useState, useEffect } from "react";
import { Search, Eye, Edit2, Trash2, Plus, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Asset {
  id: string;
  material_product: string;
  batch_number: string;
  expiry_date: string;
  has_qr_code: boolean;
  packing: string;
  quantity: number;
  supplier_name: string;
  location: string;
}

interface AssetsDashboardProps {
  readOnly?: boolean;
}

const formatDate = (val: string | null) => {
  if (!val || val === "—") return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return val;
  }
};

const AssetsDashboard: React.FC<AssetsDashboardProps> = ({ readOnly = false }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tc_materials")
        .select(
          `
          id,
          name,
          batch_number,
          expiry_date,
          has_qr_code,
          packing,
          quantity,
          supplier_id,
          storage_room_id
        `
        )
        .order("name", { ascending: true });

      if (error) throw error;

      // ✅ Only show materials that have a storage location assigned
      const dataWithLocation = (data || []).filter((item: any) => !!item.storage_room_id);

      // Fetch suppliers and rooms based on filtered data only
      const supplierIds = [...new Set(dataWithLocation.map((d: any) => d.supplier_id).filter(Boolean))];
      const roomIds = [...new Set(dataWithLocation.map((d: any) => d.storage_room_id).filter(Boolean))];

      let suppliersMap: Record<string, string> = {};
      let roomsMap: Record<string, { room: string; building: string }> = {};

      if (supplierIds.length > 0) {
        const { data: suppliers } = await supabase
          .from("tc_suppliers")
          .select("id, name")
          .in("id", supplierIds);
        (suppliers || []).forEach((s: any) => {
          suppliersMap[s.id] = s.name;
        });
      }

      if (roomIds.length > 0) {
        const { data: rooms } = await supabase
          .from("tc_storage_rooms")
          .select("id, name, building_id")
          .in("id", roomIds);

        const buildingIds = [...new Set((rooms || []).map((r: any) => r.building_id).filter(Boolean))];
        let buildingsMap: Record<string, string> = {};

        if (buildingIds.length > 0) {
          const { data: buildings } = await supabase
            .from("tc_buildings")
            .select("id, name")
            .in("id", buildingIds);
          (buildings || []).forEach((b: any) => {
            buildingsMap[b.id] = b.name;
          });
        }

        (rooms || []).forEach((r: any) => {
          roomsMap[r.id] = {
            room: r.name,
            building: buildingsMap[r.building_id] || "",
          };
        });
      }

      const formattedAssets: Asset[] = dataWithLocation.map((item: any) => {
        const roomInfo = item.storage_room_id ? roomsMap[item.storage_room_id] : null;
        const location = roomInfo
          ? roomInfo.building
            ? `${roomInfo.building} · ${roomInfo.room}`
            : roomInfo.room
          : "—";

        return {
          id: item.id,
          material_product: item.name || "—",
          batch_number: item.batch_number || "—",
          expiry_date: item.expiry_date || "—",
          has_qr_code: item.has_qr_code || false,
          packing: item.packing || "—",
          quantity: item.quantity ?? 0,
          supplier_name: item.supplier_id ? suppliersMap[item.supplier_id] || "—" : "—",
          location,
        };
      });

      setAssets(formattedAssets);
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter(
    (a) =>
      a.material_product.toLowerCase().includes(search.toLowerCase()) ||
      (a.batch_number !== "—" && a.batch_number.toLowerCase().includes(search.toLowerCase())) ||
      (a.supplier_name !== "—" && a.supplier_name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleViewDetails = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowDetailModal(true);
  };

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      const { error } = await supabase.from("tc_materials").delete().eq("id", id);
      if (error) throw error;
      fetchAssets();
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Assets</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage material and product assets with traceability information.
            </p>
          </div>
          {!readOnly && (
            <button
              onClick={() => { setSelectedAsset(null); setShowEditModal(true); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition"
            >
              <Plus size={16} />
              Add Asset
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by material, batch number, or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Material/Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Batch n#
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  QR Code Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Packing Item
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Supplier Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-gray-400 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package size={40} className="text-gray-300" />
                      <p className="text-gray-600 font-medium">No assets found</p>
                      <p className="text-sm text-gray-400">
                        {search
                          ? "Try adjusting your search."
                          : readOnly
                          ? "Assets with a location assigned will appear here."
                          : "Add assets with a location assigned to get started."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{asset.material_product}</td>
                    <td className="px-4 py-3 text-gray-600">{asset.batch_number}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(asset.expiry_date)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          asset.has_qr_code
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {asset.has_qr_code ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{asset.packing}</td>
                    <td className="px-4 py-3 text-gray-600">{asset.quantity}</td>
                    <td className="px-4 py-3 text-gray-600">{asset.supplier_name}</td>
                    <td className="px-4 py-3 text-gray-600">{asset.location}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetails(asset)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>
                        {!readOnly && (
                          <>
                            <button
                              onClick={() => handleEdit(asset)}
                              className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(asset.id)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <AssetEditModal
          asset={selectedAsset}
          onClose={() => {
            setShowEditModal(false);
            fetchAssets();
          }}
        />
      )}
    </div>
  );
};

// ── Detail Modal ──────────────────────────────────────────────────────────────

const AssetDetailModal: React.FC<{ asset: Asset; onClose: () => void }> = ({ asset, onClose }) => {
  const formatDate = (val: string) => {
    if (!val || val === "—") return "—";
    try {
      return new Date(val).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return val; }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-900">Asset Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ✕
          </button>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Material/Product</p>
              <p className="text-sm text-gray-900 mt-1">{asset.material_product}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Batch n#</p>
              <p className="text-sm text-gray-900 mt-1">{asset.batch_number}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expiry Date</p>
              <p className="text-sm text-gray-900 mt-1">{formatDate(asset.expiry_date)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">QR Code Status</p>
              <p className="mt-1">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${asset.has_qr_code ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {asset.has_qr_code ? "Yes" : "No"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Packing Item</p>
              <p className="text-sm text-gray-900 mt-1">{asset.packing}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quantity</p>
              <p className="text-sm text-gray-900 mt-1">{asset.quantity}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Supplier Name</p>
              <p className="text-sm text-gray-900 mt-1">{asset.supplier_name}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</p>
              <p className="text-sm text-gray-900 mt-1">{asset.location}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Edit Modal ────────────────────────────────────────────────────────────────

const AssetEditModal: React.FC<{ asset: Asset | null; onClose: () => void }> = ({ asset, onClose }) => {
  const isNew = !asset;
  const [form, setForm] = useState({
    name: asset?.material_product || "",
    batch_number: asset?.batch_number === "—" ? "" : asset?.batch_number || "",
    expiry_date: asset?.expiry_date === "—" ? "" : asset?.expiry_date || "",
    has_qr_code: asset?.has_qr_code || false,
    packing: asset?.packing === "—" ? "" : asset?.packing || "",
    quantity: asset?.quantity || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");
    try {
      if (isNew) {
        const { error: err } = await supabase.from("tc_materials").insert([{
          name: form.name.trim(),
          batch_number: form.batch_number || null,
          expiry_date: form.expiry_date || null,
          has_qr_code: form.has_qr_code,
          packing: form.packing || null,
          quantity: form.quantity,
        }]);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("tc_materials").update({
          name: form.name.trim(),
          batch_number: form.batch_number || null,
          expiry_date: form.expiry_date || null,
          has_qr_code: form.has_qr_code,
          packing: form.packing || null,
          quantity: form.quantity,
        }).eq("id", asset!.id);
        if (err) throw err;
      }
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-900">{isNew ? "Add Asset" : "Edit Asset"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Material/Product <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Batch n#</label>
              <input
                type="text"
                value={form.batch_number}
                onChange={(e) => setForm({ ...form, batch_number: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. BT-001"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry Date</label>
              <input
                type="date"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Packing Item</label>
              <input
                type="text"
                value={form.packing}
                onChange={(e) => setForm({ ...form, packing: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Box, Pallet"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={0}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="has_qr_code"
              checked={form.has_qr_code}
              onChange={(e) => setForm({ ...form, has_qr_code: e.target.checked })}
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="has_qr_code" className="text-sm text-gray-700 cursor-pointer">
              Has QR Code
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-60"
          >
            {saving ? "Saving..." : isNew ? "Add Asset" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetsDashboard;
