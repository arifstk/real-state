// app/rooms/page.tsx

import { Metadata } from "next";
import Script from "next/script";
import { cache } from "react";
import connectDB from "@/lib/mongodb";
import Hotel from "@/models/Property";
import Room from "@/models/Flat";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import RoomsFilterClient from "./RoomsFilterClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Explore Rooms | Best Rates & Instant Booking",
  description:
    "Browse luxury and budget-friendly rooms across top destinations. Compare prices, amenities, availability, and guest reviews.",
  alternates: {
    canonical: `${SITE_URL}/rooms`,
  },
  openGraph: {
    title: "Explore Rooms | Best Rates & Instant Booking",
    description:
      "Browse luxury and budget-friendly rooms across top destinations. Compare prices, amenities, availability, and guest reviews.",
    url: `${SITE_URL}/rooms`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Available Rooms",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Rooms | Best Rates & Instant Booking",
    description:
      "Browse luxury and budget-friendly rooms across top destinations. Compare prices, amenities, availability, and guest reviews.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

// Cached server database fetcher using React cache()
const getRoomsListingData = cache(async () => {
  await connectDB();

  if (!Hotel) {
    console.log("Hotel model initialized");
  }

  // Query database for base room data on the server
  const roomsData = await Room.find()
    .populate("hotel", "name city address phone")
    .sort({ createdAt: -1 })
    .lean();

  const roomIds = roomsData.map((room) => room._id);

  // Fetch active bookings and review stats concurrently
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

  const bookedRoomIds = new Set(activeBookings.map((b) => b.room.toString()));

  const reviewMap = new Map(
    reviewStats.map((stat) => [
      stat._id.toString(),
      {
        rating: Math.round(stat.averageRating * 10) / 10,
        reviewCount: stat.reviewCount,
      },
    ])
  );

  // Transform database models to clean JSON objects for client consumption
  const initialRooms = roomsData.map((room: any) => {
    const roomIdStr = room._id.toString();
    const stats = reviewMap.get(roomIdStr);

    return {
      _id: roomIdStr,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      discountPercent: room.discountPercent,
      amenities: room.amenities || [],
      images: room.images || [],
      isAvailable: !bookedRoomIds.has(roomIdStr),
      hotel: room.hotel
        ? {
          name: room.hotel.name,
          city: room.hotel.city,
          address: room.hotel.address,
          phone: room.hotel.phone,
        }
        : undefined,
      city: room.hotel?.city,
      address: room.hotel?.address,
      rating: stats?.rating ?? room.rating ?? 0,
      reviewCount: stats?.reviewCount ?? room.reviewCount ?? 0,
    };
  });

  return initialRooms;
});

export default async function RoomsListingPage() {
  const initialRooms = await getRoomsListingData();

  const itemListingJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: initialRooms.map((room: any, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "HotelRoom",
        name: room.roomType,
        url: `${SITE_URL}/rooms/${room._id}`,
        image: room.images?.[0] || "",
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: (
            room.discountPercent
              ? room.pricePerNight * (1 - room.discountPercent / 100)
              : room.pricePerNight
          ).toFixed(2),
          availability: room.isAvailable
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Rooms", item: `${SITE_URL}/rooms` },
    ],
  };

  return (
    <>
      <Script
        id="rooms-itemlist-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListingJsonLd) }}
      />
      <Script
        id="rooms-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <RoomsFilterClient initialRooms={initialRooms} />
    </>
  );
}

