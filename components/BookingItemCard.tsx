// components/BookingItemCard.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, MapPin, CreditCard, Star } from "lucide-react";
import ReviewModal from "./ReviewModal";

export default function BookingItemCard({ booking }: { booking: any }) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isReviewed, setIsReviewed] = useState(booking?.isReviewed || false);
  const status = booking?.status || "pending";
  const paymentStatus = booking?.paymentStatus || "unpaid";

  const canReview = ["completed", "checked_out"].includes(status);

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 md:p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        {/* Room/Hotel Image & Info */}
        <div className="flex gap-4 items-center">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
            <Image
              src={booking?.room?.images?.[0] || booking?.hotel?.images?.[0] || "/placeholder-room.jpg"}
              alt={booking?.room?.roomType || "Room"}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-teal-600">
              {booking?.hotel?.name || "Hotel Name"}
            </span>
            <h3 className="text-base font-bold text-slate-800">
              {booking?.room?.roomType || "Room Details"}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin size={13} className="text-slate-400" />
              {booking?.hotel?.city || "Location"}
            </p>
          </div>
        </div>

        {/* Booking Dates & Details */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-6 text-xs text-slate-600">
          <div className="space-y-1">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Calendar size={13} /> Check-In / Out
            </span>
            <p className="font-semibold text-slate-800">
              {booking?.checkIn ? new Date(booking.checkIn).toLocaleDateString() : "N/A"} -{" "}
              {booking?.checkOut ? new Date(booking.checkOut).toLocaleDateString() : "N/A"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <CreditCard size={13} /> Total Amount
            </span>
            <p className="font-extrabold text-slate-800 text-sm">
              ${booking?.totalPrice ?? 0}
            </p>
          </div>

          {/* Status Badges & Review Action */}
          <div className="flex flex-col gap-1.5 min-w-28">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase text-center ${status === "confirmed"
                  ? "bg-emerald-100 text-emerald-700"
                  : status === "checked_in"
                    ? "bg-blue-100 text-blue-700"
                    : status === "completed" || status === "checked_out"
                      ? "bg-purple-100 text-purple-700"
                      : status === "cancelled"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                }`}
            >
              {status.replace("_", " ")}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase text-center ${paymentStatus === "paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
                }`}
            >
              {paymentStatus}
            </span>

            {canReview && (
              <button
                disabled={isReviewed}
                onClick={() => setShowReviewModal(true)}
                className={`mt-1 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition ${isReviewed
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-amber-500 text-white hover:bg-amber-600 shadow-xs"
                  }`}
              >
                <Star size={12} fill="currentColor" />
                {isReviewed ? "Reviewed" : "Write Review"}
              </button>
            )}
          </div>
        </div>
      </div>

      {showReviewModal && (
        <ReviewModal
          bookingId={booking?._id}
          roomId={booking?.room?._id}
          hotelId={booking?.hotel?._id}
          hotelName={booking?.hotel?.name || "Hotel"}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => setIsReviewed(true)}
        />
      )}
    </>
  );
}

