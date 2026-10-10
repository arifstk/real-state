// app/admin/views/FlatsView.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Home,
  RefreshCw,
  Trash2,
  Search,
  MapPin,
  ExternalLink,
  BadgeCheck,
  RotateCcw,
  BedDouble,
  Bath,
  Ruler,
  Layers,
  Phone,
  CalendarDays,
} from "lucide-react";

interface Flat {
  _id: string;
  title: string;
  flatType: string;
  city: string;
  address: string;
  price: number;
  discountPercent?: number;
  images?: string[];
  isAvailable?: boolean;
  isSold?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  sizeSqFt?: number;
  floorNo?: string;
  vendor?: { _id: string; name: string; email?: string; mobile?: string; image?: string } | null;
  createdAt?: string;
}

type Filter = "all" | "available" | "sold";

const dollar = (n: number) => `$${Number(n || 0).toLocaleString("en-US")}`;

const effectivePrice = (f: Flat) =>
  f.discountPercent ? f.price * (1 - f.discountPercent / 100) : f.price;

function statusOf(f: Flat) {
  if (f.isSold) return { label: "Sold", cls: "bg-rose-600 text-white" };
  if (f.isAvailable === false) return { label: "Unavailable", cls: "bg-slate-600 text-white" };
  return { label: "Available", cls: "bg-emerald-500 text-white" };
}

export default function AdminFlatsView() {
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    let isMounted = true;

    const loadFlats = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/flats");
        const data = await res.json();
        if (isMounted) {
          if (res.ok) {
            setFlats(Array.isArray(data) ? data : data.flats || []);
          } else {
            toast.error(data.message || "Failed to load flats");
            setFlats([]);
          }
        }
      } catch {
        if (isMounted) {
          toast.error("Something went wrong");
          setFlats([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFlats();
    return () => {
      isMounted = false;
    };
  }, []);

  const counts = useMemo(
    () => ({
      all: flats.length,
      available: flats.filter((f) => !f.isSold).length,
      sold: flats.filter((f) => f.isSold).length,
    }),
    [flats],
  );

  const visibleFlats = useMemo(() => {
    const q = query.trim().toLowerCase();
    return flats.filter((f) => {
      if (filter === "available" && f.isSold) return false;
      if (filter === "sold" && !f.isSold) return false;
      if (!q) return true;
      return [f.title, f.flatType, f.city, f.address, f.vendor?.name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [flats, query, filter]);

  const toggleSold = async (flat: Flat) => {
    const makeSold = !flat.isSold;
    const message = makeSold
      ? `Mark "${flat.title}" as SOLD?`
      : `Reopen "${flat.title}" for sale?`;
    if (!confirm(message)) return;

    setBusyId(flat._id);
    try {
      const res = await fetch(`/api/admin/flats/${flat._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSold: makeSold }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update flat");

      toast.success(makeSold ? "Flat marked as SOLD" : "Flat reopened for sale");
      setFlats((prev) =>
        prev.map((f) =>
          f._id === flat._id ? { ...f, isSold: makeSold, isAvailable: !makeSold } : f,
        ),
      );
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setBusyId(null);
    }
  };

  const deleteFlat = async (flat: Flat) => {
    if (!confirm(`Delete "${flat.title}"? This cannot be undone.`)) return;

    setBusyId(flat._id);
    try {
      const res = await fetch(`/api/admin/flats/${flat._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete flat");

      toast.success("Flat deleted");
      setFlats((prev) => prev.filter((f) => f._id !== flat._id));
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <RefreshCw size={24} className="animate-spin text-teal-600" />
        <p className="text-xs text-slate-400 font-medium">Loading flats...</p>
      </div>
    );
  }

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "available", label: "For Sale" },
    { key: "sold", label: "Sold" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Flats Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review every flat listed on the platform, mark flats as sold, or remove listings.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, city or seller..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${filter === key
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
          >
            {label} <span className="opacity-70">({counts[key]})</span>
          </button>
        ))}
      </div>

      {visibleFlats.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          No flats found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {visibleFlats.map((flat) => {
            const status = statusOf(flat);
            const busy = busyId === flat._id;
            const vendorName = flat.vendor?.name || "Unknown seller";
            const specs = [
              { icon: BedDouble, value: flat.bedrooms, label: "Beds" },
              { icon: Bath, value: flat.bathrooms, label: "Baths" },
              { icon: Ruler, value: flat.sizeSqFt ? `${flat.sizeSqFt} sq ft` : null, label: "Size" },
              { icon: Layers, value: flat.floorNo ? `Floor ${flat.floorNo}` : null, label: "Floor" },
            ].filter((s) => s.value !== null && s.value !== undefined && s.value !== "");

            return (
              <div
                key={flat._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative h-44 bg-slate-100 flex items-center justify-center">
                  {flat.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={flat.images[0]}
                      alt={flat.title}
                      className={`w-full h-full object-cover ${flat.isSold ? "grayscale" : ""}`}
                    />
                  ) : (
                    <Home size={32} className="text-slate-300" />
                  )}

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ${status.cls}`}
                    >
                      {status.label}
                    </span>
                    {!!flat.discountPercent && !flat.isSold && (
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-rose-500/90 text-white">
                        {flat.discountPercent}% OFF
                      </span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 space-y-3">
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-teal-600 uppercase tracking-wide">
                      {flat.flatType}
                    </p>
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{flat.title}</h4>
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin size={12} className="shrink-0 text-teal-500" />
                      <span className="truncate">
                        {[flat.address, flat.city].filter(Boolean).join(", ")}
                      </span>
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-slate-800">
                      {dollar(effectivePrice(flat))}
                    </span>
                    {!!flat.discountPercent && (
                      <span className="text-xs text-slate-400 line-through">{dollar(flat.price)}</span>
                    )}
                  </div>

                  {/* Specs */}
                  {specs.length > 0 && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
                      {specs.map(({ icon: Icon, value, label }) => (
                        <span key={label} className="flex items-center gap-1" title={label}>
                          <Icon size={13} className="text-slate-400" /> {value}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Vendor */}
                  <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100">
                    {flat.vendor?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={flat.vendor.image}
                        alt={vendorName}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {vendorName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{vendorName}</p>
                      <p className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                        {flat.vendor?.mobile ? (
                          <>
                            <Phone size={10} /> {flat.vendor.mobile}
                          </>
                        ) : (
                          flat.vendor?.email || "Seller"
                        )}
                      </p>
                    </div>
                  </div>

                  {flat.createdAt && (
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <CalendarDays size={12} /> Listed{" "}
                      {new Date(flat.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="px-3 py-2.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <button
                    onClick={() => toggleSold(flat)}
                    disabled={busy}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 ${flat.isSold
                        ? "text-slate-600 hover:bg-slate-200"
                        : "text-emerald-700 hover:bg-emerald-100"
                      }`}
                  >
                    {flat.isSold ? <RotateCcw size={14} /> : <BadgeCheck size={14} />}
                    {flat.isSold ? "Reopen" : "Mark Sold"}
                  </button>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/flats/${flat._id}`}
                      target="_blank"
                      className="p-2 text-slate-500 hover:bg-slate-200 rounded-xl transition-all"
                      title="View public page"
                    >
                      <ExternalLink size={15} />
                    </Link>
                    <button
                      onClick={() => deleteFlat(flat)}
                      disabled={busy}
                      className="p-2 text-rose-500 hover:bg-rose-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                      title="Delete Flat"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

