// app/vendor-dashboard/add-room/page.tsx

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { UploadCloud } from "lucide-react";
import { ROOM_CATEGORIES as ROOM_TYPES, AMENITIES } from "@/lib/constants";

function AddRoomFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [hotelId, setHotelId] = useState<string | null>(null);
  const [loadingHotel, setLoadingHotel] = useState(true);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [saving, setSaving] = useState(false);

  const [roomType, setRoomType] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [files, setFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null, null]);

  // Fetch hotel ID
  useEffect(() => {
    fetch("/api/vendor/my-hotel")
      .then((res) => res.json())
      .then((data) => setHotelId(data.hotel?._id || null))
      .catch(() => toast.error("Failed to load hotel info"))
      .finally(() => setLoadingHotel(false));
  }, []);

  useEffect(() => {
    if (!editId) return;

    setLoadingRoom(true);
    fetch(`/api/vendor/rooms/${editId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.room) {
          setRoomType(data.room.roomType || "");
          setPrice(data.room.pricePerNight || 0);
          setDiscountPercent(
            data.room.discountPercent !== undefined && data.room.discountPercent !== null
              ? Number(data.room.discountPercent)
              : 0
          );
          setAmenities(data.room.amenities || []);
          setPreviews([
            data.room.images?.[0] || null,
            data.room.images?.[1] || null,
            data.room.images?.[2] || null,
            data.room.images?.[3] || null,
          ]);
        }
      })
      .catch(() => toast.error("Failed to load room details"))
      .finally(() => setLoadingRoom(false));
  }, [editId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hotelId) {
      toast.error("Please register your hotel first");
      return;
    }
    if (!roomType || price <= 0) {
      toast.error("Select a Room Type and enter a valid Price");
      return;
    }

    setSaving(true);
    const fd = new FormData();
    fd.append("hotelId", hotelId);
    fd.append("roomType", roomType);
    fd.append("pricePerNight", String(price));
    fd.append("discountPercent", String(discountPercent));
    amenities.forEach((a) => fd.append("amenities", a));
    files.filter(Boolean).forEach((f) => fd.append("images", f as File));

    try {
      const url = editId ? `/api/vendor/rooms/${editId}` : "/api/vendor/rooms";
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Operation failed");
        return;
      }

      toast.success(editId ? "Room updated" : "Room added");
      router.push("/vendor-dashboard/list-room");
    } catch {
      toast.error("Server error");
    } finally {
      setSaving(false);
    }
  };

  if (loadingHotel || loadingRoom) {
    return <div className="text-dark-soft p-4">Loading room details...</div>;
  }

  if (!hotelId) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
        You need to register your hotel first before adding rooms. Go to{" "}
        <a href="/vendor-dashboard" className="font-semibold underline">
          Dashboard
        </a>{" "}
        to register.
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-dark">{editId ? "Edit Room" : "Add Room"}</h1>
      <p className="text-dark-soft text-sm mt-1 mb-8">
        Fill in the details carefully and accurate room details, pricing, and amenities, to enhance the user booking
        experience.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-semibold text-dark mb-2 block">Images</label>
          <div className="flex gap-3 flex-wrap">
            {[0, 1, 2, 3].map((i) => (
              <label
                key={i}
                className="w-24 h-24 border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 text-xs text-gray-400 cursor-pointer hover:border-primary transition overflow-hidden relative bg-gray-50"
              >
                {previews[i] ? (
                  <img src={previews[i]!} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
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

        <div className="flex flex-col sm:flex-row gap-6">
          <div>
            <label className="text-sm font-semibold text-dark mb-1 block">Room Type</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm min-w-55 cursor-pointer"
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
            <label className="text-sm font-semibold text-dark mb-1 block">
              Price <span className="text-dark-soft font-normal">/night</span>
            </label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm w-32"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-dark mb-1 block">
              Discount <span className="text-dark-soft font-normal">(%)</span>
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm w-28"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-dark mb-2 block">Amenities</label>
          <div className="space-y-2">
            {AMENITIES.map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm text-dark-soft cursor-pointer">
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

        <button
          type="submit"
          disabled={saving}
          className="btn-primary px-8 py-2 text-white text-sm rounded-lg cursor-pointer disabled:opacity-60"
        >
          {saving ? "Saving..." : editId ? "Update Room" : "Add Room"}
        </button>
      </form>
    </div>
  );
}

// Main Page Component 
export default function AddRoomPage() {
  return (
    <Suspense fallback={<div className="text-dark-soft p-4">Loading page...</div>}>
      <AddRoomFormContent />
    </Suspense>
  );
}

