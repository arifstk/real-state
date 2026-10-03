// app/vendor-dashboard/hotels/page.tsx

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { Building2, Pencil, Trash2, Upload, X, DoorOpen } from "lucide-react";

type Hotel = {
  _id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  images: string[];
};

export default function VendorHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const loadHotels = async () => {
    setLoading(true);
    const res = await fetch("/api/vendor/hotels");
    const data = await res.json();
    if (res.ok) setHotels(data.hotels);
    else toast.error(data.message);
    setLoading(false);
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const resetForm = () => {
    setForm({ name: "", phone: "", address: "", city: "" });
    setFiles([]);
    setPreviews([]);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("phone", form.phone);
    fd.append("address", form.address);
    fd.append("city", form.city);
    files.forEach((f) => fd.append("images", f));

    try {
      const res = await fetch("/api/vendor/hotels", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Hotel registered!");
      resetForm();
      loadHotels();
    } catch {
      toast.error("Server error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Will all room of this hotel, are you confirm?")) return;

    const res = await fetch(`/api/vendor/hotels/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      toast.success("Hotel Deleted");
      loadHotels();
    } else {
      toast.error(data.message);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-dark">My Hotels</h1>
            <p className="text-dark-soft text-sm mt-0.5">Register Hotel and then add rooms</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary px-5 py-2.5 text-white font-semibold flex items-center gap-2"
          >
            <Building2 size={18} /> Register Your Hotel
          </button>
        </div>

        {/* Hotel List */}
        {loading ? (
          <p className="text-dark-soft">Loading...</p>
        ) : hotels.length === 0 ? (
          <div className="bg-background-card rounded-xl2 border border-gray-100 p-10 text-center text-dark-soft">
            No Hotels Found
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {hotels.map((hotel) => (
              <div key={hotel._id} className="bg-background-card rounded-xl2 border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-44 bg-gray-100 relative">
                  {hotel.images[0] ? (
                    <Image src={hotel.images[0]} alt={hotel.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Building2 size={32} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-dark">{hotel.name}</h3>
                  <p className="text-sm text-dark-soft mt-1">{hotel.address}, {hotel.city}</p>
                  <p className="text-sm text-dark-soft">📞 {hotel.phone}</p>

                  <div className="flex items-center gap-2 mt-4">
                    <Link
                      href={`/vendor-dashboard/hotels/${hotel._id}/rooms`}
                      className="flex-1 bg-primary text-white text-sm font-semibold py-2 rounded-lg text-center hover:bg-primary-dark transition flex items-center justify-center gap-1.5"
                    >
                      <DoorOpen size={16} /> Manage Rooms
                    </Link>
                    <button
                      onClick={() => handleDelete(hotel._id)}
                      className="p-2 rounded-lg border border-gray-200 text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Register Hotel Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background-card rounded-xl2 w-full max-w-md p-6 relative shadow-xl">
            <button onClick={resetForm} className="absolute top-4 right-4 text-gray-400 hover:text-dark">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-dark mb-5">Register Your Hotel</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-dark-soft mb-1 block">Hotel Images</label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg py-6 cursor-pointer hover:border-primary transition text-sm text-gray-400">
                  <Upload size={18} />
                  {files.length > 0 ? `${files.length} Image Selected` : "Upload Image (Select more image)"}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                </label>
                {previews.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {previews.map((src, i) => (
                      <img key={i} src={src} className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-dark-soft mb-1 block">Hotel Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Type here"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-dark-soft mb-1 block">Phone</label>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Type here"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-dark-soft mb-1 block">Address</label>
                <textarea
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Type here"
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-dark-soft mb-1 block">City</label>
                <select
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select City</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chattogram">Chattogram</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Cox's Bazar">Cox&apos;s Bazar</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Barisal">Barisal</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full py-2.5 text-white font-semibold disabled:opacity-60"
              >
                {saving ? "Registering..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

