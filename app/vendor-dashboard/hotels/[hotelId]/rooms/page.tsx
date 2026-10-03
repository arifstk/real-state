// app/vendor-dashboard/hotels/[hotelId]/rooms/page.tsx

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { UploadCloud, Pencil, Trash2, ArrowLeft, BedDouble } from "lucide-react";
import { useParams } from "next/navigation";

const ROOM_TYPES = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite"];
const AMENITIES = ["Free WiFi", "Free Breakfast", "Room Service", "Mountain View", "Pool Access"];

type Room = {
  _id: string;
  roomType: string;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
};

type Hotel = { _id: string; name: string };

export default function VendorRoomsPage() {
  const params = useParams();
  const hotelId = params?.hotelId as string;
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [roomType, setRoomType] = useState("");
  const [price, setPrice] = useState(0);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null, null]);

  const loadData = async () => {
    setLoading(true);
    const res = await fetch(`/api/vendor/rooms?hotelId=${hotelId}`);
    const data = await res.json();
    if (res.ok) {
      setHotel(data.hotel);
      setRooms(data.rooms);
    } else {
      toast.error(data.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [hotelId]);

  const resetForm = () => {
    setEditingId(null);
    setRoomType("");
    setPrice(0);
    setAmenities([]);
    setFiles([]);
    setPreviews([null, null, null, null]);
  };

  const handleImageSlot = (index: number, file: File) => {
    const newFiles = [...files];
    newFiles[index] = file;
    setFiles(newFiles);

    const newPreviews = [...previews];
    newPreviews[index] = URL.createObjectURL(file);
    setPreviews(newPreviews);
  };

  const toggleAmenity = (a: string) => {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  const startEdit = (room: Room) => {
    setEditingId(room._id);
    setRoomType(room.roomType);
    setPrice(room.pricePerNight);
    setAmenities(room.amenities);
    setFiles([]);
    setPreviews([room.images[0] || null, room.images[1] || null, room.images[2] || null, room.images[3] || null]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomType || price <= 0) {
      toast.error("Select Correct Room Type & Price");
      return;
    }

    setSaving(true);
    const fd = new FormData();
    fd.append("hotelId", hotelId);
    fd.append("roomType", roomType);
    fd.append("pricePerNight", String(price));
    amenities.forEach((a) => fd.append("amenities", a));
    files.filter(Boolean).forEach((f) => fd.append("images", f));

    try {
      const url = editingId ? `/api/vendor/rooms/${editingId}` : "/api/vendor/rooms";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success(editingId ? "Room Updated" : "Room added");
      resetForm();
      loadData();
    } catch {
      toast.error("Server Error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Want delete?")) return;

    const res = await fetch(`/api/vendor/rooms/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      toast.success("Room Deleted");
      loadData();
    } else {
      toast.error(data.message);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <Link href="/vendor-dashboard/hotels" className="flex items-center gap-1.5 text-primary font-medium text-sm mb-4">
          <ArrowLeft size={16} /> Back to Hotels
        </Link>

        <h1 className="text-2xl font-bold text-dark mb-1">{hotel?.name || "Hotel"}</h1>
        <p className="text-dark-soft text-sm mb-6">
          Fill in the details carefully and accurate room details, pricing, and amenities.
        </p>

        {/* Add / Edit Room */}
        <form
          onSubmit={handleSubmit}
          className="bg-background-card rounded-xl2 border border-gray-100 shadow-sm p-6 mb-8 space-y-5"
        >
          <h2 className="font-bold text-dark">{editingId ? "Edit Room" : "Add Room"}</h2>

          <div>
            <label className="text-sm font-medium text-dark-soft mb-2 block">Images</label>
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <label
                  key={i}
                  className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 text-xs text-gray-400 cursor-pointer hover:border-primary transition overflow-hidden relative"
                >
                  {previews[i] ? (
                    <img src={previews[i]!} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <UploadCloud size={20} />
                      Upload
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageSlot(i, e.target.files[0])}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-dark-soft mb-1 block">Room Type</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Room Type</option>
                {ROOM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-dark-soft mb-1 block">Price /night</label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-dark-soft mb-2 block">Amenities</label>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {AMENITIES.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm text-dark cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amenities.includes(a)}
                    onChange={() => toggleAmenity(a)}
                    className="accent-primary w-4 h-4"
                  />
                  {a}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-6 py-2.5 text-white font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Update Room" : "Add Room"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 rounded-lg border border-gray-200 text-dark-soft font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* List Room */}
        <h2 className="font-bold text-dark mb-3">List Room</h2>
        {loading ? (
          <p className="text-dark-soft">Loading...</p>
        ) : rooms.length === 0 ? (
          <div className="bg-background-card rounded-xl2 border border-gray-100 p-8 text-center text-dark-soft">
            Not added any room
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="bg-background-card rounded-xl2 border border-gray-100 shadow-sm p-4 flex items-center gap-4"
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
                  <p className="text-xs text-dark-soft mt-0.5 truncate">{room.amenities.join(", ") || "Not have amenities"}</p>
                  <span
                    className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${room.isAvailable ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}
                  >
                    {room.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(room)}
                    className="p-2 rounded-lg border border-gray-200 text-primary hover:bg-teal-50 transition"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(room._id)}
                    className="p-2 rounded-lg border border-gray-200 text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

