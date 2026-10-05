// app/admin/views/AdminSettingsView.tsx

"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Mail, Phone, MapPin, Share2, Save, RefreshCw } from "lucide-react";

export default function AdminSettingsView() {
  const [form, setForm] = useState({
    email: "",
    phone: "",
    address: "",
    twitterUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/system-settings");
      if (!res.ok) throw new Error("Failed to fetch API");

      const data = await res.json();
      if (data.success && data.settings) {
        setForm({
          email: data.settings.email || "support@realestate.com",
          phone: data.settings.phone || "+880 1234 567890",
          address: data.settings.address || "Gulshan Avenue, Dhaka, Bangladesh",
          twitterUrl: data.settings.twitterUrl || "https://x.com",
          githubUrl: data.settings.githubUrl || "https://github.com",
          linkedinUrl: data.settings.linkedinUrl || "https://linkedin.com",
          instagramUrl: data.settings.instagramUrl || "https://instagram.com",
        });
      }
    } catch (err) {
      console.error("Fetch Settings Error:", err);
      toast.error("Could not load settings from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/system-settings");
        if (!res.ok) throw new Error("Failed to fetch API");

        const data = await res.json();
        if (isMounted && data.success && data.settings) {
          setForm({
            email: data.settings.email || "support@realestate.com",
            phone: data.settings.phone || "+880 1234 567890",
            address: data.settings.address || "Gulshan Avenue, Dhaka, Bangladesh",
            twitterUrl: data.settings.twitterUrl || "https://x.com",
            githubUrl: data.settings.githubUrl || "https://github.com",
            linkedinUrl: data.settings.linkedinUrl || "https://linkedin.com",
            instagramUrl: data.settings.instagramUrl || "https://instagram.com",
          });
        }
      } catch (err) {
        console.error("Fetch Settings Error:", err);
        if (isMounted) toast.error("Could not load settings from server");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/system-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings updated successfully!");
      } else {
        toast.error(data.error || "Failed to update settings");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <RefreshCw size={24} className="animate-spin text-teal-600" />
        <p className="text-xs text-slate-400 font-medium">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">System Settings</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage global contact details and social media links used across your real estate platform.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchSettings}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
          title="Reload Settings"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Share2 size={16} className="text-teal-600" /> Social Media URLs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">X (Twitter) URL</label>
              <input type="text" value={form.twitterUrl} onChange={(e) => setForm({ ...form, twitterUrl: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">GitHub URL</label>
              <input type="text" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">LinkedIn URL</label>
              <input type="text" value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Instagram URL</label>
              <input type="text" value={form.instagramUrl} onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Mail size={16} className="text-teal-600" /> Agency Contact Info
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                <MapPin size={13} /> Office Address
              </label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                  <Phone size={13} /> Phone Number
                </label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                  <Mail size={13} /> Email Address
                </label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <Save size={15} />
          {saving ? "Saving Changes..." : "Save System Settings"}
        </button>
      </form>
    </div>
  );
}

