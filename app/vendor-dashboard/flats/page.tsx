// app/vendor-dashboard/flats/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { Pencil, Trash2, Home, RotateCcw } from "lucide-react";

type Flat = {
  _id: string;
  title: string;
  price: number;
  city: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  sizeSqFt: number;
  images: string[];
  isAvailable: boolean;
  isSold?: boolean;
};

export default function VendorFlatsPage() {
  const router = useRouter();
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadFlats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/flats");
      const data = await res.json();
      if (res.ok) {
        setFlats(data.flats || []);
      } else {
        toast.error(data.message || "Failed to load flats");
      }
    } catch {
      toast.error("Server error while loading flats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadFlats = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/vendor/flats");
        const data = await res.json();
        if (res.ok) {
          setFlats(data.flats || []);
        } else {
          toast.error(data.message || "Failed to load flats");
        }
      } catch {
        toast.error("Server error while loading flats");
      } finally {
        setLoading(false);
      }
    };

    loadFlats();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this flat?")) return;

    try {
      const res = await fetch(`/api/vendor/flats/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Flat deleted successfully");
        loadFlats();
      } else {
        toast.error(data.message || "Failed to delete flat");
      }
    } catch {
      toast.error("Server error");
    }
  };

  const handleReopen = async (flat: Flat) => {
    if (
      !confirm(
        `Reopen "${flat.title}" for sale?\n\nThe SOLD label will be removed and the earlier completed deal will be cancelled, so it no longer counts in your sales and earnings.`,
      )
    )
      return;

    setBusyId(flat._id);
    try {
      const res = await fetch(`/api/vendor/flats/${flat._id}/reopen`, { method: "PATCH" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to reopen flat");

      toast.success("Flat reopened for sale");
      setFlats((prev) =>
        prev.map((f) => (f._id === flat._id ? { ...f, isSold: false, isAvailable: true } : f)),
      );
    } catch (err: any) {
      toast.error(err.message || "Server error");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="text-slate-500 p-6">Loading flats...</div>;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Flats</h1>
          <p className="text-slate-500 text-sm mt-1">All flats registered under your account.</p>
        </div>
        <button
          onClick={() => router.push("/vendor-dashboard/flats/add")}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
        >
          Add New Flat
        </button>
      </div>

      {flats.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500">
          No flats added yet. Click &quot;Add New Flat&quot; to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {flats.map((flat) => (
            <div
              key={flat._id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4"
            >
              <div className="w-20 h-20 rounded-lg bg-slate-100 relative shrink-0 overflow-hidden">
                {flat.images?.[0] ? (
                  <Image src={flat.images[0]} alt={flat.title} fill className={`object-cover ${flat.isSold ? "grayscale" : ""}`} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Home size={24} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 truncate">{flat.title}</h3>
                <p className="text-sm text-teal-600 font-medium">${flat.price.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {flat.bedrooms} Beds • {flat.bathrooms} Baths • {flat.sizeSqFt} sqft • {flat.city}
                </p>
                <span
                  className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${flat.isSold
                      ? "bg-rose-50 text-rose-700"
                      : flat.isAvailable
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                >
                  {flat.isSold ? "Sold" : flat.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {flat.isSold && (
                  <button
                    onClick={() => handleReopen(flat)}
                    disabled={busyId === flat._id}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                    title="Reopen for sale"
                  >
                    <RotateCcw size={14} /> Reopen
                  </button>
                )}
                <button
                  onClick={() => router.push(`/vendor-dashboard/flats/edit/${flat._id}`)}
                  className="p-2 rounded-lg border border-slate-200 text-teal-600 hover:bg-teal-50 transition cursor-pointer"
                  title="Edit Flat"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(flat._id)}
                  className="p-2 rounded-lg border border-slate-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
                  title="Delete Flat"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

