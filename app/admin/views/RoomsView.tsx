"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Room = {
  _id: string;
  roomType: string;
  pricePerNight: number;
  hotel?: { name: string };
};

export default function AdminRoomsView() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/rooms");
    const data = await res.json();
    if (res.ok) setRooms(data.rooms);
    else toast.error(data.message);
    setLoading(false);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const deleteRoom = async (id: string) => {
    if (!confirm("Delete this room entry?")) return;
    const res = await fetch(`/api/admin/rooms/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Room deleted");
      loadRooms();
    } else {
      toast.error("Failed to delete room");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800">Room List</h2>
      <p className="text-xs text-slate-500 mt-1 mb-6">Overview of all individual available rooms.</p>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-scroll md:overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="p-4">Room Type</th>
              <th className="p-4">Hotel</th>
              <th className="p-4">Price / Night</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-400">Loading rooms...</td>
              </tr>
            ) : (
              rooms.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/50">
                  <td className="p-4 text-xs font-semibold text-slate-800">{r.roomType}</td>
                  <td className="p-4 text-xs text-slate-600">{r.hotel?.name || "Unlinked"}</td>
                  <td className="p-4 text-xs font-medium text-slate-700">৳{r.pricePerNight}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => deleteRoom(r._id)} className="text-xs text-red-600 hover:underline font-medium cursor-pointer">
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

