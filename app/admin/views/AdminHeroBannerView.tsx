// app/admin/views/AdminHeroBannerView.tsx

"use client";

import { useEffect, useState } from "react";
import { Save, Upload } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

const EMPTY_FORM = {
  badgeText: "",
  headingText: "",
  highlightText: "",
  subtitleText: "",
  metricBadgeText: "",
  imageUrl: "",
};

type FormData = typeof EMPTY_FORM;

const inputCls =
  "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-teal-500";
const labelCls = "block text-xs font-semibold text-slate-700 mb-1";
const hintCls = "text-[11px] text-slate-400 mt-1";

export default function AdminHeroBannerView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  useEffect(() => {
    fetch("/api/admin/hero-banner")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.banner) {
          const b = data.banner;
          setFormData({
            badgeText: b.badgeText || "",
            headingText: b.headingText || "",
            highlightText: b.highlightText || "",
            subtitleText: b.subtitleText || "",
            metricBadgeText: b.metricBadgeText || "",
            imageUrl: b.imageUrl || "",
          });
        } else {
          toast.error(data.message || "Failed to load banner settings");
        }
      })
      .catch(() => toast.error("Failed to load banner settings"))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch("/api/admin/hero-banner", { method: "POST", body: uploadData });
      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
        toast.success("Image uploaded. Click Save to publish it.");
      } else {
        toast.error(data.message || "Failed to upload file");
      }
    } catch {
      toast.error("Error uploading image");
    } finally {
      setUploading(false);
      e.target.value = ""; // allow picking the same file again
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
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success("Hero banner saved successfully!");
      } else {
        toast.error(data.message || "Failed to update banner.");
      }
    } catch {
      toast.error("Failed to update banner.");
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
          Edit the homepage hero. Flat count and user rating in the bottom row are calculated
          automatically. Empty fields show the default text.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
        {/* Image */}
        <div>
          <label className={labelCls}>Banner Image</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {formData.imageUrl && (
              <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                <Image src={formData.imageUrl} alt="Hero Preview" fill className="object-cover" />
              </div>
            )}
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition">
              <Upload size={16} />
              {uploading ? "Uploading to Cloudinary..." : "Upload New Image"}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          <p className={hintCls}>
            Shown on the right side of the hero with a curved edge. Use a landscape photo of a
            building or home (max 5 MB).
          </p>
        </div>

        {/* Texts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Top Label</label>
            <input
              type="text"
              maxLength={80}
              value={formData.badgeText}
              onChange={set("badgeText")}
              placeholder="PREMIUM REAL ESTATE SOLUTIONS"
              className={inputCls}
            />
            <p className={hintCls}>Small capital text above the heading.</p>
          </div>

          <div>
            <label className={labelCls}>Verified Feature Title</label>
            <input
              type="text"
              maxLength={80}
              value={formData.metricBadgeText}
              onChange={set("metricBadgeText")}
              placeholder="Verified Listings"
              className={inputCls}
            />
            <p className={hintCls}>First item in the row of four under the hero.</p>
          </div>

          <div>
            <label className={labelCls}>Main Heading</label>
            <input
              type="text"
              maxLength={80}
              value={formData.headingText}
              onChange={set("headingText")}
              placeholder="Find Your Dream Property"
              className={inputCls}
            />
            <p className={hintCls}>Dark heading text.</p>
          </div>

          <div>
            <label className={labelCls}>Highlighted Line</label>
            <input
              type="text"
              maxLength={60}
              value={formData.highlightText}
              onChange={set("highlightText")}
              placeholder="in Maryland"
              className={inputCls}
            />
            <p className={hintCls}>Shown in gold on its own line below the heading.</p>
          </div>
        </div>

        <div>
          <label className={labelCls}>Subtitle Description</label>
          <textarea
            rows={3}
            maxLength={300}
            value={formData.subtitleText}
            onChange={set("subtitleText")}
            placeholder="Modern homes. Prime locations. Trusted guidance."
            className={inputCls}
          />
          <p className={hintCls}>{formData.subtitleText.length}/300</p>
        </div>

        {/* Live text preview */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#b8903a] uppercase">
            {formData.badgeText || "Top label"}
          </p>
          <p className="mt-1 text-xl font-extrabold text-[#17382f] leading-tight">
            {formData.headingText || "Main heading"}
            <span className="block text-[#b8903a]">{formData.highlightText || "Highlighted line"}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">{formData.subtitleText || "Subtitle description"}</p>
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? "Saving Changes..." : "Save Banner Settings"}
        </button>
      </form>
    </div>
  );
}

