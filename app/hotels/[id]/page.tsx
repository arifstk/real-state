

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import { cache } from "react";
import connectDB from "@/lib/mongodb";
import Hotel from "@/models/Hotel";
import Room from "@/models/Room";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import RoomCard from "@/components/cards/RoomCard";
import { MapPin, Star, Phone, Info } from "lucide-react";
import mongoose from "mongoose";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const FALLBACK_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SingleHotelPageProps {
  params: Promise<{ id: string }>;
}

const getHotelPageData = cache(async (id: string) => {
  await connectDB();

  const hotelObjectId = mongoose.Types.ObjectId.isValid(id)
    ? new mongoose.Types.ObjectId(id)
    : id;

  const [hotelData, roomsData, roomReviewStats, overallHotelReviewStats] = await Promise.all([
    Hotel.findById(id).lean(),
    Room.find({ hotel: id }).sort({ createdAt: -1 }).lean(),
    Review.aggregate([
      { $match: { hotel: hotelObjectId } },
      {
        $group: {
          _id: "$room",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]),
    Review.aggregate([
      { $match: { hotel: hotelObjectId } },
      {
        $group: {
          _id: "$hotel",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]),
  ]);

  if (!hotelData) return null;

  const roomIds = roomsData.map((room) => room._id);
  const activeBookings = await Booking.find({
    room: { $in: roomIds },
    status: { $nin: ["cancelled", "completed"] },
  }).select("room");

  const bookedRoomIds = new Set(activeBookings.map((b) => b.room.toString()));

  const reviewMap = new Map(
    roomReviewStats.map((stat) => [
      stat._id.toString(),
      {
        rating: Math.round(stat.averageRating * 10) / 10,
        reviewCount: stat.reviewCount,
      },
    ])
  );

  const formattedRooms = roomsData.map((room: any) => {
    const roomIdStr = room._id.toString();
    const stats = reviewMap.get(roomIdStr);

    return {
      ...room,
      rating: stats?.rating ?? room.rating ?? 0,
      reviewCount: stats?.reviewCount ?? room.reviewCount ?? 0,
      isAvailable: !bookedRoomIds.has(roomIdStr),
    };
  });

  const hotel = JSON.parse(JSON.stringify(hotelData));
  const rooms = JSON.parse(JSON.stringify(formattedRooms));

  const overallRatingRaw = overallHotelReviewStats[0]?.averageRating ?? hotelData.rating ?? 0;
  const overallRating = Math.round(overallRatingRaw * 10) / 10;
  const totalReviews = overallHotelReviewStats[0]?.totalReviews ?? hotelData.reviewCount ?? 0;

  return { hotel, rooms, overallRating, totalReviews };
});

export async function generateMetadata({ params }: SingleHotelPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getHotelPageData(id);

  if (!data || !data.hotel) {
    return { title: "Hotel Not Found" };
  }

  const { hotel } = data;
  const canonicalUrl = `${SITE_URL}/hotels/${hotel._id}`;
  const description = hotel.description
    ? hotel.description.slice(0, 155)
    : `Book your stay at ${hotel.name} in ${hotel.city}. High quality rooms and modern amenities.`;
  const mainImage = hotel.images?.[0] || FALLBACK_OG_IMAGE;

  return {
    title: `${hotel.name} - ${hotel.city} | Hotel Stay`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${hotel.name} | Premium Stay in ${hotel.city}`,
      description,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: hotel.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${hotel.name} | ${hotel.city}`,
      description,
      images: [mainImage],
    },
  };
}

export default async function SingleHotelPage({ params }: SingleHotelPageProps) {
  const { id } = await params;
  const data = await getHotelPageData(id);

  if (!data) {
    notFound();
  }

  const { hotel, rooms, overallRating, totalReviews } = data;
  const canonicalUrl = `${SITE_URL}/hotels/${hotel._id}`;

  const hotelJsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: hotel.description,
    url: canonicalUrl,
    image: hotel.images ?? [],
    telephone: hotel.phone || hotel.contactNumber,
    address: {
      "@type": "PostalAddress",
      streetAddress: hotel.address || "",
      addressLocality: hotel.city || "",
    },
    ...(overallRating > 0 && totalReviews > 0
      ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: overallRating,
          reviewCount: totalReviews,
          bestRating: "5",
          worstRating: "1",
        },
      }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Hotels", item: `${SITE_URL}/hotels` },
      { "@type": "ListItem", position: 3, name: hotel.name, item: canonicalUrl },
    ],
  };

  return (
    <>
      <Script
        id="hotel-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelJsonLd) }}
      />
      <Script
        id="hotel-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-slate-50/50 py-10">
        <div className="max-w-7xl mx-auto px-4 space-y-10">
          <div className="bg-white rounded-3xl p-2 md:p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              <div className="relative min-h-70 md:min-h-87 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60">
                {hotel.images && hotel.images.length > 0 ? (
                  <Image
                    src={hotel.images[0]}
                    alt={hotel.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                    No Image Available
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between space-y-4 bg-teal-100/70 p-3 md:p-6 rounded-2xl border border-slate-200/50">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-500 flex items-center gap-2">
                      <Info size={18} className="text-teal-600" />
                      Hotel Information
                    </h3>

                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                      <Star className="fill-amber-400 text-amber-400" size={16} />
                      <span className="text-sm font-bold text-slate-800">
                        {overallRating > 0 ? overallRating.toFixed(1) : "N/A"}
                      </span>
                      {totalReviews > 0 && (
                        <span className="text-xs text-slate-400 font-medium">
                          ({totalReviews})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-slate-600">
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-wider">
                      {hotel.name}
                    </h1>
                    <div className="flex items-start gap-2.5">
                      <MapPin size={18} className="text-teal-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-700 block text-xs">Address & City</span>
                        <span>{hotel.address || "N/A"}, {hotel.city}</span>
                      </div>
                    </div>

                    {(hotel.phone || hotel.contactNumber) && (
                      <div className="flex items-start gap-2.5">
                        <Phone size={18} className="text-teal-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-700 block text-xs">Contact Phone</span>
                          <a
                            href={`tel:${hotel.phone || hotel.contactNumber}`}
                            className="hover:text-teal-600 hover:underline tracking-wider"
                          >
                            {hotel.phone || hotel.contactNumber}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {hotel.description && (
                    <div className="pt-3 border-t border-slate-200/60">
                      <span className="font-semibold text-slate-700 block text-xs mb-1">About</span>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-6">
                        {hotel.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Rooms in this Hotel</h2>
            {rooms.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
                No rooms listed under this hotel yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {rooms.map((room: any) => (
                  <RoomCard
                    key={room._id}
                    id={room._id}
                    hotelName={hotel.name}
                    city={hotel.city}
                    address={hotel.address}
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}

