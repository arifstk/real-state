// components/sections/FlatsSection.tsx

import { cache } from "react";
import connectDB from "@/lib/mongodb";
import Flat from "@/models/Flat";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import FlatCard from "@/components/cards/FlatCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type FlatType = {
  _id: string;
  flatType: string;
  city?: string;
  address?: string;
  price: number;
  discountPercent?: number;
  images: string[];
  isAvailable: boolean;
  isSold?: boolean;
  rating?: number;
  reviewCount?: number;
  title?: string;
};

interface FlatsSectionProps {
  limit?: number;
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

const getFlatsData = cache(async (limit: number) => {
  await connectDB();
  const flatsData = await Flat.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  if (!flatsData || flatsData.length === 0) {
    return null;
  }

  const flatIds = flatsData.map((flat) => flat._id);

  const [activeBookings, reviewStats] = await Promise.all([
    Booking.find({
      flat: { $in: flatIds },
      status: "confirmed",
    }).select("flat"),

    Review.aggregate([
      { $match: { flat: { $in: flatIds } } },
      {
        $group: {
          _id: "$flat",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const bookedFlatIds = new Set(
    activeBookings.map((b) => b.flat.toString())
  );

  const reviewMap = new Map(
    reviewStats.map((stat) => [
      stat._id.toString(),
      {
        rating: Math.round(stat.averageRating * 10) / 10,
        reviewCount: stat.reviewCount,
      },
    ])
  );

  const flatsWithMetadata = flatsData.map((flat) => {
    const flatIdStr = flat._id.toString();
    const stats = reviewMap.get(flatIdStr);

    const isSold = !!(flat as any).isSold;

    return {
      ...flat,
      isSold,
      isAvailable:
        !isSold && (flat as any).isAvailable !== false && !bookedFlatIds.has(flatIdStr),
      rating: stats?.rating ?? flat.rating ?? 0,
      reviewCount: stats?.reviewCount ?? flat.reviewCount ?? 0,
    };
  });

  return JSON.parse(JSON.stringify(flatsWithMetadata)) as FlatType[];
});

export default async function FlatsSection({
  limit = 8,
  title = "Available Apartments",
  subtitle = "Explore our handpicked selection of premium residential flats.",
  showViewAll = true,
}: FlatsSectionProps) {
  const flats = await getFlatsData(limit);

  if (!flats || flats.length === 0) {
    return null;
  }

  return (
    <section className="w-full px-2">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{title}</h2>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
        {showViewAll && (
          <Link
            href="/flats"
            className="flex items-center gap-2 text-xs font-semibold text-teal-600 hover:text-teal-700 transition"
          >
            View All <ArrowRight size={16} />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {flats.map((flat) => (
          <FlatCard
            key={flat._id}
            id={flat._id}
            propertyName={flat.title || "Luxury Flat"}
            city={flat.city || ""}
            address={flat.address || ""}
            flatType={flat.flatType}
            price={flat.price}
            discountPercent={flat.discountPercent}
            images={flat.images}
            rating={flat.rating}
            reviewCount={flat.reviewCount}
            isAvailable={flat.isAvailable}
            isSold={flat.isSold}
          />
        ))}
      </div>
    </section>
  );
}

