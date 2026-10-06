// app/vendor-dashboard/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarCheck, Home, PlusCircle } from "lucide-react";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/vendor-dashboard", icon: LayoutDashboard },
    { name: "My Flats", href: "/vendor-dashboard/flats", icon: Home },
    { name: "Add Flat", href: "/vendor-dashboard/flats/add", icon: PlusCircle },
    { name: "Bookings", href: "/vendor-dashboard/bookings", icon: CalendarCheck },
  ];

  return (
    <div className="max-w-7xl mx-auto min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-slate-200 p-3 md:p-6 flex flex-col shrink-0 bg-white">
        <div className="mb-8 px-2">
          <h1 className="text-lg font-bold text-slate-800">Vendor Portal</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real Estate Management</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${isActive
                    ? "bg-teal-100 text-teal-700 font-semibold border-r-4 border-teal-600"
                    : "text-slate-600 hover:bg-gray-50"
                  }`}
              >
                <Icon size={18} className={isActive ? "text-teal-600" : "text-slate-400"} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}

