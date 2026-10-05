// app/admin/views/FlatsView.tsx

"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Home, RefreshCw, Trash2 } from "lucide-react";

interface Flat {
  _id: string;
  flatNumber: string;
  rent: number;
  status: string;
}

export default function AdminFlatsView() {
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadFlats = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/flats");
        const data = await res.json();
        if (isMounted) {
          if (res.ok) {
            const flatsList = Array.isArray(data) ? data : data.flats || data.rooms || [];
            setFlats(flatsList);
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

  const deleteFlat = async (id: string) => {
    if (!confirm("Delete this flat entry?")) return;
    try {
      const res = await fetch(`/api/admin/flats/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Flat deleted");
        setFlats((prev) => prev.filter((f) => f._id !== id));
      } else {
        toast.error("Failed to delete flat");
      }
    } catch {
      toast.error("Something went wrong");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Flats Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage all individual flats and units.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {flats.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No flats found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {flats.map((flat) => (
              <div key={flat._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                    <Home size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Flat: {flat.flatNumber}</h4>
                    <p className="text-[11px] text-slate-400">Rent: ${flat.rent} • Status: {flat.status}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteFlat(flat._id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                  title="Delete Flat"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

