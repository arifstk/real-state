"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import toast from "react-hot-toast";

type ReviewModalProps = {
  bookingId: string;
  roomId: string;
  hotelId: string;
  hotelName: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ReviewModal({
  bookingId,
  roomId,
  hotelId,
  hotelName,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          roomId,
          hotelId,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Review posted successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-slate-800 mb-1">
          Review {hotelName}
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Share your experience with other travelers
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="p-1 text-amber-400 focus:outline-none"
                >
                  <Star
                    size={28}
                    fill={(hover || rating) >= star ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-600">
              {rating} out of 5 Stars
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Your Review
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was your stay? Tell us about the amenities, staff, and room..."
              className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-teal-600 text-white font-semibold text-sm rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}

