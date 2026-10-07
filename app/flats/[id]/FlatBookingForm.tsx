"use client";

import { useState } from "react";
import { CalendarCheck, Banknote, CreditCard, Loader2, CheckCircle2 } from "lucide-react";

// ⚠️ Point this to your existing booking API route
const BOOKING_ENDPOINT = "/api/bookings";

type PaymentMethod = "online" | "pay-cash";

interface FlatBookingFormProps {
  flatId: string;
  sellerId?: string;
  price: number;
  isAvailable: boolean;
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition";
const labelCls = "block text-xs font-bold text-slate-600 mb-1.5";

export default function FlatBookingForm({
  flatId,
  sellerId,
  price,
  isAvailable,
}: FlatBookingFormProps) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    visitDate: "", // optional preferred site-visit date (replaces check-in/check-out)
    message: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pay-cash");
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
          paymentMethod,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Something went wrong. Please try again.");

      // If you have an online payment gateway, redirect here when it returns a URL
      if (paymentMethod === "online" && data?.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
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

  const methods: { value: PaymentMethod; label: string; hint: string; icon: typeof Banknote }[] = [
    { value: "pay-cash", label: "Pay Cash", hint: "Pay in person", icon: Banknote },
    { value: "online", label: "Pay Online", hint: "bKash / Card", icon: CreditCard },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
      <div className="flex items-center gap-2">
        <CalendarCheck size={16} className="text-teal-600" />
        <h3 className="text-sm font-bold text-slate-800">Book / Schedule a Visit</h3>
      </div>

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

      <div>
        <label className={labelCls}>Payment Method</label>
        <div className="grid grid-cols-2 gap-2">
          {methods.map(({ value, label, hint, icon: Icon }) => {
            const active = paymentMethod === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setPaymentMethod(value)}
                className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition ${active
                    ? "border-teal-500 bg-teal-50 ring-2 ring-teal-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
              >
                <Icon size={16} className={active ? "text-teal-600" : "text-slate-400"} />
                <span className="text-xs font-bold text-slate-800">{label}</span>
                <span className="text-[10px] text-slate-400">{hint}</span>
              </button>
            );
          })}
        </div>
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

