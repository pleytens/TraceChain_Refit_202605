import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface SidebarItem {
  label: string;
  icon: string;
  id: string;
  adminRoles?: string[];
}

interface SidebarGroup {
  type: "group";
  label: string;
  icon: string;
  id: string;
  children: SidebarItem[];
}

type MenuItem = SidebarItem | SidebarGroup;

// Admin portal menu: client management focus
const adminMenuItems: MenuItem[] = [
  { label: "Dashboard", icon: "🏠", id: "home" },
  { label: "People Management", icon: "👥", id: "users" },
];

// Client portal menu: full operational menu
const clientMenuItems: MenuItem[] = [
  { label: "Dashboard", icon: "🏠", id: "home" },
  { label: "People Management", icon: "👥", id: "users", adminRoles: ["TraceChainClientPortalAdmin", "SuperAdmin", "Admin"] },
  { label: "Recording", icon: "📝", id: "recording" },
  { label: "Markets", icon: "🛒", id: "markets" },
  { label: "Events", icon: "📅", id: "events" },
  { label: "Reports", icon: "📊", id: "report" },
  {
    type: "group",
    label: "Settings",
    icon: "🔧",
    id: "settings",
    children: [
      { label: "Materials", icon: "🧱", id: "settings-materials" },
      { label: "Products", icon: "📦", id: "settings-products" },
      { label: "Processes", icon: "⚙️", id: "settings-processes" },
    ],
  },
  { label: "Profile Settings", icon: "👤", id: "profile" },
];

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ active, onNavigate }) => {
  const { currentUser, logout, activePortal } = useAuth();
  const isAdminPortal = activePortal === "admin";
  const [settingsOpen, setSettingsOpen] = useState(() => active.startsWith("settings-"));

  const baseItems: MenuItem[] = isAdminPortal ? adminMenuItems : clientMenuItems;
  const isSettingsActive = active.startsWith("settings-");

  const roleLabel = (role: string) => {
    if (role === "TraceChainAdminPortalAdmin") return "TV Admin";
    if (role === "TraceChainClientPortalAdmin") return "Portal Admin";
    return role;
  };

  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700">
        <div className={`w-9 h-9 ${isAdminPortal ? "bg-green-500" : "bg-blue-500"} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
          TV
        </div>
        <div>
          <div className="text-sm font-bold text-white leading-tight">TraceVerified</div>
          <div className={`text-xs font-medium ${isAdminPortal ? "text-green-400" : "text-blue-400"}`}>
            {isAdminPortal ? "Admin Portal" : "Client Portal"}
          </div>
        </div>
      </div>

      {/* Role badge */}
      {currentUser && (
        <div className="px-5 py-2.5 border-b border-gray-700 bg-gray-800/50">
          <div className="text-xs text-gray-300 truncate">{currentUser.firstName} {currentUser.lastName}</div>
          <div className={`text-xs font-semibold mt-0.5 ${isAdminPortal ? "text-green-400" : "text-blue-400"}`}>{roleLabel(currentUser.role)}</div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {baseItems.map((item) => {
          // Filter admin-only items
          if ("adminRoles" in item && item.adminRoles && !("type" in item)) {
            if (!item.adminRoles.includes(currentUser?.role ?? "")) return null;
          }

          // Render Settings group
          if ("type" in item && item.type === "group") {
            const group = item as SidebarGroup;
            return (
              <div key={group.id}>
                {/* Group header */}
                <button
                  onClick={() => setSettingsOpen((o) => !o)}
                  className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-150 text-left
                    ${isSettingsActive
                      ? isAdminPortal ? "bg-green-600 text-white font-semibold" : "bg-blue-600 text-white font-semibold"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                >
                  <span className="text-base">{group.icon}</span>
                  <span className="flex-1">{group.label}</span>
                  <span
                    className={`text-xs transition-transform duration-200 inline-block ${settingsOpen ? "rotate-90" : "rotate-0"}`}
                    style={{ lineHeight: 1 }}
                  >
                    ▶
                  </span>
                </button>

                {/* Sub-items */}
                {settingsOpen && (
                  <div className="bg-gray-950/40 border-l-2 border-gray-700 ml-5">
                    {group.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => onNavigate(child.id)}
                        className={`w-full flex items-center gap-3 pl-5 pr-4 py-2 text-sm transition-all duration-150 text-left
                          ${active === child.id
                            ? isAdminPortal
                              ? "bg-green-700/80 text-white font-semibold"
                              : "bg-blue-700/80 text-white font-semibold"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                          }`}
                      >
                        <span className="text-sm">{child.icon}</span>
                        <span>{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Render normal item
          const navItem = item as SidebarItem;
          return (
            <button
              key={navItem.id}
              onClick={() => onNavigate(navItem.id)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-150 text-left
                ${active === navItem.id
                  ? isAdminPortal ? "bg-green-600 text-white font-semibold" : "bg-blue-600 text-white font-semibold"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
            >
              <span className="text-base">{navItem.icon}</span>
              <span>{navItem.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-5 py-4 border-t border-gray-700 space-y-1">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 transition py-1"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
        <div className="text-xs text-gray-600">v2.0.0</div>
      </div>
    </aside>
  );
};

export default Sidebar;
