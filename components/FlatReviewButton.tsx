// components/FlatReviewButton.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import ReviewModal from "@/components/ReviewModal";

export default function FlatReviewButton({
  bookingId,
  flatTitle,
}: {
  bookingId: string;
  flatTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition"
      >
        <Star size={14} className="fill-white" /> Write a Review
      </button>

      {open && (
        <ReviewModal
          bookingId={bookingId}
          flatTitle={flatTitle}
          onClose={() => setOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}

