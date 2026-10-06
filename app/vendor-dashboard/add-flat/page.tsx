// app/vendor-dashboard/add-flat/page.tsx

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { UploadCloud } from "lucide-react";

function AddFlatFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(true);
  const [loadingFlat, setLoadingFlat] = useState(false);
  const [saving, setSaving] = useState(false);


  const [price, setPrice] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [sizeSqFt, setSizeSqFt] = useState<number>(1200);
  const [floorNo, setFloorNo] = useState<string>("3rd");
  const [facing, setFacing] = useState<string>("South");
  const [parking, setParking] = useState<boolean>(true);
  const [description, setDescription] = useState("");

  const [files, setFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null, null]);

  // Fetch property/ ID
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch("/api/vendor/flats");
        const data = await res.json();
        setPropertyId(data.property?._id || null);
      } catch {
        toast.error("Failed to load property info");
      } finally {
        setLoadingProperty(false);
      }
    };

    fetchProperty();
  }, []);

  useEffect(() => {
    if (!editId) return;

    const fetchFlatDetails = async () => {
      setLoadingFlat(true);
      try {
        const res = await fetch(`/api/vendor/rooms/${editId}`);
        const data = await res.json();
        const flatData = data.flat || data.room;
        if (flatData) {
          setPrice(flatData.pricePerNight || flatData.price || 0);
          setDiscountPercent(
            flatData.discountPercent !== undefined && flatData.discountPercent !== null
              ? Number(flatData.discountPercent)
              : 0
          );
          setBedrooms(flatData.bedrooms || 3);
          setBathrooms(flatData.bathrooms || 2);
          setSizeSqFt(flatData.sizeSqFt || 1200);
          setFloorNo(flatData.floorNo || "3rd");
          setFacing(flatData.facing || "South");
          setParking(flatData.parking ?? true);
          setDescription(flatData.description || "");
          setPreviews([
            flatData.images?.[0] || null,
            flatData.images?.[1] || null,
            flatData.images?.[2] || null,
            flatData.images?.[3] || null,
          ]);
        }
      } catch {
        toast.error("Failed to load flat details");
      } finally {
        setLoadingFlat(false);
      }
    };

    fetchFlatDetails();
  }, [editId]);

  const handleImageSlot = (index: number, file: File) => {
    const newFiles = [...files];
    newFiles[index] = file;
    setFiles(newFiles);

    const newPreviews = [...previews];
    newPreviews[index] = URL.createObjectURL(file);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!propertyId) {
      toast.error("Please register your property first");
      return;
    }
    if (price <= 0) {
      toast.error("Enter a valid Price");
      return;
    }

    setSaving(true);
    const fd = new FormData();
    fd.append("propertyId", propertyId);
    fd.append("price", String(price));
    fd.append("discountPercent", String(discountPercent));
    fd.append("bedrooms", String(bedrooms));
    fd.append("bathrooms", String(bathrooms));
    fd.append("sizeSqFt", String(sizeSqFt));
    fd.append("floorNo", floorNo);
    fd.append("facing", facing);
    fd.append("parking", String(parking));
    fd.append("description", description);

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

      toast.success(editId ? "Flat updated" : "Flat added");
      router.push("/vendor-dashboard/list-room");
    } catch {
      toast.error("Server error");
    } finally {
      setSaving(false);
    }
  };

  if (loadingProperty || loadingFlat) {
    return <div className="text-dark-soft p-4">Loading flat details...</div>;
  }

  if (!propertyId) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
        You need to register your property first before adding flats. Go to{" "}
        <a href="/vendor-dashboard" className="font-semibold underline">
          Dashboard
        </a>{" "}
        to register.
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold text-dark">{editId ? "Edit Flat" : "Add New Flat"}</h1>
      <p className="text-dark-soft text-sm mt-1 mb-8">
        Provide accurate real estate details like size, bedrooms, floor, pricing, and description for buyers.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-semibold text-dark mb-2 block">Flat Images (Max 4)</label>
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

        <div>
          <div>
            <label className="text-sm font-semibold text-dark mb-1 block">Total Price (BDT)</label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="e.g. 7500000"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-semibold text-dark mb-1 block">Bedrooms</label>
            <input
              type="number"
              min={1}
              value={bedrooms}
              onChange={(e) => setBedrooms(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-dark mb-1 block">Bathrooms</label>
            <input
              type="number"
              min={1}
              value={bathrooms}
              onChange={(e) => setBathrooms(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-dark mb-1 block">Size (Sq Ft)</label>
            <input
              type="number"
              min={100}
              value={sizeSqFt}
              onChange={(e) => setSizeSqFt(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-dark mb-1 block">Discount (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-dark mb-1 block">Floor No</label>
            <input
              type="text"
              value={floorNo}
              onChange={(e) => setFloorNo(e.target.value)}
              placeholder="e.g. 3rd, 5th"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-dark mb-1 block">Facing</label>
            <select
              value={facing}
              onChange={(e) => setFacing(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white cursor-pointer"
            >
              <option value="South">South</option>
              <option value="North">North</option>
              <option value="East">East</option>
              <option value="West">West</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-dark mb-1 block">Car Parking</label>
            <select
              value={parking ? "yes" : "no"}
              onChange={(e) => setParking(e.target.value === "yes")}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white cursor-pointer"
            >
              <option value="yes">Available</option>
              <option value="no">Not Available</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-dark mb-1 block">Flat Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write details about the flat, interior, lighting, and surroundings..."
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary px-8 py-2.5 text-white text-sm font-semibold rounded-lg cursor-pointer disabled:opacity-60"
        >
          {saving ? "Saving..." : editId ? "Update Flat" : "Add Flat"}
        </button>
      </form>
    </div>
  );
}

export default function AddFlatPage() {
  return (
    <Suspense fallback={<div className="text-dark-soft p-4">Loading page...</div>}>
      <AddFlatFormContent />
    </Suspense>
  );
}

