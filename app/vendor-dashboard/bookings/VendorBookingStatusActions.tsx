// app/vendor-dashboard/bookings/VendorBookingStatusActions.tsx

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface VendorBookingStatusActionsProps {
  bookingId: string;
  currentStatus?: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-300",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-300",
  completed: "bg-purple-100 text-purple-700 border-purple-300",
  cancelled: "bg-rose-100 text-rose-700 border-rose-300",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Sold",
  cancelled: "Cancelled",
};

export default function VendorBookingStatusActions({
  bookingId,
  currentStatus = "pending",
}: VendorBookingStatusActionsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Keep local state in sync when server props change
  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const updateStatus = async (newStatus: string) => {
    const previous = status;
    setLoading(true);
    setStatus(newStatus); // optimistic

    try {
      const res = await fetch(`/api/vendor/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update booking");

      toast.success(
        newStatus === "completed" ? "Flat marked as SOLD!" : "Booking updated successfully!",
      );
      router.refresh();
    } catch (err: any) {
      setStatus(previous); // revert
      toast.error(err.message || "Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  const markSold = () => {
    if (
      window.confirm(
        "Mark this flat as SOLD?\n\nThe flat will show as SOLD on the website and all other open requests for it will be cancelled.",
      )
    ) {
      updateStatus("completed");
    }
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${STATUS_STYLES[status] ?? STATUS_STYLES.pending
          }`}
      >
        {STATUS_LABELS[status] ?? status}
      </span>

      <div className="flex flex-wrap items-center gap-2">
        {status === "pending" && (
          <>
            <button
              onClick={() => updateStatus("confirmed")}
              disabled={loading}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              onClick={() => updateStatus("cancelled")}
              disabled={loading}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
            >
              Decline
            </button>
          </>
        )}

        {status === "confirmed" && (
          <>
            <button
              onClick={markSold}
              disabled={loading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
            >
              Mark Flat as SOLD
            </button>
            <button
              onClick={() => updateStatus("cancelled")}
              disabled={loading}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

