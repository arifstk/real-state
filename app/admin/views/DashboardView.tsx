// app/admin/views/DashboardView.tsx

"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Home,
  BadgeDollarSign,
  CalendarCheck,
  KeyRound,
  BadgeCheck,
  Clock,
  Store,
} from "lucide-react";

interface SellerStat {
  _id: string;
  sellerName: string;
  email: string;
  totalFlats: number;
  availableFlats: number;
  soldFlats: number;
  totalBookings: number;
  totalRevenue: number;
}

interface Summary {
  users: number;
  sellers: number;
  flats: number;
  availableFlats: number;
  soldFlats: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
}

interface DashboardData {
  summary: Summary;
  sellerStats: SellerStat[];
}

const dollar = (n: number) => `$${Number(n || 0).toLocaleString("en-US")}`;

export default function AdminDashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetch("/api/admin/stats")
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || "Failed to load statistics");
        if (isMounted) setData(json);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Failed to load statistics");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-8 text-slate-400 font-medium">Loading metrics...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl">
        {error}
      </div>
    );
  }

  const summary: Summary = data?.summary || {
    users: 0,
    sellers: 0,
    flats: 0,
    availableFlats: 0,
    soldFlats: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  };

  const cards = [
    { label: "Total Sales Revenue", count: dollar(summary.totalRevenue), icon: BadgeDollarSign, color: "text-emerald-600 bg-emerald-50" },
    { label: "Flats Sold", count: summary.soldFlats, icon: BadgeCheck, color: "text-rose-600 bg-rose-50" },
    { label: "Flats For Sale", count: summary.availableFlats, icon: KeyRound, color: "text-amber-600 bg-amber-50" },
    { label: "Total Flats", count: summary.flats, icon: Home, color: "text-purple-600 bg-purple-50" },
    { label: "Total Bookings", count: summary.totalBookings, icon: CalendarCheck, color: "text-blue-600 bg-blue-50" },
    { label: "Pending Bookings", count: summary.pendingBookings, icon: Clock, color: "text-orange-600 bg-orange-50" },
    { label: "Total Sellers", count: summary.sellers, icon: Store, color: "text-teal-600 bg-teal-50" },
    { label: "Total Users", count: summary.users, icon: Users, color: "text-indigo-600 bg-indigo-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Overview Dashboard</h2>
        <p className="text-xs text-slate-500 mt-1">
          Real estate platform-wide statistics and seller performance.
        </p>
      </div>

      {/* Stat Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-4"
            >
              <div className={`p-2.5 rounded-xl ${card.color}`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
                <h3 className="text-lg font-extrabold text-slate-800 mt-0.5 tracking-tighter truncate">{card.count}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">Seller-Wise Breakdown</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Listings, bookings and sales revenue for each seller.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="p-4">Seller</th>
                <th className="p-4 text-center">Total Flats</th>
                <th className="p-4 text-center">For Sale</th>
                <th className="p-4 text-center">Sold</th>
                <th className="p-4 text-center">Bookings</th>
                <th className="p-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.sellerStats && data.sellerStats.length > 0 ? (
                data.sellerStats.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{s.sellerName}</p>
                      {s.email && <p className="text-[11px] text-slate-400">{s.email}</p>}
                    </td>
                    <td className="p-4 text-center font-medium">{s.totalFlats}</td>
                    <td className="p-4 text-center">
                      <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-md">
                        {s.availableFlats}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-md">
                        {s.soldFlats}
                      </span>
                    </td>
                    <td className="p-4 text-center font-medium">{s.totalBookings}</td>
                    <td className="p-4 text-right font-extrabold text-emerald-600">
                      {dollar(s.totalRevenue)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    No seller metrics available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

