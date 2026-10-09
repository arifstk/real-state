// components/sections/CustomerReviewsSection.tsx

import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import Flat from "@/models/Flat";
import User from "@/models/User";
import CustomerReviewsCarousel, { ReviewItem } from "../CustomerReviewsCarousel";
// import CustomerReviewsCarousel, { ReviewItem } from "./CustomerReviewsCarousel";

interface CustomerReviewsSectionProps {
  limit?: number;
  title?: string;
}

// Computed on the server so the text is identical on server and client (no hydration mismatch)
function timeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, "year"],
    [60 * 60 * 24 * 30, "month"],
    [60 * 60 * 24 * 7, "week"],
    [60 * 60 * 24, "day"],
    [60 * 60, "hour"],
    [60, "minute"],
  ];
  for (const [secs, label] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${label}${value > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

export default async function CustomerReviewsSection({
  limit = 10,
  title = "What our customers say",
}: CustomerReviewsSectionProps) {
  await connectDB();

  // Make sure these models are registered before populate()
  const _register = [User, Flat];
  void _register;

  // `flat` filter skips old hotel-era reviews
  const data: any[] = await Review.find({ flat: { $exists: true } })
    .populate("user", "name image")
    .populate("flat", "title")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const reviews: ReviewItem[] = data
    .filter((r) => r.comment)
    .map((r) => ({
      id: r._id.toString(),
      name: r.user?.name || "Verified Buyer",
      image: r.user?.image || undefined,
      rating: r.rating,
      comment: r.comment,
      timeAgo: timeAgo(r.createdAt),
      flatTitle: r.flat?.title,
    }));

  if (reviews.length === 0) return null;

  return (
    <section className="w-full px-2 space-y-8">
      <h2 className="text-center text-2xl font-extrabold text-slate-800 tracking-tight">{title}</h2>
      <CustomerReviewsCarousel reviews={reviews} />
    </section>
  );
}

