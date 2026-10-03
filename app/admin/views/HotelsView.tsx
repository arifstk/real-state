"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Hotel = {
  _id: string;
  name: string;
  city: string;
  phone: string;
  owner?: { name: string; email: string };
};

export default function AdminHotelsView() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHotels = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/hotels");
    const data = await res.json();
    if (res.ok) setHotels(data.hotels);
    else toast.error(data.message);
    setLoading(false);
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const deleteHotel = async (id: string) => {
    if (!confirm("Are you sure? Deleting this hotel will permanently delete all associated rooms!")) return;
    const res = await fetch(`/api/admin/hotels/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Hotel and associated rooms deleted");
      loadHotels();
    } else {
      toast.error("Failed to delete hotel");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800">Hotel List</h2>
      <p className="text-xs text-slate-500 mt-1 mb-6">Manage all vendor registered properties.</p>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-scroll md:overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
            <tr>
              <th className="p-4">Hotel Name</th>
              <th className="p-4">City</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Owner</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">Loading hotels...</td>
              </tr>
            ) : (
              hotels.map((h) => (
                <tr key={h._id} className="hover:bg-slate-50/50">
                  <td className="p-4 text-xs font-semibold text-slate-800">{h.name}</td>
                  <td className="p-4 text-xs text-slate-600">{h.city}</td>
                  <td className="p-4 text-xs text-slate-500">{h.phone}</td>
                  <td className="p-4 text-xs text-slate-600">{h.owner?.name || "Unknown"}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => deleteHotel(h._id)} className="text-xs text-red-600 hover:underline font-medium cursor-pointer">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

