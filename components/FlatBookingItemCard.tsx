// components/FlatBookingItemCard.tsx

import Image from "next/image";
import Link from "next/link";
import FlatReviewButton from "@/components/FlatReviewButton";
import { MapPin, Calendar, Banknote, Phone, MessageCircle, MessageSquareText } from "lucide-react";

const formatBDT = (n: number) => `৳${Math.round(n).toLocaleString("en-BD")}`;

const toWhatsAppNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `88${digits}` : digits;
};

const formatDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

const STATUS: Record<string, { label: string; cls: string; hint: string }> = {
  pending: {
    label: "Awaiting Seller",
    cls: "bg-amber-100 text-amber-700 border-amber-300",
    hint: "The seller will contact you soon to confirm your request.",
  },
  confirmed: {
    label: "Confirmed",
    cls: "bg-emerald-100 text-emerald-700 border-emerald-300",
    hint: "Your request is confirmed. The seller will arrange the visit with you.",
  },
  completed: {
    label: "Deal Completed",
    cls: "bg-purple-100 text-purple-700 border-purple-300",
    hint: "Congratulations! This flat has been sold to you.",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-rose-100 text-rose-700 border-rose-300",
    hint: "This request was cancelled or the flat is no longer available.",
  },
};

export default function FlatBookingItemCard({ booking }: { booking: any }) {
  const flat = booking.flat;
  const seller = booking.seller;
  const status = STATUS[booking.status] ?? STATUS.pending;
  const canContactSeller =
    seller?.mobile && (booking.status === "pending" || booking.status === "confirmed");

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col md:flex-row">
      {/* Image */}
      <div className="relative w-full md:w-56 h-44 md:h-auto shrink-0 bg-slate-100">
        <Image
          src={flat?.images?.[0] || "/placeholder-flat.jpg"}
          alt={flat?.title || "Flat"}
          fill
          className={`object-cover ${flat?.isSold && booking.status !== "completed" ? "grayscale" : ""}`}
        />
      </div>

      {/* Details */}
      <div className="flex-1 p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold text-teal-600 uppercase tracking-wide">
              {flat?.flatType || "Flat"}
            </p>
            <h3 className="text-base font-bold text-slate-800">{flat?.title || "Flat no longer listed"}</h3>
            {flat && (
              <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                <MapPin size={13} className="text-teal-500 shrink-0" />
                {[flat.address, flat.city].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          <span
            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${status.cls}`}
          >
            {status.label}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs text-slate-600">
          <div className="space-y-0.5">
            <span className="text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
              <Calendar size={13} /> Preferred Visit
            </span>
            <p className="font-bold text-slate-800">{formatDate(booking.visitDate) || "Not specified"}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-400 flex items-center gap-1 font-semibold text-[11px]">
              <Banknote size={13} /> Price
            </span>
            <p className="font-extrabold text-slate-800 text-sm">{formatBDT(booking.totalPrice)}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-slate-400 font-semibold text-[11px]">Requested On</span>
            <p className="font-bold text-slate-800">{formatDate(booking.createdAt)}</p>
          </div>
        </div>

        {booking.message && (
          <div className="flex items-start gap-2 bg-slate-50 rounded-xl p-3">
            <MessageSquareText size={14} className="text-slate-400 shrink-0 mt-px" />
            <p className="text-xs text-slate-600 leading-relaxed">{booking.message}</p>
          </div>
        )}

        <p className="text-[11px] text-slate-400">{status.hint}</p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {flat?._id && (
            <Link
              href={`/flats/${flat._id}`}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              View Flat
            </Link>
          )}

          {booking.status === "completed" && flat?._id && (
            booking.isReviewed ? (
              <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                ✓ Reviewed
              </span>
            ) : (
              <FlatReviewButton bookingId={booking._id} flatTitle={flat.title} />
            )
          )}

          {canContactSeller && (
            <>
              <a
                href={`tel:${seller.mobile}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition"
              >
                <Phone size={13} /> Call Seller
              </a>
              <a
                href={`https://wa.me/${toWhatsAppNumber(seller.mobile)}?text=${encodeURIComponent(
                  `Hi, I requested to book "${flat?.title ?? "your flat"}".`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition"
              >
                <MessageCircle size={13} /> WhatsApp
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

