// app/admin/views/PropertiesView.tsx

"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, MapPin, DollarSign, RefreshCw, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Property {
  _id: string;
  title: string;
  city?: string;
  address: string;
  price: number;
  images?: string[];
  contactNumber?: string;
  phone?: string;
  propertyType?: string;
}

export default function AdminPropertiesView() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProperties = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/properties");
        const data = await res.json();
        if (isMounted) {
          if (res.ok) {
            setProperties(Array.isArray(data) ? data : data.properties || []);
          } else {
            toast.error(data.message || "Failed to load properties");
          }
        }
      } catch {
        if (isMounted) toast.error("Something went wrong");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  const deleteProperty = async (id: string) => {
    if (!confirm("Are you sure? Deleting this property will permanently delete all associated flats!")) return;
    try {
      const res = await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Property deleted successfully");
        setProperties((prev) => prev.filter((p) => p._id !== id));
      } else {
        toast.error("Failed to delete property");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <RefreshCw size={24} className="animate-spin text-teal-600" />
        <p className="text-xs text-slate-400 font-medium">Loading properties...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Properties Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage all listed real estate properties and buildings in a list view.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {properties.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No properties found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Price / Rent</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {properties.map((prop) => {
                  const displayImage =
                    prop.images && prop.images.length > 0 ? prop.images[0] : "/placeholder-property.jpg";
                  const displayPhone = prop.contactNumber || prop.phone || "N/A";

                  return (
                    <tr key={prop._id} className="hover:bg-slate-50/80 transition-all">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <Image src={displayImage} alt={prop.title || "Property Image"} fill className="object-cover" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 line-clamp-1">{prop.title}</h4>
                            <span className="text-[10px] text-teal-600 font-medium">
                              {prop.propertyType || "Real Estate"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-500">
                          <MapPin size={13} className="text-teal-500 shrink-0" />
                          <span className="line-clamp-1">
                            {prop.city ? `${prop.city}, ` : ""}
                            {prop.address}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-0.5 text-teal-600">
                          <DollarSign size={13} />
                          <span>{prop.price}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {displayPhone}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/properties/${prop._id}`}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-600 transition-all"
                            title="View Property"
                          >
                            <Eye size={14} />
                          </Link>
                          <button
                            onClick={() => deleteProperty(prop._id)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer"
                            title="Delete Property"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

