// app/vendor-dashboard/list-room/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { Pencil, Trash2, BedDouble } from "lucide-react";

type Room = {
  _id: string;
  roomType: string;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
};

export default function ListRoomPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotelId, setHotelId] = useState<string | null>(null);

  const loadRooms = async () => {
    setLoading(true);
    const hotelRes = await fetch("/api/vendor/my-hotel");
    const hotelData = await hotelRes.json();

    if (!hotelData.hotel) {
      setHotelId(null);
      setLoading(false);
      return;
    }

    setHotelId(hotelData.hotel._id);

    const res = await fetch(`/api/vendor/rooms?hotelId=${hotelData.hotel._id}`);
    const data = await res.json();
    if (res.ok) setRooms(data.rooms);
    else toast.error(data.message);
    setLoading(false);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this room?")) return;

    const res = await fetch(`/api/vendor/rooms/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      toast.success("Room deleted");
      loadRooms();
    } else {
      toast.error(data.message);
    }
  };

  if (loading) return <div className="text-dark-soft">Loading...</div>;

  if (!hotelId) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
        You need to register your hotel first. Go to{" "}
        <a href="/vendor-dashboard" className="font-semibold underline">
          Dashboard
        </a>{" "}
        to register.
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-bold text-dark">List Room</h1>
      <p className="text-dark-soft text-sm mt-1 mb-6">All rooms registered under your hotel.</p>

      {rooms.length === 0 ? (
        <div className="bg-background-card rounded-xl2 border border-gray-100 p-10 text-center text-dark-soft">
          No rooms added yet.
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-background-card rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
            >
              <div className="w-20 h-20 rounded-lg bg-gray-100 relative shrink-0 overflow-hidden">
                {room.images[0] ? (
                  <Image src={room.images[0]} alt={room.roomType} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <BedDouble size={24} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-dark">{room.roomType}</h3>
                <p className="text-sm text-dark-soft">৳{room.pricePerNight} / night</p>
                <p className="text-xs text-dark-soft mt-0.5 truncate">
                  {room.amenities.join(", ") || "No amenities added"}
                </p>
                <span
                  className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    room.isAvailable ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {room.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => router.push(`/vendor-dashboard/add-room?id=${room._id}`)}
                  className="p-2 rounded-lg border border-gray-200 text-primary hover:bg-teal-50 transition cursor-pointer"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(room._id)}
                  className="p-2 rounded-lg border border-gray-200 text-red-600 hover:bg-red-50 transition cursor-pointer"
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

