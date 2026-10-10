// components/sections/HeroBanner.tsx

import Image from "next/image";
import { ShieldCheck, Star, Building2, Users } from "lucide-react";
import connectDB from "@/lib/mongodb";
import HeroBannerModel from "@/models/HeroBanner";
import Room from "@/models/Flat";
import Review from "@/models/Review";

export default async function HeroBanner() {
  let bannerData;
  let totalStaysCount = 0;
  let averageRatingFormatted = "4.9/5";

  try {
    await connectDB();

    bannerData = await HeroBannerModel.findOne().lean();

    // Count exact rooms directly
    totalStaysCount = await Room.countDocuments();

    // Multi-source Rating Calculation
    let totalScore = 0;
    let totalRatingsCount = 0;

    // Source A
    try {
      const reviewStats = await Review.aggregate([
        { $match: { rating: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: null,
            avg: { $avg: { $toDouble: "$rating" } },
            count: { $sum: 1 },
          },
        },
      ]);
      if (reviewStats.length > 0 && reviewStats[0].count > 0) {
        totalScore += reviewStats[0].avg * reviewStats[0].count;
        totalRatingsCount += reviewStats[0].count;
      }
    } catch {
    }

    // Calculate dynamic average 
    if (totalRatingsCount > 0) {
      const computedAverage = (totalScore / totalRatingsCount).toFixed(1);
      averageRatingFormatted = `${computedAverage}/5`;
    }
  } catch (error) {
    console.error("Failed to load Hero Banner metrics:", error);
  }

  const badgeText = bannerData?.badgeText || "The Ultimate Luxury & Comfort Stay";
  const headingText = bannerData?.headingText || "Find Your Perfect";
  const highlightText = bannerData?.highlightText || "Sanctuary";
  const subtitleText =
    bannerData?.subtitleText ||
    "Discover handpicked luxury hotels, boutique rooms, and serene resorts with seamless instant booking and verified guest reviews.";
  const imageUrl =
    bannerData?.imageUrl ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80";
  const roomsBtnText = bannerData?.roomsBtnText || "Explore Rooms";
  const hotelsBtnText = bannerData?.hotelsBtnText || "Browse Hotels";
  const metricBadgeText = bannerData?.metricBadgeText || "100% Verified Bookings";

  const features = [
    { icon: ShieldCheck, title: metricBadgeText, desc: "Only genuine & trusted properties" },
    { icon: Building2, title: `${totalStaysCount}+ Flats Listed`, desc: "Homes across the country" },
    { icon: Star, title: `${averageRatingFormatted} User Rating`, desc: "Rated by real buyers" },
    { icon: Users, title: "Expert Guidance", desc: "Professional support at every step" },
  ];

  return (
    <section className="relative w-full -top-4 md:-top-10 bg-white sm:border sm:border-slate-200/80 sm:shadow-sm overflow-hidden md:rounded-3xl">
      {/* Curved edge for the image (shape only, renders nothing by itself) */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <clipPath id="hero-curve" clipPathUnits="objectBoundingBox">
            <path d="M0.2,0 C0,0.25 0.22,0.5 0.12,0.72 C0.07,0.86 0.1,0.95 0.04,1 L1,1 L1,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Top: text on the left, image on the right (same layout on mobile and desktop) */}
      <div className="relative flex items-center min-h-55 sm:min-h-90 lg:min-h-100">
        {/* Image */}
        <div
          className="absolute inset-y-0 right-0 w-[50%] sm:w-[52%]"
          style={{ clipPath: "url(#hero-curve)" }}
        >
          <Image
            src={imageUrl}
            alt="Luxury Hotel Hero"
            fill
            priority
            className="object-cover sm:object-fill"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 w-[62%] sm:w-[55%] px-4 sm:px-10 lg:px-14 py-6 sm:py-12 lg:py-16 flex flex-col">
          <p className="text-[8px] sm:text-xs font-bold tracking-[0.2em] text-green-700 uppercase">
            {badgeText}
          </p>

          <h1 className="mt-2 sm:mt-4 text-[26px] leading-[1.1] sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#17382f]">
            {headingText}
            <span className="block text-green-700">{highlightText}</span>
          </h1>

          <p className="mt-2 sm:mt-5 text-[10px] sm:text-base text-slate-500 max-w-md leading-relaxed">
            {subtitleText}
          </p>
        </div>
      </div>

      {/* Bottom: 4 feature columns (same on mobile and desktop) */}
      <div className="grid grid-cols-4 gap-2 sm:gap-6 px-3 sm:px-10 lg:px-14 py-4 sm:py-7 border-t border-slate-100">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={desc} className="flex flex-col items-start gap-1.5 sm:gap-2.5">
            <div className="h-7 w-7 sm:h-11 sm:w-11 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
              <Icon size={14} className="sm:hidden" />
              <Icon size={20} className="hidden sm:block" />
            </div>
            <div>
              <p className="text-[9px] sm:text-sm font-bold text-[#17382f] leading-tight">{title}</p>
              <p className="mt-0.5 text-[7px] sm:text-xs text-slate-500 leading-snug">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
