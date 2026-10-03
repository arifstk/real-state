"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, LayoutDashboard, Store, ShoppingBag } from "lucide-react";
import MobileNav from "./MobileNav";
import HeaderSearchBar from "./HeaderSearchBar";
import { NAV_LINKS } from "@/lib/constants";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const role = session?.user?.role as "superadmin" | "vendor" | "user" | undefined;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-teal-100/60 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-2 py-2 md:py-2.5 flex items-center justify-between gap-4">

        {/* Left Section: Mobile Nav + Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <MobileNav role={role} />

          <Link href="/" className="text-xl font-bold flex items-center">
            <span className="text-teal-600 tracking-tighter">Real State</span>
          </Link>
        </div>

        {/* Center Section: Desktop Nav Links + Live Search Bar */}
        <div className="hidden md:flex items-center gap-6 flex-1 max-w-2xl mx-4">
          <div className="flex items-center gap-6 shrink-0">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-xs font-medium transition-colors duration-200 py-1 ${active ? "text-teal-600 font-semibold" : "text-slate-600 hover:text-teal-600"
                    }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-0.5 bg-teal-600 transition-all duration-300 ${active ? "w-full" : "w-0"
                      }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Integrated Search Bar Component */}
          <div className="flex-1">
            <HeaderSearchBar />
          </div>
        </div>

        {/* Right Section: Auth Action / Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {status === "loading" && (
            <span className="px-4 py-2 rounded-xl text-xs btn-primary text-white transition-all shadow-xs">Loading...</span>
          )}

          {status === "unauthenticated" && (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold btn-primary text-white transition-all shadow-xs"
            >
              Sign In
            </Link>
          )}

          {status === "authenticated" && (
            <div className="relative" ref={dropdownRef}>
              {/* Profile Trigger Button */}
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 md:pl-1 md:pr-3 py-1 rounded-xl md:bg-teal-50 md:border md:border-teal-100 hover:bg-teal-100/50 transition-all duration-200 cursor-pointer focus:outline-none"
              >
                <div className="relative w-7 h-7 rounded-full overflow-hidden ring-1 ring-teal-600/50 shrink-0 bg-teal-100 flex items-center justify-center">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "Avatar"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-teal-700 text-xs font-bold uppercase">
                      {session.user?.name?.[0] || "U"}
                    </span>
                  )}
                </div>
                <span className="hidden sm:block text-xs text-slate-700 font-medium max-w-25 truncate">
                  {session.user?.name?.split(" ")[0]}
                </span>
              </button>

              {/* Profile Dropdown Box */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-teal-100 shadow-2xl overflow-hidden z-50">
                  {/* User Brief Meta */}
                  <div className="px-4 py-3 bg-teal-50/30 border-b border-teal-50">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {session.user?.email}
                    </p>
                  </div>

                  {/* Menu List */}
                  <div className="p-1.5 space-y-0.5">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-teal-50/60 hover:text-teal-700 rounded-lg transition-colors"
                    >
                      <User size={16} className="text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    {role === "user" && (
                      <Link
                        href="/my-bookings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-teal-50/60 hover:text-teal-700 rounded-lg transition-colors"
                      >
                        <ShoppingBag size={16} className="text-slate-400" />
                        <span>My Bookings</span>
                      </Link>
                    )}

                    {role === "superadmin" && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors font-medium"
                      >
                        <LayoutDashboard size={16} />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    {role === "vendor" && (
                      <Link
                        href="/vendor-dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors font-medium"
                      >
                        <Store size={16} />
                        <span>Vendor Dashboard</span>
                      </Link>
                    )}
                  </div>

                  {/* Logout Action */}
                  <div className="p-1.5 border-t border-teal-50">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium cursor-pointer"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

