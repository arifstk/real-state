
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { cache } from "react";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Flat";
import Hotel from "@/models/Property";
import User from "@/models/User";
import Review from "@/models/Review";
import Booking from "@/models/Booking";
import RoomImageGallery from "@/components/RoomImageGallery";
import RoomBookingForm from "./RoomBookingForm";
import { ChevronRight, CheckCircle2, Star, MapPin, Phone, Home } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const FALLBACK_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SingleRoomPageProps {
  params: Promise<{ id: string }>;
}

const getRoomPageData = cache(async (id: string) => {
  await connectDB();

  const _ensureModelsRegistered = [Hotel, User];

  const [roomData, reviewsData, activeBooking] = await Promise.all([
    Room.findById(id).populate("hotel", "name city address phone").lean(),
    Review.find({ room: id }).populate("user", "name").sort({ createdAt: -1 }).lean(),
    Booking.findOne({
      room: id,
      status: { $nin: ["cancelled", "completed"] },
    }).select("_id").lean(),
  ]);

  if (!roomData) return null;

  const room = {
    ...JSON.parse(JSON.stringify(roomData)),
    isAvailable: !activeBooking,
  };

  const reviews = JSON.parse(JSON.stringify(reviewsData));

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews
    : 0;

  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r: any) => Math.round(r.rating) === star).length,
  }));

  return { room, reviews, totalReviews, avgRating, starCounts };
});

export async function generateMetadata({ params }: SingleRoomPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getRoomPageData(id);

  if (!data || !data.room) {
    return { title: "Room Not Found" };
  }

  const { room } = data;
  const canonicalUrl = `${SITE_URL}/rooms/${room._id}`;
  const description = room.description
    ? room.description.slice(0, 155)
    : `Book the ${room.roomType} at ${room.hotel?.name || 'Luxury Stay'}. Best rates, modern amenities, and instant reservation.`;

  const mainImage = room.images?.[0] || FALLBACK_OG_IMAGE;
  const effectivePrice = room.discountPercent
    ? room.pricePerNight * (1 - room.discountPercent / 100)
    : room.pricePerNight;

  return {
    title: `${room.roomType} - ${room.hotel?.name || "Luxury Stay"}`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${room.roomType} | ${room.hotel?.name || "Luxury Stay"}`,
      description,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: room.roomType,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${room.roomType} | ${room.hotel?.name || "Luxury Stay"}`,
      description,
      images: [mainImage],
    },
    other: {
      "product:price:amount": effectivePrice.toFixed(2),
      "product:price:currency": "USD",
      "product:availability": room.isAvailable ? "in stock" : "out of stock",
    },
  };
}

export default async function SingleRoomPage({ params }: SingleRoomPageProps) {
  const { id } = await params;
  const data = await getRoomPageData(id);

  if (!data) {
    notFound();
  }

  const { room, reviews, totalReviews, avgRating, starCounts } = data;
  const canonicalUrl = `${SITE_URL}/rooms/${room._id}`;
  const effectivePrice = room.discountPercent
    ? room.pricePerNight * (1 - room.discountPercent / 100)
    : room.pricePerNight;

  const roomJsonLd = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.roomType,
    description: room.description,
    image: room.images ?? [],
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "USD",
      price: effectivePrice.toFixed(2),
      availability: room.isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(avgRating > 0 && totalReviews > 0
      ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: avgRating.toFixed(1),
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
      { "@type": "ListItem", position: 2, name: "Rooms", item: `${SITE_URL}/rooms` },
      { "@type": "ListItem", position: 3, name: room.roomType, item: canonicalUrl },
    ],
  };

  return (
    <>
      <Script
        id="room-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(roomJsonLd) }}
      />
      <Script
        id="room-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-slate-50/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-slate-800 transition">
              <Home size={14} />
            </Link>
            <ChevronRight size={14} />
            <Link href="/rooms" className="hover:text-slate-800 transition">
              Rooms
            </Link>
            <ChevronRight size={14} />
            <span className="text-slate-800 font-semibold">{room.roomType}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <RoomImageGallery
                images={room.images || []}
                roomType={room.roomType}
                discountPercent={room.discountPercent}
              />
            </div>

            <div className="lg:col-span-7 space-y-8">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                    {room.hotel?.name || "Luxury Stay"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${room.isAvailable
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                      }`}
                  >
                    {room.isAvailable ? "Available" : "Booked"}
                  </span>
                </div>

                <h1 className="text-3xl font-extrabold text-slate-800 mt-1">
                  {room.roomType}
                </h1>
                <div className="flex items-center gap-1">
                  <MapPin size={14} className="text-xs text-slate-400" />
                  {room.hotel?.address && (
                    <p className="text-xs text-slate-400 mt-0.5">{room.hotel.address}</p>
                  )}
                  <span className="text-xs text-slate-300 mt-0.5">|</span>
                  {room.hotel?.city && (
                    <p className="text-xs text-slate-400 mt-0.5">{room.hotel.city}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 mt-1">
                  <Phone size={14} className="text-xs text-slate-400" />
                  {room.hotel?.phone && (
                    <a
                      href={`tel:${room.hotel.phone}`}
                      className="text-xs text-slate-400 tracking-wider hover:text-teal-600 hover:underline transition-colors"
                    >
                      {room.hotel.phone}
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800">Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {room.description || "Enjoy a luxurious stay with world-class facilities and maximum comfort."}
                </p>
              </div>

              {room.amenities && room.amenities.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-200/60">
                  <h3 className="text-sm font-bold text-slate-800">Room Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {room.amenities.map((amenity: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white p-3 rounded-xl border border-slate-200/70"
                      >
                        <CheckCircle2 size={16} className="text-teal-500 shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200/60">
                <RoomBookingForm
                  roomId={room._id}
                  hotelId={room.hotel?._id || room.hotel}
                  pricePerNight={room.pricePerNight}
                  discountPercent={room.discountPercent}
                  isAvailable={room.isAvailable}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-200/60">
            <h3 className="text-lg font-bold text-slate-800">Customer Reviews</h3>

            {totalReviews === 0 ? (
              <p className="text-xs text-slate-400 bg-white p-4 rounded-2xl border border-slate-200/70">
                No reviews posted for this room yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4 text-center">
                  <div>
                    <div className="text-4xl font-extrabold text-slate-900">
                      {avgRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center items-center gap-1 my-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={
                            star <= Math.round(avgRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200 fill-slate-200"
                          }
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-slate-100">
                    {starCounts.map(({ star, count }) => {
                      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="w-3 text-right font-semibold">{star}</span>
                          <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
                          <div className="grow bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-400 h-full rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-3 text-left font-medium text-slate-400">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="md:col-span-7 space-y-3">
                  {reviews.map((rev: any) => {
                    const initial = rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : "G";
                    const reviewDate = rev.createdAt
                      ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                      : "Verified Guest";

                    return (
                      <div
                        key={rev._id}
                        className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                              {initial}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">
                                {rev.user?.name || "Guest User"}
                              </h4>
                              <span className="text-[11px] text-slate-400 block">{reviewDate}</span>
                            </div>
                          </div>
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                            ✓ Verified Purchase
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={13}
                              className={
                                star <= rev.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200 fill-slate-200"
                              }
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

