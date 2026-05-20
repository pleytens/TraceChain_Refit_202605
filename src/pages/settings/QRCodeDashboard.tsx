import React, { useState, useEffect } from "react";
import { Search, Eye, QrCode, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface QRCodeRecord {
  id: string;
  material_product: string;
  batch_number: string;
  expiry_date: string | null;
  date_recorded: string;
  quantity_recorded: number;
  qr_code_count: number;
  date_qr_codes: string;
  recording_id: string | null;
  process_id: string | null;
  action_id: string | null;
  tenant_id: string;
  created_at: string;
}

interface QRCodeDashboardProps {
  readOnly?: boolean;
}

const formatDate = (val: string | null) => {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString();
  } catch {
    return val;
  }
};

const QRCodeDashboard: React.FC<QRCodeDashboardProps> = ({ readOnly = false }) => {
  const [qrCodes, setQrCodes] = useState<QRCodeRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<QRCodeRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    fetchQRCodeData();
  }, []);

  const fetchQRCodeData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tc_qr_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQrCodes(data || []);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQRCodes = qrCodes.filter(
    (qr) =>
      qr.material_product.toLowerCase().includes(search.toLowerCase()) ||
      qr.batch_number.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewDetails = (qr: QRCodeRecord) => {
    setSelectedQR(qr);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">QR Codes</h2>
            <p className="text-sm text-gray-500 mt-1">
              {readOnly
                ? "View generated QR codes for traceability."
                : "Manage and generate QR codes for traceability."}
            </p>
          </div>
          {!readOnly && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition"
            >
              <QrCode size={16} />
              Generate QR Codes
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by material or batch..."
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
                  Material / Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Batch n#
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date Records
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Qty Recorded
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  n# QR Codes
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date QR Codes
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-400 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : filteredQRCodes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <QrCode size={40} className="text-gray-300" />
                      <p className="text-gray-600 font-medium">No QR codes found</p>
                      <p className="text-sm text-gray-400">
                        {search
                          ? "Try adjusting your search."
                          : readOnly
                          ? "QR codes will appear here when generated."
                          : "Generate QR codes to get started."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQRCodes.map((qr) => (
                  <tr key={qr.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{qr.material_product}</td>
                    <td className="px-4 py-3 text-gray-600">{qr.batch_number}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(qr.expiry_date)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(qr.date_recorded)}</td>
                    <td className="px-4 py-3 text-gray-600">{qr.quantity_recorded}</td>
                    <td className="px-4 py-3 text-gray-600">{qr.qr_code_count}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(qr.date_qr_codes)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleViewDetails(qr)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900">QR Code Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Material / Product
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{selectedQR.material_product}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Batch n#
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{selectedQR.batch_number}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Expiry Date
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(selectedQR.expiry_date)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date Records
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(selectedQR.date_recorded)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Quantity Recorded
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{selectedQR.quantity_recorded}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    n# QR Codes
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{selectedQR.qr_code_count}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date QR Codes
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(selectedQR.date_qr_codes)}</p>
                </div>
                {selectedQR.recording_id && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Recording ID
                    </label>
                    <p className="text-sm text-gray-500 mt-1 font-mono text-xs">{selectedQR.recording_id}</p>
                  </div>
                )}
                {selectedQR.process_id && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Process ID
                    </label>
                    <p className="text-sm text-gray-500 mt-1 font-mono text-xs">{selectedQR.process_id}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate QR Codes Modal (placeholder) */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900">Generate QR Codes</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-8 text-center">
              <QrCode size={48} className="text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium text-sm">QR Code generation</p>
              <p className="text-xs text-gray-400 mt-2">
                This feature will allow you to generate QR codes linked to recordings, materials, and batches.
              </p>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeDashboard;
