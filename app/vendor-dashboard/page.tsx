// app/vendor-dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CircleDollarSign, DoorOpen, ConciergeBell, ShoppingBag, Pencil, Upload, X, Building2, Info } from "lucide-react";
import Image from "next/image";
import { CITIES } from "@/lib/constants";

type PropertyBuilding = {
  _id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  images: string[];
};

type Stats = {
  totalRevenue: number;
  totalProperties: number;
  totalServings: number;
  totalOrders: number;
};

export default function VendorDashboard() {
  const [propertyBuilding, setPropertyBuilding] = useState<PropertyBuilding | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalProperties: 0,
    totalServings: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/vendor/my-property");
        const data = await res.json();
        
        if (res.ok && data.property) {
          setPropertyBuilding(data.property);
          setStats(data.stats || { totalRevenue: 0, totalProperties: 0, totalServings: 0, totalOrders: 0 });
          setForm({
            name: data.property.name || "",
            phone: data.property.phone || "",
            address: data.property.address || "",
            city: data.property.city || "",
          });
          setPreview(data.property.images?.[0] || null);
        } else {
          setPropertyBuilding(null);
        }
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleRegisterOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("phone", form.phone);
    fd.append("address", form.address);
    fd.append("city", form.city);
    if (file) fd.append("images", file);

    try {
      const url = propertyBuilding ? `/api/vendor/properties/${propertyBuilding._id}` : "/api/vendor/properties";
      const method = propertyBuilding ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });
      const data = await res.json();

      if (res.ok) {
        toast.success(propertyBuilding ? "Property updated successfully!" : "Property registered successfully!");
        setShowEdit(false);
        setFile(null);
        window.location.reload();
      } else {
        toast.error(data.message || "Failed to save property");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-dark-soft p-6">Loading dashboard...</div>;

  if (!propertyBuilding) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
          <Info size={20} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Property Registration Required</p>
            <p className="mt-0.5 text-amber-700">
              You haven&apos;t registered any property yet. Please fill out the form below to set up your property and start adding flats.
            </p>
          </div>
        </div>

        <div className="bg-background-card p-8 rounded-xl border border-gray-100 shadow-sm">
          <h1 className="text-2xl font-bold text-dark mb-2">Register Your Property</h1>
          <p className="text-dark-soft text-sm mb-6">You can register only 1 property building under your vendor account.</p>

          <form onSubmit={handleRegisterOrUpdate} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-dark-soft mb-1 block">Property Image</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg h-36 cursor-pointer hover:border-primary transition relative overflow-hidden bg-gray-50">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-dark-soft text-sm">
                    <Upload size={24} className="mx-auto mb-1 text-gray-400" />
                    <span>Upload Cover Image</span>
                  </div>
                )}
                <input type="file" accept="image/*" required className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            <div>
              <label className="text-sm font-medium text-dark-soft mb-1 block">Property Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Grand Vista Apartments"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white text-dark"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-dark-soft mb-1 block">Phone</label>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="017XXXXXXXX"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white text-dark"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-dark-soft mb-1 block">Address</label>
              <textarea
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Full Address"
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white text-dark"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-dark-soft mb-1 block">City</label>
              <select
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-dark text-sm"
              >
                <option value="">Select City</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 text-white font-semibold rounded-lg cursor-pointer">
              {saving ? "Registering..." : "Register Property"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-lg font-bold text-dark">Dashboard Overview</h1>
        <p className="text-xs text-dark-soft mt-0.5">Real-time statistics for your real estate business</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-background-card p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CircleDollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-dark-soft uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-bold text-dark mt-1">${stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-background-card p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="p-3 bg-blue-50 text-primary rounded-xl">
            <DoorOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-dark-soft uppercase tracking-wider">Total Properties</p>
            <p className="text-2xl font-bold text-dark mt-1">{stats.totalProperties}</p>
          </div>
        </div>

        <div className="bg-background-card p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <ConciergeBell size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-dark-soft uppercase tracking-wider">Total Serving</p>
            <p className="text-2xl font-bold text-dark mt-1">{stats.totalServings}</p>
          </div>
        </div>

        <div className="bg-background-card p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-dark-soft uppercase tracking-wider">Total Order</p>
            <p className="text-2xl font-bold text-dark mt-1">{stats.totalOrders}</p>
          </div>
        </div>
      </div>

      <div className="bg-background-card rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-600 tracking-wide">Property Information</h2>
          <button
            onClick={() => setShowEdit(true)}
            className="btn-primary px-4 py-2 text-xs text-white flex items-center gap-1.5 rounded-lg cursor-pointer"
          >
            <Pencil size={14} /> Edit Details
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-72 h-44 bg-gray-100 rounded-xl overflow-hidden relative shrink-0 border border-gray-300">
            {propertyBuilding.images?.[0] ? (
              <Image src={propertyBuilding.images[0]} alt={propertyBuilding.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Building2 size={36} />
              </div>
            )}
          </div>
          <div className="space-y-3 text-dark">
            <h3 className="text-2xl font-semibold text-dark">{propertyBuilding.name}</h3>
            <div className="space-y-1 text-sm text-dark-soft">
              <p className="flex items-center gap-2">
                📍 {propertyBuilding.address}, {propertyBuilding.city}
              </p>
              <p className="flex items-center gap-2">📞 {propertyBuilding.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {showEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-sm p-3 md:p-6 relative shadow-2xl z-100 my-8">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-dark transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-dark mb-4">Edit Property Details</h2>

            <form onSubmit={handleRegisterOrUpdate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-dark-soft mb-1 block">Cover Image</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg h-32 cursor-pointer relative overflow-hidden bg-gray-50">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={20} className="text-gray-400" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>

              <div>
                <label className="text-sm font-medium text-dark-soft mb-1 block">Property Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white text-dark"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-dark-soft mb-1 block">Phone</label>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white text-dark"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-dark-soft mb-1 block">Address</label>
                <textarea
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white text-dark"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-dark-soft mb-1 block">City</label>
                <select
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white text-dark"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 text-white font-semibold rounded-lg cursor-pointer">
                {saving ? "Updating..." : "Update Details"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

