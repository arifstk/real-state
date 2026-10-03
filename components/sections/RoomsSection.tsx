
import { cache } from "react";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import RoomCard from "@/components/cards/RoomCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type RoomType = {
  _id: string;
  roomType: string;
  city?: string;
  address?: string;
  pricePerNight: number;
  discountPercent?: number;
  images: string[];
  isAvailable: boolean;
  hotel?: {
    name: string;
    city?: string;
    address?: string;
  };
  rating?: number;
  reviewCount?: number;
};

interface RoomsSectionProps {
  limit?: number;
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

// Cached database fetching function
const getRoomsData = cache(async (limit: number) => {
  await connectDB();

  const roomsData = await Room.find()
    .populate("hotel", "name city address")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  if (!roomsData || roomsData.length === 0) {
    return null;
  }

  const roomIds = roomsData.map((room) => room._id);

  // Fetch active bookings and review aggregations concurrently
  const [activeBookings, reviewStats] = await Promise.all([
    Booking.find({
      room: { $in: roomIds },
      status: { $nin: ["cancelled", "completed"] },
    }).select("room"),

    Review.aggregate([
      { $match: { room: { $in: roomIds } } },
      {
        $group: {
          _id: "$room",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const bookedRoomIds = new Set(
    activeBookings.map((b) => b.room.toString())
  );

  // Map review stats for O(1) lookup
  const reviewMap = new Map(
    reviewStats.map((stat) => [
      stat._id.toString(),
      {
        rating: Math.round(stat.averageRating * 10) / 10,
        reviewCount: stat.reviewCount,
      },
    ])
  );

  const roomsWithMetadata = roomsData.map((room) => {
    const roomIdStr = room._id.toString();
    const stats = reviewMap.get(roomIdStr);

    return {
      ...room,
      isAvailable: !bookedRoomIds.has(roomIdStr),
      rating: stats?.rating ?? room.rating ?? 0,
      reviewCount: stats?.reviewCount ?? room.reviewCount ?? 0,
    };
  });

  return JSON.parse(JSON.stringify(roomsWithMetadata)) as RoomType[];
});

export default async function RoomsSection({
  limit = 8,
  title = "Featured Destinations",
  subtitle = "Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences",
  showViewAll = true,
}: RoomsSectionProps) {
  const rooms = await getRoomsData(limit);

  if (!rooms || rooms.length === 0) {
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
            href="/rooms"
            className="flex items-center gap-2 text-xs font-semibold text-teal-600 hover:text-teal-700 transition"
          >
            View All <ArrowRight size={16} />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <RoomCard
            key={room._id}
            id={room._id}
            hotelName={room.hotel?.name || "Luxury Stay"}
            city={room.hotel?.city || room.city || ""}
            address={room.hotel?.address || room.address || ""}
            roomType={room.roomType}
            pricePerNight={room.pricePerNight}
            discountPercent={room.discountPercent}
            images={room.images}
            rating={room.rating}
            reviewCount={room.reviewCount}
            isAvailable={room.isAvailable}
          />
        ))}
      </div>
    </section>
  );
}

