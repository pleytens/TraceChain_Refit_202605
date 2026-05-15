import React, { useState } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { ProcessesProvider } from "@/context/ProcessesContext";
import { SuppliersProvider } from "@/context/SuppliersContext";
import { UnitsProvider } from "@/context/UnitsContext";
import LoginPage from "@/pages/LoginPage";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import TVAdminDashboard from "@/pages/TVAdminDashboard";
import UserManagement from "@/pages/UserManagement";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Suppliers from "@/pages/Suppliers";
import Recording from "@/pages/Recording";
import Process from "@/pages/Process";
import ProfileSettings from "@/pages/ProfileSettings";
import PlaceholderPage from "@/pages/PlaceholderPage";
import Materials from "@/pages/settings/Materials";
import SettingsProducts from "@/pages/settings/SettingsProducts";
import SettingsProcesses from "@/pages/settings/SettingsProcesses";
import SettingsSuppliers from "@/pages/settings/SettingsSuppliers";
import SettingsCustomers from "@/pages/settings/SettingsCustomers";
import UnitsManagement from "@/pages/UnitsManagement";

const pageMeta: Record<string, { title: string; icon: string }> = {
  home: { title: "Dashboard", icon: "🏠" },
  users: { title: "People Management", icon: "👥" },
  recording: { title: "Recording", icon: "📝" },
  products: { title: "Products", icon: "📦" },
  suppliers: { title: "Suppliers", icon: "🏭" },
  process: { title: "Process", icon: "⚙️" },
  customers: { title: "Customers", icon: "🤝" },
  markets: { title: "Markets", icon: "🛒" },
  events: { title: "Events", icon: "📅" },
  report: { title: "Reports", icon: "📊" },
  profile: { title: "Profile Settings", icon: "👤" },
  "settings-materials": { title: "Settings · Materials", icon: "🧱" },
  "settings-products": { title: "Settings · Products", icon: "📦" },
  "settings-processes": { title: "Settings · Processes", icon: "⚙️" },
  "settings-suppliers": { title: "Supplier Settings", icon: "🏭" },
  "settings-customers": { title: "Customer Settings", icon: "🤝" },
  "units-management": { title: "Units Management", icon: "📐" },
  "process-actions": { title: "Process Actions", icon: "⚙️" },
};

function AppInner() {
  const { isAuthenticated, currentUser, activePortal } = useAuth();
  const [activePage, setActivePage] = useState("home");
  const meta = pageMeta[activePage] ?? pageMeta.home;

  if (!isAuthenticated) return <LoginPage />;

  const isAdminPortal = activePortal === "admin";

  const adminRoles = ["Admin", "SuperAdmin", "TraceChainClientPortalAdmin"];
  const isNormalUser = !isAdminPortal && !adminRoles.includes(currentUser?.role ?? "");

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return isAdminPortal ? <TVAdminDashboard /> : <Dashboard />;
      case "customers":
        return <TVAdminDashboard />;
      case "users":
        return <UserManagement />;
      case "products":
        return <Products />;
      case "suppliers":
        return <Suppliers />;
      case "recording":
        return <Recording />;
      case "process":
        return <Process />;
      case "profile":
        return <ProfileSettings />;
      case "settings-materials":
        return <Materials />;
      case "settings-products":
        return <SettingsProducts />;
      case "settings-processes":
        return <SettingsProcesses />;
      case "settings-suppliers":
        return <SettingsSuppliers readOnly={isNormalUser} />;
      case "settings-customers":
        return <SettingsCustomers readOnly={isNormalUser} />;
      case "units-management":
        return <UnitsManagement readOnly={isNormalUser} />;
      case "process-actions":
        return <PlaceholderPage title="Process Actions" icon="⚙️" readOnly={isNormalUser} />;
      default:
        return <PlaceholderPage title={meta.title} icon={meta.icon} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar active={activePage} onNavigate={setActivePage} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={meta.title}
          onNavigateToUnits={() => setActivePage("units-management")}
          onNavigateToProcessActions={() => setActivePage("process-actions")}
          onNavigateToSupplierSettings={() => setActivePage("settings-suppliers")}
          onNavigateToCustomerSettings={() => setActivePage("settings-customers")}
        />
        <main className="flex-1 p-6 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <UnitsProvider>
        <ProductsProvider>
          <SuppliersProvider>
            <ProcessesProvider>
              <AppInner />
            </ProcessesProvider>
          </SuppliersProvider>
        </ProductsProvider>
      </UnitsProvider>
    </AuthProvider>
  );
}

export default App;
