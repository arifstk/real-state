// app/vendor-dashboard/bookings/VendorBookingStatusActions.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface VendorBookingStatusActionsProps {
  bookingId: string;
  currentStatus?: string;
  paymentStatus?: string;
}

export default function VendorBookingStatusActions({
  bookingId,
  currentStatus = "pending",
  paymentStatus = "unpaid",
}: VendorBookingStatusActionsProps) {
  const [status, setStatus] = useState(currentStatus || "pending");
  const [payStatus, setPayStatus] = useState(paymentStatus || "unpaid");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Keep local state synced when server props change
  useEffect(() => {
    if (currentStatus) setStatus(currentStatus);
    if (paymentStatus) setPayStatus(paymentStatus);
  }, [currentStatus, paymentStatus]);

  // Helper function to handle status & payment updates
  const updateBookingData = async (payload: {
    status?: string;
    paymentStatus?: string;
  }) => {
    setLoading(true);

    // Optimistic UI update
    if (payload.status) setStatus(payload.status);
    if (payload.paymentStatus) setPayStatus(payload.paymentStatus);

    try {
      const res = await fetch(`/api/vendor/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Booking updated successfully!");
      router.refresh();
    } catch (err: any) {
      // Revert on failure
      setStatus(currentStatus);
      setPayStatus(paymentStatus);
      toast.error(err.message || "Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    const payload: { status: string; paymentStatus?: string } = { status: newStatus };
    if (newStatus === "completed") {
      payload.paymentStatus = "paid";
    }
    updateBookingData(payload);
  };

  const handlePaymentStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPaymentStatus = e.target.value;
    updateBookingData({ paymentStatus: newPaymentStatus });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {/* Dynamic Status Dropdowns */}
      <div className="flex flex-col gap-1.5 min-w-28">
        {/* Booking Status Dropdown */}
        <select
          value={status}
          onChange={handleStatusChange}
          disabled={loading}
          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase text-center outline-none cursor-pointer border transition ${status === "confirmed"
              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
              : status === "checked_in"
                ? "bg-blue-100 text-blue-700 border-blue-300"
                : status === "completed"
                  ? "bg-purple-100 text-purple-700 border-purple-300"
                  : status === "cancelled"
                    ? "bg-rose-100 text-rose-700 border-rose-300"
                    : "bg-amber-100 text-amber-700 border-amber-300"
            }`}
        >
          <option value="pending">PENDING</option>
          <option value="confirmed">CONFIRMED</option>
          <option value="checked_in">CHECKED IN</option>
          <option value="completed">COMPLETED</option>
          <option value="cancelled">CANCELLED</option>
        </select>

        {/* Payment Status Dropdown */}
        <select
          value={payStatus}
          onChange={handlePaymentStatusChange}
          disabled={loading}
          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase text-center outline-none cursor-pointer border transition ${payStatus === "paid"
              ? "bg-emerald-100 text-emerald-700 border-emerald-300"
              : "bg-rose-100 text-rose-700 border-rose-300"
            }`}
        >
          <option value="unpaid">UNPAID</option>
          <option value="paid">PAID</option>
        </select>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2">
        {status === "pending" && (
          <>
            <button
              onClick={() => updateBookingData({ status: "confirmed" })}
              disabled={loading}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              onClick={() => updateBookingData({ status: "cancelled" })}
              disabled={loading}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        )}

        {status === "confirmed" && (
          <button
            onClick={() => updateBookingData({ status: "checked_in" })}
            disabled={loading}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
          >
            Check In Guest
          </button>
        )}

        {status === "checked_in" && (
          <button
            onClick={() => updateBookingData({ status: "completed", paymentStatus: "paid" })}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
          >
            Check Out
          </button>
        )}
      </div>
    </div>
  );
}

