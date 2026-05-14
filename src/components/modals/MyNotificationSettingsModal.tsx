import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Props {
  onClose: () => void;
}

const MyNotificationSettingsModal: React.FC<Props> = ({ onClose }) => {
  const { currentUser, updateUser } = useAuth();
  const [enabled, setEnabled] = useState(currentUser?.notificationsEnabled ?? true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!currentUser) return;
    updateUser(currentUser.id, { notificationsEnabled: enabled });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-white text-xl">
              🔔
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">My Notification Settings</h2>
              <p className="text-xs text-gray-500">Control how you receive alerts</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl transition">✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Main toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-800">Push Notifications</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Receive real-time alerts in your browser or mobile device (Android / iOS)
              </p>
            </div>
            {/* Toggle switch */}
            <button
              onClick={() => setEnabled((v) => !v)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none shrink-0 ml-4 ${enabled ? "bg-blue-600" : "bg-gray-300"}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${enabled ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          {/* Status banner */}
          <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-3 ${enabled ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
            <span className="text-lg">{enabled ? "✅" : "🔕"}</span>
            <div>
              <p className="font-semibold">{enabled ? "Notifications are active" : "Notifications are inactive"}</p>
              <p className="text-xs mt-0.5 opacity-80">
                {enabled
                  ? "You will be alerted when files are shared with you, users are created, or processes are updated."
                  : "You won't receive any alerts. Toggle on to re-enable notifications."}
              </p>
            </div>
          </div>

          {/* Info note */}
          <p className="text-xs text-gray-400">
            Note: Push notifications require browser or device permission. If you haven't granted permission yet, your browser may prompt you when notifications are enabled.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition flex items-center gap-2"
          >
            {saved ? "✓ Saved!" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyNotificationSettingsModal;
