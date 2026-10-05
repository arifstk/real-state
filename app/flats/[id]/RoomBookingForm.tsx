"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { CreditCard, Building } from "lucide-react";

interface RoomBookingFormProps {
  roomId: string;
  hotelId: string;
  pricePerNight: number;
  discountPercent?: number;
  isAvailable: boolean;
  roomTitle?: string;
}

export default function RoomBookingForm({
  roomId,
  hotelId,
  pricePerNight,
  discountPercent = 0,
  isAvailable,
  roomTitle = "Hotel Room",
}: RoomBookingFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [paymentType, setPaymentType] = useState<"online" | "direct">("online");
  const [loading, setLoading] = useState(false);

  const finalPrice = Math.round(pricePerNight - (pricePerNight * discountPercent) / 100);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please login first to book a room");
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error("Select Check-in and Check-out dates");
      return;
    }

    setLoading(true);

    try {
      if (paymentType === "online") {
        // Online Stripe Payment
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            hotelId,
            checkIn,
            checkOut,
            totalPrice: finalPrice,
            roomTitle,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Checkout failed");

        window.location.href = data.url;
      } else {
        // Direct / Pay at Hotel
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            hotelId,
            checkIn,
            checkOut,
            totalPrice: finalPrice,
            paymentType: "direct",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to book room");

        toast.success("Room booked successfully! Pay at hotel upon check-in.");
        router.push("/my-bookings");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xs">
      <div>
        <span className="text-xs font-semibold text-slate-400 block uppercase">Price</span>
        <div className="flex items-baseline gap-2 mt-1">
          {discountPercent > 0 && (
            <span className="text-lg font-medium text-slate-400 line-through">
              ${pricePerNight}
            </span>
          )}
          <span className="text-2xl font-extrabold text-slate-800">
            ${finalPrice} <span className="text-xs font-normal text-slate-400">/night</span>
          </span>
        </div>
      </div>

      <form onSubmit={handleBooking} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Check-In</label>
          <input
            type="date"
            required
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Check-Out</label>
          <input
            type="date"
            required
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
          />
        </div>

        {/* Payment Type Options */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-slate-600">Select Payment Option</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentType("online")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${paymentType === "online"
                  ? "border-teal-600 bg-teal-50 text-teal-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
            >
              <CreditCard size={16} />
              <span>Pay Online</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentType("direct")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${paymentType === "direct"
                  ? "border-teal-600 bg-teal-50 text-teal-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
            >
              <Building size={16} />
              <span>Pay at Hotel</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isAvailable || loading}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition text-xs disabled:opacity-50 cursor-pointer"
        >
          {loading
            ? "Processing..."
            : !isAvailable
              ? "Unavailable"
              : paymentType === "online"
                ? "Proceed to Online Payment"
                : "Confirm Direct Booking"}
        </button>
      </form>
    </div>
  );
}

