// app/flats/[id]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { cache } from "react";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Flat from "@/models/Flat";
import User from "@/models/User";
import Review from "@/models/Review";
import Booking from "@/models/Booking";
import RoomImageGallery from "@/components/RoomImageGallery";
import FlatBookingForm from "./FlatBookingForm";
import FlatEmiCalculator from "./FlatEmiCalculator";
import {
  ChevronRight,
  CheckCircle2,
  Star,
  MapPin,
  Phone,
  Home,
  BedDouble,
  Bath,
  Ruler,
  Car,
  Compass,
  Layers,
  Building2,
  MessageCircle,
  ShieldCheck,
  BadgeCheck,
  Sofa,
  Hash,
} from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const FALLBACK_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SingleFlatPageProps {
  params: Promise<{ id: string }>;
}

const formatBDT = (n: number) => `৳${Math.round(n).toLocaleString("en-BD")}`;

/** Bangladeshi numbers: 017xxxxxxxx -> 88017xxxxxxxx (needed by wa.me) */
const toWhatsAppNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `88${digits}` : digits;
};

const getFlatPageData = cache(async (id: string) => {
  // Invalid ids would throw a CastError (500) – treat them as "not found"
  if (!mongoose.isValidObjectId(id)) return null;

  await connectDB();

  // Make sure the User model is registered before populate()
  const _ensureModelsRegistered = [User];
  void _ensureModelsRegistered;

  const flatData: any = await Flat.findById(id).populate("vendor", "name mobile").lean();
  if (!flatData) return null;

  const [reviewsData, activeBooking, similarData] = await Promise.all([
    // NOTE: if your Review/Booking models now use a `flat` field, change `room` -> `flat`
    Review.find({ room: id }).populate("user", "name").sort({ createdAt: -1 }).lean(),
    // Only a CONFIRMED booking reserves the flat (pending requests don't block other buyers)
    Booking.findOne({
      flat: id,
      status: "confirmed",
    })
      .select("_id")
      .lean(),
    Flat.find({ _id: { $ne: id }, city: flatData.city, isAvailable: { $ne: false }, isSold: { $ne: true } })
      .select("title price discountPercent images city bedrooms bathrooms sizeSqFt flatType")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
  ]);

  const flat = {
    ...JSON.parse(JSON.stringify(flatData)),
    isSold: !!flatData.isSold,
    isAvailable: flatData.isAvailable !== false && !flatData.isSold && !activeBooking,
  };

  const reviews = JSON.parse(JSON.stringify(reviewsData));
  const similarFlats = JSON.parse(JSON.stringify(similarData));

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews
      : 0;

  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r: any) => Math.round(r.rating) === star).length,
  }));

  return { flat, reviews, similarFlats, totalReviews, avgRating, starCounts };
});

export async function generateMetadata({ params }: SingleFlatPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getFlatPageData(id);

  if (!data || !data.flat) {
    return { title: "Flat Not Found" };
  }

  const { flat } = data;
  const canonicalUrl = `${SITE_URL}/flats/${flat._id}`;
  const description = flat.description
    ? flat.description.slice(0, 155)
    : `${flat.flatType} for sale in ${flat.city}. ${flat.bedrooms} beds, ${flat.bathrooms} baths, ${flat.sizeSqFt} sq ft.`;

  const mainImage = flat.images?.[0] || FALLBACK_OG_IMAGE;
  const effectivePrice = flat.discountPercent
    ? flat.price * (1 - flat.discountPercent / 100)
    : flat.price;

  return {
    title: `${flat.title} - ${flat.city}`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${flat.title} | ${flat.city}`,
      description,
      url: canonicalUrl,
      type: "website",
      images: [{ url: mainImage, width: 1200, height: 630, alt: flat.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${flat.title} | ${flat.city}`,
      description,
      images: [mainImage],
    },
    other: {
      "product:price:amount": effectivePrice.toFixed(2),
      "product:price:currency": "BDT",
      "product:availability": flat.isAvailable ? "in stock" : "out of stock",
    },
  };
}

export default async function SingleFlatPage({ params }: SingleFlatPageProps) {
  const { id } = await params;
  const data = await getFlatPageData(id);

  if (!data) {
    notFound();
  }

  const { flat, reviews, similarFlats, totalReviews, avgRating, starCounts } = data;

  // Logged-in user's details, used to pre-fill the booking form
  const session = await getServerSession(authOptions);
  let currentUser: { name: string; phone: string; email: string } | null = null;
  if (session?.user?.email) {
    await connectDB();
    const dbUser: any = await User.findOne({ email: session.user.email })
      .select("name email mobile")
      .lean();
    currentUser = {
      name: dbUser?.name ?? session.user.name ?? "",
      phone: dbUser?.mobile ?? "",
      email: dbUser?.email ?? session.user.email ?? "",
    };
  }
  const canonicalUrl = `${SITE_URL}/flats/${flat._id}`;
  const hasDiscount = flat.discountPercent > 0;
  const effectivePrice = hasDiscount
    ? flat.price * (1 - flat.discountPercent / 100)
    : flat.price;
  const pricePerSqFt = flat.sizeSqFt > 0 ? effectivePrice / flat.sizeSqFt : null;
  const fullAddress = [flat.address, flat.area, flat.city].filter(Boolean).join(", ");
  const vendorPhone: string | undefined = flat.vendor?.mobile;
  const listingId = String(flat._id).slice(-6).toUpperCase();

  const flatJsonLd = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    name: flat.title,
    description: flat.description,
    image: flat.images ?? [],
    numberOfBedrooms: flat.bedrooms,
    numberOfBathroomsTotal: flat.bathrooms,
    floorSize: {
      "@type": "QuantitativeValue",
      value: flat.sizeSqFt,
      unitCode: "FTK",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: flat.address,
      addressLocality: flat.city,
      addressCountry: "BD",
    },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "BDT",
      price: effectivePrice.toFixed(2),
      availability: flat.isAvailable
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
      { "@type": "ListItem", position: 2, name: "Flats", item: `${SITE_URL}/flats` },
      { "@type": "ListItem", position: 3, name: flat.title, item: canonicalUrl },
    ],
  };

  // Escape "<" so user-entered text can never close the script tag
  const toJsonLd = (obj: unknown) => JSON.stringify(obj).replace(/</g, "\\u003c");

  // Quick-glance cards (hidden automatically when a value is missing)
  const specs = [
    { icon: BedDouble, label: "Bedrooms", value: flat.bedrooms },
    { icon: Bath, label: "Bathrooms", value: flat.bathrooms },
    { icon: Ruler, label: "Size", value: flat.sizeSqFt ? `${flat.sizeSqFt} sq ft` : null },
    { icon: Building2, label: "Balconies", value: flat.balconies ?? null },
    { icon: Layers, label: "Floor", value: flat.floorNo || null },
    { icon: Compass, label: "Facing", value: flat.facing || null },
    { icon: Car, label: "Parking", value: flat.parking ? "Available" : null },
    { icon: Sofa, label: "Furnishing", value: flat.furnishing || null },
  ].filter((s) => s.value !== null && s.value !== undefined && s.value !== "");

  // Property overview table
  const overview: { label: string; value: string | number | null }[] = [
    { label: "Property Type", value: flat.flatType || null },
    { label: "Purpose", value: "For Sale" },
    { label: "Total Area", value: flat.sizeSqFt ? `${flat.sizeSqFt} sq ft` : null },
    { label: "Price / sq ft", value: pricePerSqFt ? formatBDT(pricePerSqFt) : null },
    {
      label: "Floor",
      value: flat.floorNo ? `${flat.floorNo}${flat.totalFloors ? ` of ${flat.totalFloors}` : ""}` : null,
    },
    { label: "Facing", value: flat.facing || null },
    { label: "Furnishing", value: flat.furnishing || null },
    { label: "Year Built", value: flat.builtYear || null },
    {
      label: "Handover",
      value: flat.handoverDate
        ? new Date(flat.handoverDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : null,
    },
    { label: "Listing ID", value: `#${listingId}` },
  ].filter((o) => o.value !== null && o.value !== undefined && o.value !== "");

  return (
    <>
      <Script
        id="flat-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(flatJsonLd) }}
      />
      <Script
        id="flat-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-slate-50/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-slate-800 transition">
              <Home size={14} />
            </Link>
            <ChevronRight size={14} />
            <Link href="/flats" className="hover:text-slate-800 transition">
              Flats
            </Link>
            <ChevronRight size={14} />
            <span className="text-slate-800 font-semibold">{flat.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ───────── Main column ───────── */}
            <div className="lg:col-span-8 space-y-8">
              <RoomImageGallery
                images={flat.images || []}
                roomType={flat.title}
                discountPercent={flat.discountPercent}
              />

              {/* Title + price */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                    {flat.flatType} · For Sale
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${flat.isAvailable
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                      }`}
                  >
                    {flat.isSold ? "SOLD" : flat.isAvailable ? "Available" : "Reserved"}
                  </span>
                </div>

                <h1 className="text-3xl font-extrabold text-slate-800 mt-1">{flat.title}</h1>

                <div className="flex items-center gap-1 mt-2">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <p className="text-xs text-slate-500">{fullAddress}</p>
                </div>

                <div className="flex flex-wrap items-baseline gap-3 mt-3">
                  <span className="text-3xl font-extrabold text-teal-600">
                    {formatBDT(effectivePrice)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-sm text-slate-400 line-through">
                        {formatBDT(flat.price)}
                      </span>
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        {flat.discountPercent}% OFF
                      </span>
                    </>
                  )}
                  {pricePerSqFt && (
                    <span className="text-xs text-slate-400">
                      ≈ {formatBDT(pricePerSqFt)} / sq ft
                    </span>
                  )}
                </div>
              </div>

              {/* Key specs */}
              {specs.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {specs.map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/70"
                    >
                      <Icon size={18} className="text-teal-600 shrink-0" />
                      <div>
                        <p className="text-[11px] text-slate-400">{label}</p>
                        <p className="text-sm font-semibold text-slate-800">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800">About this flat</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {flat.description || "No description has been added for this flat yet."}
                </p>
              </div>

              {/* Property overview */}
              <div className="space-y-3 pt-4 border-t border-slate-200/60">
                <h3 className="text-sm font-bold text-slate-800">Property Overview</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
                  {overview.map(({ label, value }, i) => (
                    <div
                      key={label}
                      className={`flex items-center justify-between px-4 py-3 text-xs border-slate-100 ${i < overview.length - (overview.length % 2 === 0 ? 2 : 1) ? "border-b" : ""
                        }`}
                    >
                      <dt className="text-slate-400 font-medium">{label}</dt>
                      <dd className="font-semibold text-slate-800">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Amenities */}
              {flat.amenities && flat.amenities.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-200/60">
                  <h3 className="text-sm font-bold text-slate-800">Features &amp; Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {flat.amenities.map((amenity: string, idx: number) => (
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

              {/* Floor plan (optional field: flat.floorPlan = image url) */}
              {flat.floorPlan && (
                <div className="space-y-3 pt-4 border-t border-slate-200/60">
                  <h3 className="text-sm font-bold text-slate-800">Floor Plan</h3>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200/70">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={flat.floorPlan}
                      alt={`${flat.title} floor plan`}
                      loading="lazy"
                      className="w-full max-h-120 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Location */}
              {fullAddress && (
                <div className="space-y-3 pt-4 border-t border-slate-200/60">
                  <h3 className="text-sm font-bold text-slate-800">Location</h3>
                  <div className="rounded-2xl overflow-hidden border border-slate-200/70 bg-white">
                    <iframe
                      title={`Map of ${flat.title}`}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`}
                      className="w-full h-72 border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ───────── Sidebar ───────── */}
            <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">
              {/* Price card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">
                  Sale Price
                </p>
                <p className="text-2xl font-extrabold text-teal-600">{formatBDT(effectivePrice)}</p>
                {pricePerSqFt && (
                  <p className="text-xs text-slate-400">{formatBDT(pricePerSqFt)} per sq ft</p>
                )}
                <p className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                  <Hash size={11} /> Listing ID: {listingId}
                </p>
              </div>

              {/* Seller / agent */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center shrink-0">
                    {(flat.vendor?.name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
                      {flat.vendor?.name || "Property Owner"}
                      <BadgeCheck size={14} className="text-teal-600" />
                    </p>
                    <p className="text-[11px] text-slate-400">Listed seller / agent</p>
                  </div>
                </div>

                {vendorPhone && (
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${vendorPhone}`}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition"
                    >
                      <Phone size={14} /> Call
                    </a>
                    <a
                      href={`https://wa.me/${toWhatsAppNumber(vendorPhone)}?text=${encodeURIComponent(
                        `Hi, I'm interested in "${flat.title}" (ID #${listingId}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  </div>
                )}
              </div>

              {/* Booking request */}
              <FlatBookingForm
                flatId={flat._id}
                sellerId={flat.vendor?._id || flat.vendor}
                price={effectivePrice}
                isAvailable={flat.isAvailable}
                defaultValues={currentUser}
              />

              {/* EMI */}
              <FlatEmiCalculator price={effectivePrice} />

              <p className="flex items-start gap-2 text-[11px] text-slate-400 px-1">
                <ShieldCheck size={14} className="text-teal-600 shrink-0 mt-px" />
                Always verify ownership papers and visit the property before making any payment.
              </p>
            </aside>
          </div>

          {/* Reviews */}
          <div className="space-y-4 pt-4 border-t border-slate-200/60">
            <h3 className="text-lg font-bold text-slate-800">Buyer Reviews</h3>

            {totalReviews === 0 ? (
              <p className="text-xs text-slate-400 bg-white p-4 rounded-2xl border border-slate-200/70">
                No reviews posted for this flat yet.
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
                      : "Verified Customer";

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
                            ✓ Verified Buyer
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
                        <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Similar flats */}
          {similarFlats.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200/60">
              <h3 className="text-lg font-bold text-slate-800">
                Similar flats in {flat.city}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {similarFlats.map((s: any) => {
                  const sPrice = s.discountPercent
                    ? s.price * (1 - s.discountPercent / 100)
                    : s.price;
                  return (
                    <Link
                      key={s._id}
                      href={`/flats/${s._id}`}
                      className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-md transition"
                    >
                      <div className="aspect-4/3 bg-slate-100 overflow-hidden">
                        {s.images?.[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.images[0]}
                            alt={s.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        )}
                      </div>
                      <div className="p-4 space-y-1.5">
                        <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">
                          {s.flatType}
                        </p>
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{s.title}</h4>
                        <p className="text-base font-extrabold text-teal-600">{formatBDT(sPrice)}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                          <span className="flex items-center gap-1">
                            <BedDouble size={12} /> {s.bedrooms}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath size={12} /> {s.bathrooms}
                          </span>
                          <span className="flex items-center gap-1">
                            <Ruler size={12} /> {s.sizeSqFt} sq ft
                          </span>
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

