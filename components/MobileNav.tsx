"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { User, ShoppingBag, LayoutDashboard, Store, LogOut, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import HeaderSearchBar from "./HeaderSearchBar";

type MobileNavProps = {
  role?: "superadmin" | "vendor" | "user";
};

export default function MobileNav({ role }: MobileNavProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = role === "superadmin";
  const isVendor = role === "vendor";
  const isUser = role === "user";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* ── Hamburger Button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 group cursor-pointer focus:outline-none"
        aria-label="Toggle menu"
      >
        <span
          className={`block h-0.5 bg-slate-800 transition-all duration-300 ease-in-out ${open ? "w-5 rotate-45 translate-y-2 bg-teal-600" : "w-5"
            }`}
        />
        <span
          className={`block h-0.5 bg-slate-800 transition-all duration-300 ease-in-out ${open ? "w-0 opacity-0" : "w-4"
            }`}
        />
        <span
          className={`block h-0.5 bg-slate-800 transition-all duration-300 ease-in-out ${open ? "w-5 -rotate-45 -translate-y-2 bg-teal-600" : "w-5"
            }`}
        />
      </button>

      {/* ── Backdrop ── */}
      <div
        className={`fixed inset-0 z-40 md:hidden bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setOpen(false)}
      />

      {/* ── Drawer Sidebar ── */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 w-72 h-screen bg-white shadow-2xl border-r border-teal-100 z-50 md:hidden flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header Branding & Close Button */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-teal-50 shrink-0">
          <Link href="/" onClick={() => setOpen(false)} className="text-xl font-bold">
            <span className="text-teal-600 tracking-wider">Stay</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile Search Bar Section */}
        <div className="p-4 border-b border-teal-50 bg-slate-50/50">
          <HeaderSearchBar />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-150 ${active
                    ? "bg-teal-50 text-teal-600 font-semibold"
                    : "text-slate-600 hover:text-teal-600 hover:bg-teal-50/50"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* User Account Links */}
          {session?.user ? (
            <>
              <div className="border-t border-teal-100/60 my-4" />
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider px-3 pb-2">
                Account
              </p>

              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-600 hover:text-teal-600 hover:bg-teal-50/50 transition-all duration-150"
              >
                <User size={18} className="text-slate-400" />
                My Profile
              </Link>

              {isUser && (
                <Link
                  href="/my-bookings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-600 hover:text-teal-600 hover:bg-teal-50/50 transition-all duration-150"
                >
                  <ShoppingBag size={18} className="text-slate-400" />
                  My Bookings
                </Link>
              )}

              {isSuperAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-teal-600 bg-teal-50 font-medium transition-all duration-150"
                >
                  <LayoutDashboard size={18} className="text-teal-600" />
                  Admin Panel
                </Link>
              )}

              {isVendor && (
                <Link
                  href="/vendor-dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-teal-600 bg-teal-50 font-medium transition-all duration-150"
                >
                  <Store size={18} className="text-teal-600" />
                  Vendor Dashboard
                </Link>
              )}
            </>
          ) : (
            <div className="pt-4 px-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-all shadow-sm"
              >
                Sign In
              </Link>
            </div>
          )}
        </nav>

        {/* Sign Out CTA */}
        {session?.user && (
          <div className="p-4 border-t border-teal-50 bg-slate-50/50 shrink-0">
            <button
              onClick={() => {
                signOut({ callbackUrl: "/" });
                setOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100/80 transition-all cursor-pointer"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  );
}

