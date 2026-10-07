// app/vendor-dashboard/flats/add/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, X, Building2 } from "lucide-react";
import { CITIES } from "@/lib/constants";

const FLAT_TYPES = [
  "1 Bed Apartment",
  "2 Bed Apartment",
  "3 Bed Apartment",
  "Penthouse",
  "Studio Flat",
];

const inputClass =
  "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-slate-800";
const labelClass = "text-sm font-semibold text-slate-700 mb-1 block";

export default function AddFlatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    flatType: "",
    discountPercent: "0",
    bedrooms: "",
    bathrooms: "",
    sizeSqFt: "",
    city: "",
    address: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("flatType", form.flatType);
    formData.append("discountPercent", form.discountPercent || "0");
    formData.append("bedrooms", form.bedrooms);
    formData.append("bathrooms", form.bathrooms);
    formData.append("sizeSqFt", form.sizeSqFt);
    formData.append("city", form.city);
    formData.append("address", form.address);

    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await fetch("/api/vendor/flats", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Flat added successfully!");
        router.push("/vendor-dashboard/flats");
        router.refresh();
      } else {
        toast.error(data.message || "Failed to add flat");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Add New Flat</h1>
            <p className="text-xs text-slate-500">
              Fill out the details below to list your flat for customers
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className={labelClass}>Flat Title</label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Modern Luxury Apartment in Gulshan"
              className={inputClass}
            />
          </div>

          {/* Flat Type & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Flat Type</label>
              <select
                required
                value={form.flatType}
                onChange={(e) => setForm({ ...form, flatType: e.target.value })}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">Select Flat Type</option>
                {FLAT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Price (৳)</label>
              <input
                required
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. 3400000"
                className={inputClass}
              />
            </div>
          </div>

          {/* Bedrooms, Bathrooms, Size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Bedrooms</label>
              <input
                required
                type="number"
                min={0}
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                placeholder="e.g. 3"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Bathrooms</label>
              <input
                required
                type="number"
                min={0}
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                placeholder="e.g. 2"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Size (Sq Ft)</label>
              <input
                required
                type="number"
                min={0}
                value={form.sizeSqFt}
                onChange={(e) => setForm({ ...form, sizeSqFt: e.target.value })}
                placeholder="e.g. 1250"
                className={inputClass}
              />
            </div>
          </div>

          {/* Discount, City, Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Discount (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.discountPercent}
                onChange={(e) =>
                  setForm({ ...form, discountPercent: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>City</label>
              <select
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">Select City</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Full Address</label>
              <input
                required
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. House 12, Road 5"
                className={inputClass}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Write a short description about the flat facilities..."
              className={inputClass}
            />
          </div>

          {/* Images */}
          <div>
            <label className={labelClass}>Flat Images</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl h-36 cursor-pointer hover:border-teal-600 transition bg-slate-50">
              <div className="text-center text-slate-400 text-sm">
                <Upload size={24} className="mx-auto mb-1 text-slate-400" />
                <span>Click to upload flat images</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {previews.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative h-20 rounded-lg overflow-hidden border border-slate-200"
                  >
                    <img
                      src={src}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed py-3 text-white font-semibold rounded-xl cursor-pointer transition shadow-sm"
          >
            {loading ? "Adding Flat..." : "Add Flat"}
          </button>
        </form>
      </div>
    </div>
  );
}

