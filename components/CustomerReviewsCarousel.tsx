// components/CustomerReviewsCarousel.tsx

"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

export type ReviewItem = {
  id: string;
  name: string;
  image?: string;
  rating: number;
  comment: string;
  timeAgo: string;
  flatTitle?: string;
};

const AVATAR_COLORS = [
  "bg-emerald-600",
  "bg-indigo-400",
  "bg-rose-500",
  "bg-amber-500",
  "bg-sky-600",
  "bg-violet-500",
];

const READ_MORE_LIMIT = 110;

function Avatar({ item, size }: { item: ReviewItem; size: number }) {
  const color = AVATAR_COLORS[(item.name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

  return item.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.image}
      alt={item.name}
      width={size}
      height={size}
      referrerPolicy="no-referrer"
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className={`${color} rounded-full flex items-center justify-center text-white font-semibold`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {item.name.charAt(0).toUpperCase()}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center justify-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
        />
      ))}
    </div>
  );
}

export default function CustomerReviewsCarousel({ reviews }: { reviews: ReviewItem[] }) {
  const n = reviews.length;
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (n === 0) return null;

  const go = (i: number) => setActive(((i % n) + n) % n);

  // Show previous / current / next when there are 3+ reviews, otherwise show all of them
  const visible =
    n >= 3
      ? [-1, 0, 1].map((o) => ({ item: reviews[(active + o + n) % n], isActive: o === 0 }))
      : reviews.map((item, i) => ({ item, isActive: i === active }));

  return (
    <div className="space-y-8">
      {/* Avatar picker */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {reviews.map((r, i) => (
          <button
            key={r.id}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show review by ${r.name}`}
            className={`rounded-full p-0.5 transition ${i === active ? "ring-2 ring-slate-800 ring-offset-2" : "opacity-80 hover:opacity-100"
              }`}
          >
            <Avatar item={r} size={36} />
          </button>
        ))}
      </div>

      {/* Cards + arrows */}
      <div className="relative">
        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Previous review"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 transition"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Next review"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 transition"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        <div className="flex items-stretch justify-center gap-5 px-12">
          {visible.map(({ item, isActive }) => {
            const long = item.comment.length > READ_MORE_LIMIT;
            const open = !!expanded[item.id];

            return (
              <div
                key={item.id}
                className={`flex-col items-center text-center bg-white rounded-xl border w-full max-w-sm transition-all duration-300 ${isActive
                    ? "flex border-slate-300 shadow-md p-7"
                    : "hidden md:flex border-slate-200 p-6 opacity-80"
                  }`}
              >
                <Quote size={26} className="fill-slate-800 text-slate-800 mb-4 rotate-180" />

                <p
                  className={`text-slate-600 leading-relaxed ${isActive ? "text-sm" : "text-xs"
                    } ${!open && long ? "line-clamp-3" : ""}`}
                >
                  {item.comment}
                </p>

                {long && (
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => ({ ...e, [item.id]: !e[item.id] }))}
                    className="mt-3 text-xs font-bold text-slate-800 hover:text-teal-600 transition"
                  >
                    {open ? "Show Less" : "Read More"}
                  </button>
                )}

                <div className="mt-4">
                  <Stars rating={item.rating} />
                </div>

                <div className="mt-5 flex flex-col items-center gap-1.5">
                  <Avatar item={item} size={isActive ? 44 : 38} />
                  <p className={`font-semibold text-slate-800 ${isActive ? "text-sm" : "text-xs"}`}>
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {item.timeAgo}
                    {item.flatTitle ? ` · ${item.flatTitle}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

