
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, MapPin, Star } from "lucide-react";
import connectDB from "@/lib/mongodb";
import HeroBannerModel from "@/models/HeroBanner";
import Hotel from "@/models/Property";
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

    // Source B
    try {
      const hotelStats = await Hotel.aggregate([
        { $match: { rating: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: null,
            avg: { $avg: { $toDouble: "$rating" } },
            count: { $sum: 1 },
          },
        },
      ]);
      if (hotelStats.length > 0 && hotelStats[0].count > 0) {
        totalScore += hotelStats[0].avg * hotelStats[0].count;
        totalRatingsCount += hotelStats[0].count;
      }
    } catch {
      // Ignore if Hotel rating isn't present
    }

    // Source C
    try {
      const roomStats = await Room.aggregate([
        { $match: { rating: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: null,
            avg: { $avg: { $toDouble: "$rating" } },
            count: { $sum: 1 },
          },
        },
      ]);
      if (roomStats.length > 0 && roomStats[0].count > 0) {
        totalScore += roomStats[0].avg * roomStats[0].count;
        totalRatingsCount += roomStats[0].count;
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

  return (
    <section className="relative w-full h-screen md:h-auto -top-4 md:-top-10 bg-slate-500 text-white overflow-hidden md:rounded-3xl">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-90">
        <Image
          src={imageUrl}
          alt="Luxury Hotel Hero"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black-800/80 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-6 md:py-15 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold w-fit mb-6 backdrop-blur-md">
          <Star size={14} className="fill-teal-400 text-teal-400" />
          <span>{badgeText}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-2xl leading-tight">
          {headingText} <span className="text-teal-400">{highlightText}</span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
          {subtitleText}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <Link
            href="/rooms"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl btn-primary text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-teal-600/30 active:scale-[0.98]"
          >
            <span>{roomsBtnText}</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/hotels"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700/60 backdrop-blur-md transition-all active:scale-[0.98]"
          >
            <MapPin size={16} className="text-teal-400" />
            <span>{hotelsBtnText}</span>
          </Link>
        </div>

        {/* Dynamic Metric Display */}
        <div className="mt-5 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-lg">
          <div>
            <p className="text-2xl font-bold text-white">{totalStaysCount}+</p>
            <p className="text-xs text-slate-400 mt-0.5">Luxury Stays</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{averageRatingFormatted}</p>
            <p className="text-xs text-slate-400 mt-0.5">User Rating</p>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center gap-2 text-slate-300 text-xs">
            <ShieldCheck size={20} className="text-teal-400 shrink-0" />
            <span>{metricBadgeText}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

