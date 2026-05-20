import React, { useState } from "react";
import { AlertTriangle, Lock, ArrowLeft, Check } from "lucide-react";
import type { Recording } from "@/types/recording";

interface Props {
  record: Recording;
  onCancel: () => void;
  onConfirm: (batchLotNumber: string, expiryDate: string) => Promise<void>;
}

const RunConfirmationModal: React.FC<Props> = ({ record, onCancel, onConfirm }) => {
  const [step, setStep] = useState<"warning" | "details">("warning");
  const [batchLot, setBatchLot] = useState("Batch 123abc2026");
  const [expiryDate, setExpiryDate] = useState("20270101");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(batchLot, expiryDate);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {step === "warning" ? (
          <>
            {/* Warning step */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} className="text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Confirm Run</h3>
            </div>

            <div className="px-6 py-6 space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Are you sure you want to run this recording?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm font-semibold text-red-700">⚠️ This action is not revertible.</p>
                <p className="text-xs text-red-600 mt-1">
                  Once confirmed, the recording will be locked and cannot be edited.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-600">
                <p className="font-medium text-gray-700 mb-1">Record: {record.recordName}</p>
                <p>Process: {record.processName}</p>
                <p>Created: {record.userName}</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                No, Cancel
              </button>
              <button
                onClick={() => setStep("details")}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition"
              >
                Yes, Continue →
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Batch/Lot details step */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Lock size={16} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Batch / Lot Details</h3>
                <p className="text-xs text-gray-400">Enter details before locking the record</p>
              </div>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Batch / Lot # <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={batchLot}
                  onChange={(e) => setBatchLot(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Batch 123abc2026"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="YYYYMMDD"
                  maxLength={8}
                />
                <p className="text-xs text-gray-400 mt-1">Format: YYYYMMDD (e.g. 20270101)</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-700">
                  <strong>Final step:</strong> After confirming, the record status will change to{" "}
                  <strong>Locked</strong> and cannot be changed.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-between gap-3">
              <button
                onClick={() => setStep("warning")}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <ArrowLeft size={14} />
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting || !batchLot.trim() || !expiryDate.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="animate-spin">⟳</span>
                ) : (
                  <Lock size={14} />
                )}
                {submitting ? "Locking…" : "CONFIRM & LOCK"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RunConfirmationModal;
