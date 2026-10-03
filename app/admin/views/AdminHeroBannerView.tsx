
"use client";

import { useEffect, useState } from "react";
import { Save, Upload } from "lucide-react";
import Image from "next/image";

export default function AdminHeroBannerView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    badgeText: "",
    headingText: "",
    highlightText: "",
    subtitleText: "",
    imageUrl: "",
    roomsBtnText: "",
    hotelsBtnText: "",
    metricBadgeText: "",
  });

  useEffect(() => {
    fetch("/api/admin/hero-banner")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.banner) {
          setFormData(data.banner);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/admin/hero-banner", {
        method: "POST",
        body: uploadData,
      });
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      } else {
        alert(data.message || "Failed to upload file");
      }
    } catch (err) {
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/hero-banner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) alert("Hero banner saved successfully!");
    } catch (err) {
      alert("Failed to update banner.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-400">Loading banner settings...</p>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Hero Banner Management</h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload banner image and customize homepage texts. Total stays and ratings calculate automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
        {/* Banner Image Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Banner Background Image</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {formData.imageUrl && (
              <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                <Image
                  src={formData.imageUrl}
                  alt="Hero Preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition">
              <Upload size={16} />
              {uploading ? "Uploading to Cloudinary..." : "Upload New Image"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Text</label>
            <input
              type="text"
              value={formData.badgeText}
              onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Verified Badge Subtitle</label>
            <input
              type="text"
              value={formData.metricBadgeText}
              onChange={(e) => setFormData({ ...formData, metricBadgeText: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Main Heading</label>
            <input
              type="text"
              value={formData.headingText}
              onChange={(e) => setFormData({ ...formData, headingText: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Highlighted Word</label>
            <input
              type="text"
              value={formData.highlightText}
              onChange={(e) => setFormData({ ...formData, highlightText: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle Description</label>
          <textarea
            rows={3}
            value={formData.subtitleText}
            onChange={(e) => setFormData({ ...formData, subtitleText: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rooms CTA Button Text</label>
            <input
              type="text"
              value={formData.roomsBtnText}
              onChange={(e) => setFormData({ ...formData, roomsBtnText: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hotels CTA Button Text</label>
            <input
              type="text"
              value={formData.hotelsBtnText}
              onChange={(e) => setFormData({ ...formData, hotelsBtnText: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-teal-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition cursor-pointer"
        >
          <Save size={16} />
          {saving ? "Saving Changes..." : "Save Banner Settings"}
        </button>
      </form>
    </div>
  );
}

