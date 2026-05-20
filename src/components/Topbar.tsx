import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import MyProfileModal from "@/components/modals/MyProfileModal";
import MyNotificationSettingsModal from "@/components/modals/MyNotificationSettingsModal";
import StorageRequirementsModal from "@/components/modals/StorageRequirementsModal";
import { ChevronRight, ChevronDown, Share2 } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const notifIcon: Record<string, string> = {
  file_shared: "📎",
  user_created: "👤",
  process_updated: "⚙️",
  info: "ℹ️",
};

// ── Component ─────────────────────────────────────────────────────────────────

interface TopbarProps {
  title: string;
  onNavigateToUnits?: () => void;
  onNavigateToProcessActions?: () => void;
  onNavigateToSupplierSettings?: () => void;
  onNavigateToCustomerSettings?: () => void;
  onNavigateToProcessSettings?: () => void;
  onNavigateToCompany?: () => void;
  onNavigateToLocations?: () => void;
  onNavigateToPeopleManagement?: () => void;
  onNavigateToQRCodes?: () => void;
  onNavigateToAssets?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({
  title,
  onNavigateToUnits,
  onNavigateToProcessActions,
  onNavigateToSupplierSettings,
  onNavigateToCustomerSettings,
  onNavigateToProcessSettings,
  onNavigateToCompany,
  onNavigateToLocations,
  onNavigateToPeopleManagement,
  onNavigateToQRCodes,
  onNavigateToAssets,
}) => {
  const { currentUser, activePortal, notifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useAuth();

  const isAdminPortal = activePortal === "admin";

  const initials = currentUser
    ? `${currentUser.firstName[0] ?? ""}${currentUser.lastName[0] ?? ""}`.toUpperCase()
    : "?";

  // Dropdowns
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [showMyVariables, setShowMyVariables] = useState(false);
  const [showMyCompany, setShowMyCompany] = useState(false);

  // Modals
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [showStorageReqs, setShowStorageReqs] = useState(false);

  // Refs for click-outside
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
        setShowAppSettings(false);
        setShowMyVariables(false);
        setShowMyCompany(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const roleLabel = (role: string) => {
    if (role === "TraceChainAdminPortalAdmin") return "TV Admin";
    if (role === "TraceChainClientPortalAdmin") return "Portal Admin";
    return role;
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-30 relative">
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>

        <div className="flex items-center gap-3">
          {/* ── Notification Bell ──────────────────── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifs((v) => !v); setShowUserMenu(false); }}
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-yellow-500 text-xl"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <span className="text-sm font-semibold text-gray-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Read All
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-gray-400">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 ${!n.read ? "bg-blue-50/60" : ""}`}
                      >
                        <span className="text-lg mt-0.5 shrink-0">{notifIcon[n.type] ?? "🔔"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-xs font-semibold truncate ${!n.read ? "text-gray-900" : "text-gray-600"}`}>
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-gray-400 mt-1 block">{timeAgo(n.timestamp)}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── User / Avatar Dropdown ──────────────── */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => { setShowUserMenu((v) => !v); setShowNotifs(false); }}
              className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <div className={`w-8 h-8 rounded-full ${isAdminPortal ? "bg-green-600" : "bg-blue-600"} flex items-center justify-center text-white text-xs font-bold`}>
                {initials}
              </div>
              <div className="flex flex-col leading-tight text-left">
                <span className="text-sm text-gray-700 font-medium">
                  {currentUser?.firstName} {currentUser?.lastName}
                </span>
                <span className={`text-xs font-medium ${isAdminPortal ? "text-green-600" : "text-blue-600"}`}>
                  {roleLabel(currentUser?.role ?? "")}
                </span>
              </div>
              <span className="text-gray-400 text-xs ml-1">▾</span>
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                {/* User info header */}
                <div className={`px-4 py-3 ${isAdminPortal ? "bg-green-50 border-b border-green-100" : "bg-blue-50 border-b border-blue-100"}`}>
                  <div className="text-sm font-semibold text-gray-800 truncate">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{currentUser?.email}</div>
                  <div className={`text-xs font-medium mt-1 ${isAdminPortal ? "text-green-700" : "text-blue-700"}`}>
                    {roleLabel(currentUser?.role ?? "")}
                  </div>
                </div>

                <div className="py-1">
                  {/* My Profile */}
                  <button
                    onClick={() => { setShowUserMenu(false); setShowProfile(true); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                  >
                    <span>👤</span>
                    My Profile
                  </button>

                  {/* My Notifications */}
                  <button
                    onClick={() => { setShowUserMenu(false); setShowNotifSettings(true); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                  >
                    <span>🔔</span>
                    My Notifications
                  </button>

                  {/* Application Settings (submenu) */}
                  {!isAdminPortal && (
                    <>
                      <button
                        onClick={() => setShowAppSettings((v) => !v)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition"
                      >
                        <span>⚙️</span>
                        <span className="flex-1">Application Settings</span>
                        {showAppSettings ? (
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </button>

                      {showAppSettings && (
                        <div className="bg-gray-50 border-t border-b border-gray-100">
                          {/* My Suppliers */}
                          <button
                            onClick={() => { setShowUserMenu(false); setShowAppSettings(false); onNavigateToSupplierSettings?.(); }}
                            className="w-full text-left pl-10 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-3 transition"
                          >
                            <span>🏭</span>
                            My Suppliers
                          </button>

                          {/* My Customers */}
                          <button
                            onClick={() => { setShowUserMenu(false); setShowAppSettings(false); onNavigateToCustomerSettings?.(); }}
                            className="w-full text-left pl-10 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-3 transition"
                          >
                            <span>🤝</span>
                            My Customers
                          </button>

                          {/* My Company (expandable) */}
                          <button
                            onClick={() => setShowMyCompany((v) => !v)}
                            className="w-full text-left pl-10 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-3 transition"
                          >
                            <span>🏢</span>
                            <span className="flex-1">My Company</span>
                            {showMyCompany ? (
                              <ChevronDown className="w-3 h-3 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-gray-400" />
                            )}
                          </button>

                          {showMyCompany && (
                            <div className="bg-white border-t border-gray-100">
                              {/* Details */}
                              <button
                                onClick={() => { setShowUserMenu(false); setShowAppSettings(false); setShowMyCompany(false); onNavigateToCompany?.(); }}
                                className="w-full text-left pl-16 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-3 transition"
                              >
                                <span>📋</span>
                                Details
                              </button>

                              {/* Locations */}
                              <button
                                onClick={() => { setShowUserMenu(false); setShowAppSettings(false); setShowMyCompany(false); onNavigateToLocations?.(); }}
                                className="w-full text-left pl-16 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-3 transition"
                              >
                                <span>📍</span>
                                Locations
                              </button>

                              {/* People Management */}
                              <button
                                onClick={() => { setShowUserMenu(false); setShowAppSettings(false); setShowMyCompany(false); onNavigateToPeopleManagement?.(); }}
                                className="w-full text-left pl-16 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-3 transition"
                              >
                                <span>👥</span>
                                People Management
                              </button>
                            </div>
                          )}

                          {/* Assets */}
                          <button
                            onClick={() => { setShowUserMenu(false); setShowAppSettings(false); onNavigateToAssets?.(); }}
                            className="w-full text-left pl-10 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-3 transition"
                          >
                            <span>📋</span>
                            Assets
                          </button>

                          {/* My Variables (expandable) */}
                          <button
                            onClick={() => setShowMyVariables((v) => !v)}
                            className="w-full text-left pl-10 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-3 transition"
                          >
                            <span>📐</span>
                            <span className="flex-1">My Variables</span>
                            {showMyVariables ? (
                              <ChevronDown className="w-3 h-3 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-gray-400" />
                            )}
                          </button>

                          {showMyVariables && (
                            <div className="bg-white border-t border-gray-100">
                              {/* Units Management */}
                              <button
                                onClick={() => { setShowUserMenu(false); setShowAppSettings(false); setShowMyVariables(false); onNavigateToUnits?.(); }}
                                className="w-full text-left pl-16 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-3 transition"
                              >
                                <span>📏</span>
                                Units Management
                              </button>

                              {/* Storage Requirements */}
                              <button
                                onClick={() => { setShowUserMenu(false); setShowAppSettings(false); setShowMyVariables(false); setShowStorageReqs(true); }}
                                className="w-full text-left pl-16 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-3 transition"
                              >
                                <span>🗄️</span>
                                Storage Requirements
                              </button>
                            </div>
                          )}

                          {/* Process & Action */}
                          <button
                            onClick={() => { setShowUserMenu(false); setShowAppSettings(false); onNavigateToProcessSettings?.(); }}
                            className="w-full text-left pl-10 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-3 transition"
                          >
                            <span>🔄</span>
                            Process & Action
                          </button>

                          {/* QR Codes */}
                          <button
                            onClick={() => { setShowUserMenu(false); setShowAppSettings(false); onNavigateToQRCodes?.(); }}
                            className="w-full text-left pl-10 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-3 transition"
                          >
                            <span>📷</span>
                            QR Codes
                          </button>

                          {/* Share preferences */}
                          <button
                            onClick={() => { setShowUserMenu(false); setShowAppSettings(false); }}
                            className="w-full text-left pl-10 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-3 transition"
                          >
                            <Share2 className="w-4 h-4 text-gray-500" />
                            Share preferences
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {showProfile && <MyProfileModal onClose={() => setShowProfile(false)} />}
      {showNotifSettings && <MyNotificationSettingsModal onClose={() => setShowNotifSettings(false)} />}
      {showStorageReqs && (
        <StorageRequirementsModal
          onClose={() => setShowStorageReqs(false)}
          readOnly={!(currentUser?.role === "Admin" || currentUser?.role === "SuperAdmin" || currentUser?.role === "TraceChainClientPortalAdmin")}
        />
      )}
    </>
  );
};

export default Topbar;
