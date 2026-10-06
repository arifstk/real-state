// app/vendor/flats/add/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, X, Building2 } from "lucide-react";
import { CITIES } from "@/lib/constants";

export default function AddFlatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    flatType: "",
    bedrooms: "",
    bathrooms: "",
    size: "",
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
  };

  const removeImage = (index: number) => {
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
    formData.append("bedrooms", form.bedrooms);
    formData.append("bathrooms", form.bathrooms);
    formData.append("size", form.size);
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
        router.push("/vendor/flats");
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
            <p className="text-xs text-slate-500">Fill out the details below to list your flat for customers</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Flat Title */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1 block">Flat Title</label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Modern Luxury Apartment in Gulshan"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-slate-800"
            />
          </div>

          {/* Grid Options: Flat Type, Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Flat Type</label>
              <select
                required
                value={form.flatType}
                onChange={(e) => setForm({ ...form, flatType: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-slate-800 cursor-pointer"
              >
                <option value="">Select Flat Type</option>
                <option value="1 Bed Apartment">1 Bed Apartment</option>
                <option value="2 Bed Apartment">2 Bed Apartment</option>
                <option value="3 Bed Apartment">3 Bed Apartment</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Studio Flat">Studio Flat</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Price (৳)</label>
              <input
                required
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. 25000"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Grid Options: Bedrooms, Bathrooms, Size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Bedrooms</label>
              <input
                required
                type="number"
                value={form.bedrooms}
                onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                placeholder="e.g. 3"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Bathrooms</label>
              <input
                required
                type="number"
                value={form.bathrooms}
                onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
                placeholder="e.g. 2"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Size (Sq Ft)</label>
              <input
                required
                type="text"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
                placeholder="e.g. 1250"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-slate-800"
              />
            </div>
          </div>

          {/* City & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">City</label>
              <select
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-slate-800 cursor-pointer"
              >
                <option value="">Select City</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Full Address</label>
              <input
                required
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. House 12, Road 5, Block C"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1 block">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Write short description about the flat facilities..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-slate-800"
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1 block">Flat Images</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl h-36 cursor-pointer hover:border-teal-600 transition bg-slate-50 relative">
              <div className="text-center text-slate-400 text-sm">
                <Upload size={24} className="mx-auto mb-1 text-slate-400" />
                <span>Click to upload flat images</span>
              </div>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
            </label>

            {/* Image Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative h-20 rounded-lg overflow-hidden border border-slate-200 group">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 py-3 text-white font-semibold rounded-xl cursor-pointer transition shadow-sm"
          >
            {loading ? "Adding Flat..." : "Add Flat"}
          </button>
        </form>
      </div>
    </div>
  );
}

