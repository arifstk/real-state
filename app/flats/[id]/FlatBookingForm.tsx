// app/flats/[id]/FlatBookingForm.tsx
"use client";

import { useState } from "react";
import { CalendarCheck, Loader2, CheckCircle2 } from "lucide-react";

const BOOKING_ENDPOINT = "/api/bookings";

interface FlatBookingFormProps {
  flatId: string;
  sellerId?: string;
  price: number;
  isAvailable: boolean;
  /** Logged-in user's details (null when logged out) – pre-fills name / phone / email */
  defaultValues?: { name: string; phone: string; email: string } | null;
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition";
const labelCls = "block text-xs font-bold text-slate-600 mb-1.5";

export default function FlatBookingForm({
  flatId,
  sellerId,
  price,
  isAvailable,
  defaultValues,
}: FlatBookingFormProps) {
  const [form, setForm] = useState({
    name: defaultValues?.name ?? "",
    phone: defaultValues?.phone ?? "",
    email: defaultValues?.email ?? "",
    visitDate: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update =
    (key: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async () => {
    setError("");

    if (!form.name.trim()) return setError("Please enter your name.");
    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(form.phone.replace(/[\s-]/g, "")))
      return setError("Please enter a valid Bangladeshi mobile number.");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      return setError("Please enter a valid email address.");

    setLoading(true);
    try {
      const res = await fetch(BOOKING_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flat: flatId,
          seller: sellerId,
          price,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          visitDate: form.visitDate || undefined,
          message: form.message.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Something went wrong. Please try again.");

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAvailable) {
    return (
      <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold p-4 rounded-2xl text-center">
        This flat is no longer available.
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl text-center space-y-2">
        <CheckCircle2 className="mx-auto text-emerald-600" size={28} />
        <p className="text-sm font-bold text-emerald-800">Request received!</p>
        <p className="text-xs text-emerald-700">
          The seller will contact you shortly to confirm the visit and next steps.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
      <div className="flex items-center gap-2">
        <CalendarCheck size={16} className="text-teal-600" />
        <h3 className="text-sm font-bold text-slate-800">Book / Schedule a Visit</h3>
      </div>

      {!defaultValues && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          You need to be logged in to request a booking.
        </p>
      )}

      <div>
        <label className={labelCls}>Full Name</label>
        <input className={inputCls} value={form.name} onChange={update("name")} placeholder="Your name" />
      </div>

      <div>
        <label className={labelCls}>Phone</label>
        <input
          className={inputCls}
          value={form.phone}
          onChange={update("phone")}
          placeholder="01XXXXXXXXX"
          inputMode="tel"
        />
      </div>

      <div>
        <label className={labelCls}>
          Email <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          type="email"
          className={inputCls}
          value={form.email}
          onChange={update("email")}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className={labelCls}>
          Preferred visit date <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          type="date"
          min={today}
          className={inputCls}
          value={form.visitDate}
          onChange={update("visitDate")}
        />
      </div>

      <div>
        <label className={labelCls}>
          Message <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          rows={3}
          className={`${inputCls} resize-none`}
          value={form.message}
          onChange={update("message")}
          placeholder="I'd like to know more about..."
        />
      </div>

      {error && (
        <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Sending..." : "Request Booking"}
      </button>
    </div>
  );
}

