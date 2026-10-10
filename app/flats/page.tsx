// // app/flats/page.tsx

// import { Metadata } from "next";
// import Script from "next/script";
// import { cache } from "react";
// import type { Types } from "mongoose";
// import connectDB from "@/lib/mongodb";
// import Flat from "@/models/Flat";
// import User from "@/models/User";
// import Booking from "@/models/Booking";
// import Review from "@/models/Review";
// import FlatsFilterClient, { type FlatListItem } from "./FlatsFilterClient";

// const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// export const revalidate = 0;

// const TITLE = "Explore Flats | Find Your Next Home";
// const DESCRIPTION =
//   "Browse apartments, penthouses and studio flats across Bangladesh. Compare prices, size, location, amenities and customer reviews.";

// export const metadata: Metadata = {
//   title: TITLE,
//   description: DESCRIPTION,
//   alternates: {
//     canonical: `${SITE_URL}/flats`,
//   },
//   openGraph: {
//     title: TITLE,
//     description: DESCRIPTION,
//     url: `${SITE_URL}/flats`,
//     type: "website",
//     images: [
//       {
//         url: `${SITE_URL}/og-image.jpg`,
//         width: 1200,
//         height: 630,
//         alt: "Available Flats",
//       },
//     ],
//   },
//   twitter: {
//     card: "summary_large_image",
//     title: TITLE,
//     description: DESCRIPTION,
//     images: [`${SITE_URL}/og-image.jpg`],
//   },
// };

// type LeanFlat = {
//   _id: Types.ObjectId;
//   title: string;
//   flatType: string;
//   price: number;
//   discountPercent?: number;
//   bedrooms?: number;
//   bathrooms?: number;
//   sizeSqFt?: number;
//   city: string;
//   address: string;
//   amenities?: string[];
//   images?: string[];
//   isAvailable?: boolean;
//   isSold?: boolean;
//   status?: string;
//   vendor?: { name?: string; phone?: string } | null;
// };

// type LeanBooking = { flat: { toString(): string } };

// type ReviewStat = {
//   _id: { toString(): string };
//   averageRating: number;
//   reviewCount: number;
// };

// const getFlatsListingData = cache(async (): Promise<FlatListItem[]> => {
//   await connectDB();
//   const _ensureModelsRegistered = [User];
//   void _ensureModelsRegistered;

//   const flatsData = (await Flat.find()
//     .populate("vendor", "name phone")
//     .sort({ createdAt: -1 })
//     .lean()) as unknown as LeanFlat[];

//   const flatIds: Types.ObjectId[] = flatsData.map((f) => f._id);

//   const [activeBookingsRaw, reviewStatsRaw] = await Promise.all([
//     Booking.find({
//       flat: { $in: flatIds },
//       status: { $nin: ["cancelled", "completed"] },
//     })
//       .select("flat")
//       .lean(),

//     Review.aggregate([
//       { $match: { flat: { $in: flatIds } } },
//       {
//         $group: {
//           _id: "$flat",
//           averageRating: { $avg: "$rating" },
//           reviewCount: { $sum: 1 },
//         },
//       },
//     ]),
//   ]);

//   const activeBookings = activeBookingsRaw as unknown as LeanBooking[];
//   const reviewStats = reviewStatsRaw as ReviewStat[];

//   const bookedFlatIds = new Set(activeBookings.map((b) => b.flat.toString()));

//   const reviewMap = new Map(
//     reviewStats.map((stat) => [
//       stat._id.toString(),
//       {
//         rating: Math.round(stat.averageRating * 10) / 10,
//         reviewCount: stat.reviewCount,
//       },
//     ]),
//   );

//   return flatsData.map((flat) => {
//     const id = flat._id.toString();
//     const stats = reviewMap.get(id);
//     const isSold = flat.isSold === true || flat.status === "sold";

//     return {
//       _id: id,
//       title: flat.title,
//       flatType: flat.flatType,
//       price: flat.price,
//       discountPercent: flat.discountPercent ?? 0,
//       bedrooms: flat.bedrooms ?? 0,
//       bathrooms: flat.bathrooms ?? 0,
//       sizeSqFt: flat.sizeSqFt ?? 0,
//       city: flat.city,
//       address: flat.address,
//       amenities: flat.amenities ?? [],
//       images: flat.images ?? [],
//       isSold,
//       isAvailable:
//         !isSold && flat.isAvailable !== false && !bookedFlatIds.has(id),
//       vendorName: flat.vendor?.name,
//       rating: stats?.rating ?? 0,
//       reviewCount: stats?.reviewCount ?? 0,
//     };
//   });
// });

// const toJsonLd = (obj: unknown) => JSON.stringify(obj).replace(/</g, "\\u003c");

// export default async function FlatsListingPage() {
//   const initialFlats = await getFlatsListingData();

//   const itemListingJsonLd = {
//     "@context": "https://schema.org",
//     "@type": "ItemList",
//     itemListElement: initialFlats.map((flat, index) => {
//       const effectivePrice = flat.discountPercent
//         ? flat.price * (1 - flat.discountPercent / 100)
//         : flat.price;

//       return {
//         "@type": "ListItem",
//         position: index + 1,
//         item: {
//           "@type": "Apartment",
//           name: flat.title,
//           url: `${SITE_URL}/flats/${flat._id}`,
//           image: flat.images[0] || "",
//           numberOfBedrooms: flat.bedrooms,
//           numberOfBathroomsTotal: flat.bathrooms,
//           address: {
//             "@type": "PostalAddress",
//             streetAddress: flat.address,
//             addressLocality: flat.city,
//             addressCountry: "BD",
//           },
//           offers: {
//             "@type": "Offer",
//             priceCurrency: "BDT",
//             price: effectivePrice.toFixed(2),
//             availability: flat.isAvailable
//               ? "https://schema.org/InStock"
//               : "https://schema.org/OutOfStock",
//           },
//         },
//       };
//     }),
//   };

//   const breadcrumbJsonLd = {
//     "@context": "https://schema.org",
//     "@type": "BreadcrumbList",
//     itemListElement: [
//       { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
//       { "@type": "ListItem", position: 2, name: "Flats", item: `${SITE_URL}/flats` },
//     ],
//   };

//   return (
//     <>
//       <Script
//         id="flats-itemlist-jsonld"
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: toJsonLd(itemListingJsonLd) }}
//       />
//       <Script
//         id="flats-breadcrumb-jsonld"
//         type="application/ld+json"
//         dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
//       />
//       <FlatsFilterClient initialFlats={initialFlats} />
//     </>
//   );
// }



// app/flats/page.tsx

import { Metadata } from "next";
import Script from "next/script";
import { cache } from "react";
import type { Types } from "mongoose";
import connectDB from "@/lib/mongodb";
import Flat from "@/models/Flat";
import User from "@/models/User";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import FlatsFilterClient, { type FlatListItem } from "./FlatsFilterClient";
import { SITE_URL } from "@/lib/seo";

const TITLE = "Flats & Apartments for Sale in Bangladesh";
const DESCRIPTION =
  "Browse apartments, penthouses and studio flats across Bangladesh. Compare prices, size, location, amenities and customer reviews.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/flats`,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/flats`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Available Flats",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

type LeanFlat = {
  _id: Types.ObjectId;
  title: string;
  flatType: string;
  price: number;
  discountPercent?: number;
  bedrooms?: number;
  bathrooms?: number;
  sizeSqFt?: number;
  city: string;
  address: string;
  amenities?: string[];
  images?: string[];
  isAvailable?: boolean;
  isSold?: boolean;
  status?: string;
  vendor?: { name?: string } | null;
};

type LeanBooking = { flat: { toString(): string } };

type ReviewStat = {
  _id: { toString(): string };
  averageRating: number;
  reviewCount: number;
};

const getFlatsListingData = cache(async (): Promise<FlatListItem[]> => {
  await connectDB();
  const _ensureModelsRegistered = [User];
  void _ensureModelsRegistered;

  const flatsData = (await Flat.find()
    .populate("vendor", "name")
    .sort({ createdAt: -1 })
    .lean()) as unknown as LeanFlat[];

  const flatIds: Types.ObjectId[] = flatsData.map((f) => f._id);

  const [activeBookingsRaw, reviewStatsRaw] = await Promise.all([
    Booking.find({
      flat: { $in: flatIds },
      status: "confirmed",
    })
      .select("flat")
      .lean(),

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

  const activeBookings = activeBookingsRaw as unknown as LeanBooking[];
  const reviewStats = reviewStatsRaw as ReviewStat[];

  const bookedFlatIds = new Set(activeBookings.map((b) => b.flat.toString()));

  const reviewMap = new Map(
    reviewStats.map((stat) => [
      stat._id.toString(),
      {
        rating: Math.round(stat.averageRating * 10) / 10,
        reviewCount: stat.reviewCount,
      },
    ]),
  );

  return flatsData.map((flat) => {
    const id = flat._id.toString();
    const stats = reviewMap.get(id);
    const isSold = flat.isSold === true || flat.status === "sold";

    return {
      _id: id,
      title: flat.title,
      flatType: flat.flatType,
      price: flat.price,
      discountPercent: flat.discountPercent ?? 0,
      bedrooms: flat.bedrooms ?? 0,
      bathrooms: flat.bathrooms ?? 0,
      sizeSqFt: flat.sizeSqFt ?? 0,
      city: flat.city,
      address: flat.address,
      amenities: flat.amenities ?? [],
      images: flat.images ?? [],
      isSold,
      isAvailable:
        !isSold && flat.isAvailable !== false && !bookedFlatIds.has(id),
      vendorName: flat.vendor?.name,
      rating: stats?.rating ?? 0,
      reviewCount: stats?.reviewCount ?? 0,
    };
  });
});

const toJsonLd = (obj: unknown) => JSON.stringify(obj).replace(/</g, "\\u003c");

export default async function FlatsListingPage() {
  const initialFlats = await getFlatsListingData();

  // Keep the list light: position + url (+ name/image) for the first 50 flats
  const itemListingJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: initialFlats.length,
    itemListElement: initialFlats.slice(0, 50).map((flat, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/flats/${flat._id}`,
      name: flat.title,
      ...(flat.images[0] ? { image: flat.images[0] } : {}),
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Flats", item: `${SITE_URL}/flats` },
    ],
  };

  return (
    <>
      <Script
        id="flats-itemlist-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(itemListingJsonLd) }}
      />
      <Script
        id="flats-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
      />
      <FlatsFilterClient initialFlats={initialFlats} />
    </>
  );
}

