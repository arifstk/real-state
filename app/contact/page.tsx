// app/contact/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

const SUBJECTS = [
  "General Inquiry",
  "Flat Booking",
  "Property Visit Schedule",
  "Payment & Installment",
  "Developer / Vendor Partnership",
  "Technical Support",
  "Become a Seller",
  "Feedback",
  "Other",
];

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all";

export default function ContactPage() {
  const { data: session } = useSession();

  // Dynamic Contact Info State
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: "",
    phone: "",
    address: "",
  });
  const [loadingInfo, setLoadingInfo] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch System Settings Dynamically
  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const res = await fetch("/api/admin/system-settings");
        const data = await res.json();
        if (data.success && data.settings) {
          setContactInfo({
            email: data.settings.email || "support@luxurystays.com",
            phone: data.settings.phone || "+1 (800) 123-4567",
            address: data.settings.address || "123 Luxury Way, Suite 500, San Francisco, CA",
          });
        }
      } catch (err) {
        console.error("Failed to load system settings:", err);
      } finally {
        setLoadingInfo(false);
      }
    };

    fetchSystemSettings();
  }, []);

  useEffect(() => {
    if (session?.user) {
      setForm((p) => ({
        ...p,
        name: p.name || session.user?.name || "",
        email: p.email || session.user?.email || "",
      }));
    }
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Please enter your name."); return; }
    if (!form.email.trim()) { toast.error("Please enter your email."); return; }
    if (!form.subject.trim()) { toast.error("Please select a subject."); return; }
    if (!form.message.trim()) { toast.error("Please enter your message."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        toast.success("Message sent successfully!");
      } else {
        toast.error(data.error || "Failed to send message.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-2">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl mx-auto mb-5">
            ✅
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">
            Message Sent!
          </h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Thank you for reaching out, <span className="font-semibold text-slate-700">{form.name}</span>!
            We've received your message and will get back to you at{" "}
            <span className="font-semibold text-emerald-600">{form.email}</span> shortly.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({ name: "", email: "", subject: "", message: "" });
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all cursor-pointer"
            >
              Send Another Message
            </button>
            <Link
              href="/"
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-all text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const infoList = [
    { icon: "📧", title: "Email Us", desc: contactInfo.email, sub: "24/7 online support" },
    { icon: "📞", title: "Call Us", desc: contactInfo.phone, sub: "Mon–Sat, 9am–6pm" },
    { icon: "📍", title: "Office", desc: contactInfo.address, sub: "Visit our main branch" },
  ];

  return (
    <main className="min-h-screen py-10 max-w-7xl mx-auto px-2">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          💬 Get in Touch
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight mb-3">
          Contact Support
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Have questions about your hotel reservation or need help? Send us a message and we'll reply within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Dynamic Left Column Contact Cards */}
        <div className="space-y-4">
          {infoList.map((info) => (
            <div
              key={info.title}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl shrink-0">
                {info.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {info.title}
                </p>
                {loadingInfo ? (
                  <div className="h-4 bg-slate-100 rounded animate-pulse mt-1.5 w-3/4" />
                ) : (
                  <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                    {info.desc}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-0.5">{info.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-black text-slate-800">Send a Message</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Full Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                Subject *
              </label>
              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select a subject…</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">
                Message *
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="How can we help you with your booking?"
                rows={5}
                className={`${inputClass} resize-none`}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Sending..." : "Send Message 📨"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

