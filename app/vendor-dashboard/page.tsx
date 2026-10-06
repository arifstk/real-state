// app/vendor-dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CircleDollarSign,
  Home,
  CalendarCheck,
  TrendingUp,
  Clock,
  ArrowUpRight,
  AlertCircle,
  Building,
  Users
} from "lucide-react";

type Stats = {
  totalSoldFlats: number;
  activeFlats: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalBookings: number;
  pendingBookings: number;
  totalCustomers: number;
  totalRevenue: number;
};

type RecentBooking = {
  _id: string;
  flatTitle: string;
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
};

export default function VendorDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalSoldFlats: 0,
    activeFlats: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/vendor/dashboard-stats");
        const data = await res.json();

        if (res.ok) {
          setStats(data.stats);
          setRecentBookings(data.recentBookings || []);
        } else {
          toast.error(data.message || "Failed to load dashboard data");
        }
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500 font-medium">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vendor Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time performance metrics and earnings summary</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Active Vendor
          </span>
        </div>
      </div>

      {/* Top Statistics Grid (Extended with more metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Earning of This Month */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CircleDollarSign size={24} />
            </div>
            <span className="text-xs font-medium text-slate-500">This Month</span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Earning (Month)</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">${stats.monthlyRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Total Earning of This Year */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-medium text-slate-500">This Year</span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Earning (Year)</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">${stats.yearlyRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Total Sold Flats */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Home size={24} />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-0.5">
              <ArrowUpRight size={14} /> Sold
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sold Flats</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalSoldFlats}</p>
          </div>
        </div>

        {/* Total Booking */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <CalendarCheck size={24} />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
              Total
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Booking</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalBookings}</p>
          </div>
        </div>

        {/* Secondary Metrics: Active Flats, Pending Bookings, Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Building size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Active Flats</p>
            <p className="text-xl font-bold text-slate-800">{stats.activeFlats}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Pending Bookings</p>
            <p className="text-xl font-bold text-slate-800">{stats.pendingBookings}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Customers</p>
            <p className="text-xl font-bold text-slate-800">{stats.totalCustomers}</p>
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-teal-600" /> Recent Bookings
        </h2>

        {recentBookings.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No recent bookings found
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div key={booking._id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{booking.flatTitle}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Customer: {booking.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">৳{booking.amount.toLocaleString()}</p>
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium inline-block mt-1">
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

