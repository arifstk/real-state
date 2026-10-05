// app/admin/layout.tsx

"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Users, Building2, Home, Contact, Settings2, FileText, Lock } from "lucide-react";
import AdminDashboardView from "./views/DashboardView";
import AdminUsersView from "./views/UsersView";
import AdminPropertiesView from "./views/PropertiesView";
import AdminFlatsView from "./views/FlatsView";
import AdminHeroBannerView from "./views/AdminHeroBannerView";
import AdminContactView from "./views/AdminContactView";
import AdminSettingsView from "./views/AdminSettingsView";
import PageContentEditor from "@/components/PageContentEditor";
import { MdHelpCenter } from "react-icons/md";
import { FaServicestack } from "react-icons/fa";

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "users" | "properties" | "flats" | "banner" | "settings" | "contact" | "about" | "help-center" | "privacy-policy" | "terms-of-service"
  >("dashboard");

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [updatingMaintenance, setUpdatingMaintenance] = useState(false);

  useEffect(() => {
    fetch("/api/admin/system-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.maintenanceMode !== undefined) {
          setMaintenanceMode(data.settings.maintenanceMode);
        }
      })
      .catch(() => { });
  }, []);

  const toggleMaintenanceMode = async () => {
    setUpdatingMaintenance(true);
    const newStatus = !maintenanceMode;
    try {
      const res = await fetch("/api/admin/system-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenanceMode: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setMaintenanceMode(newStatus);
        alert(`Maintenance Mode turned ${newStatus ? "ON" : "OFF"}`);
      } else {
        alert("Failed to update Maintenance Mode");
      }
    } catch {
      alert("Error saving maintenance status");
    } finally {
      setUpdatingMaintenance(false);
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "banner", label: "Hero Banner", icon: LayoutDashboard },
    { id: "contact", label: "Messages", icon: Contact },
    { id: "users", label: "User List", icon: Users },
    { id: "properties", label: "Properties", icon: Building2 },
    { id: "flats", label: "Flats List", icon: Home },
    { id: "settings", label: "Settings", icon: Settings2 },
    { id: "about", label: "About Us", icon: FileText },
    { id: "help-center", label: "Help Center & FAQ", icon: MdHelpCenter },
    { id: "privacy-policy", label: "Privacy Policy", icon: Lock },
    { id: "terms-of-service", label: "Terms of Service", icon: FaServicestack },
  ];

  return (
    <div className="max-w-7xl mx-auto min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-slate-200 p-3 md:p-6 flex flex-col shrink-0">
        <div className="mb-8 px-2">
          <h1 className="text-lg font-bold text-slate-800">Super Admin</h1>
          <p className="text-xs text-slate-400 mt-0.5">Management Portal</p>
        </div>

        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as "dashboard" | "users" | "properties" | "flats" | "banner" | "settings" | "contact" | "about" | "help-center" | "privacy-policy" | "terms-of-service")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${isActive
                  ? "bg-teal-100 text-teal-900 font-semibold border-r-5 border-teal-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <Icon size={18} className={isActive ? "text-teal-600" : "text-slate-400"} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-3 md:p-8 overflow-y-auto">
        {activeTab === "dashboard" && <AdminDashboardView />}
        {activeTab === "banner" && <AdminHeroBannerView />}
        {activeTab === "contact" && <AdminContactView />}
        {activeTab === "users" && <AdminUsersView />}
        {activeTab === "properties" && <AdminPropertiesView />}
        {activeTab === "flats" && <AdminFlatsView />}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span>🛠️</span> Site Maintenance Mode
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  When enabled, regular visitors and vendors are redirected to the maintenance banner page.
                </p>
              </div>
              <button
                onClick={toggleMaintenanceMode}
                disabled={updatingMaintenance}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${maintenanceMode
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                  }`}
              >
                {updatingMaintenance
                  ? "Updating..."
                  : maintenanceMode
                    ? "Active (Click to Disable)"
                    : "Disabled (Click to Enable)"}
              </button>
            </div>
            <AdminSettingsView />
          </div>
        )}
        {activeTab === "about" && <PageContentEditor slug="about-us" title="About Us Page" />}
        {activeTab === "help-center" && <PageContentEditor slug="help-center" title="Help Center & FAQ" />}
        {activeTab === "privacy-policy" && <PageContentEditor slug="privacy-policy" title="Privacy Policy Page" />}
        {activeTab === "terms-of-service" && <PageContentEditor slug="terms-of-service" title="Terms of Service Page" />}
      </main>
    </div>
  );
}

