// app/vendor-dashboard/flats/edit/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, X, Building2, Loader2 } from "lucide-react";
import { CITIES } from "@/lib/constants";

export default function EditFlatPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    flatType: "",
    discountPercent: "",
    city: "",
    address: "",
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchFlatDetails = async () => {
      try {
        const res = await fetch(`/api/vendor/flats/${id}`);
        const data = await res.json();

        if (res.ok && data.flat) {
          const f = data.flat;
          setForm({
            title: f.title || "",
            description: f.description || "",
            price: f.price ? String(f.price) : "",
            flatType: f.flatType || "",
            discountPercent: f.discountPercent !== undefined && f.discountPercent !== null ? String(f.discountPercent) : "0",
            city: f.city || "",
            address: f.address || "",
          });
          setExistingImages(f.images || []);
        } else {
          toast.error(data.message || "Failed to load flat details");
        }
      } catch (error) {
        toast.error("Something went wrong loading flat data");
      } finally {
        setFetching(false);
      }
    };

    fetchFlatDetails();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
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
    formData.append("discountPercent", form.discountPercent);
    formData.append("city", form.city);
    formData.append("address", form.address);

    existingImages.forEach((img) => {
      formData.append("existingImages", img);
    });

    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await fetch(`/api/vendor/flats/${id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Flat updated successfully!");
        router.push("/vendor-dashboard/flats");
        router.refresh();
      } else {
        toast.error(data.message || "Failed to update flat");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500 gap-2">
        <Loader2 className="animate-spin" size={24} /> Loading flat data...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Edit Flat Details</h1>
            <p className="text-xs text-slate-500">Update your flat information below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1 block">Flat Title</label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-slate-800"
            />
          </div>

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
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Discount (%)</label>
              <input
                type="number"
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-slate-800"
              />
            </div>

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

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Full Address</label>
              <input
                required
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1 block">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1 block">Flat Images</label>

            {existingImages.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-slate-400 mb-1">Existing Images:</p>
                <div className="grid grid-cols-4 gap-3">
                  {existingImages.map((src, idx) => (
                    <div key={idx} className="relative h-20 rounded-lg overflow-hidden border border-slate-200">
                      <img src={src} alt="Existing" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl h-32 cursor-pointer hover:border-teal-600 transition bg-slate-50">
              <div className="text-center text-slate-400 text-sm">
                <Upload size={22} className="mx-auto mb-1 text-slate-400" />
                <span>Upload New Images</span>
              </div>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
            </label>

            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative h-20 rounded-lg overflow-hidden border border-slate-200">
                    <img src={src} alt="New Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 py-3 text-white font-semibold rounded-xl cursor-pointer transition shadow-sm"
          >
            {loading ? "Updating Flat..." : "Update Flat"}
          </button>
        </form>
      </div>
    </div>
  );
}

