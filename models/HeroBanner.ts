import mongoose, { Schema, models, model } from "mongoose";

export interface IHeroBanner {
  badgeText: string;
  headingText: string;
  highlightText: string;
  subtitleText: string;
  imageUrl: string;
  roomsBtnText: string;
  hotelsBtnText: string;
  metricStays: string;
  metricRating: string;
  metricBadgeText: string;
}

const HeroBannerSchema = new Schema<IHeroBanner>(
  {
    badgeText: { type: String, default: "The Ultimate Luxury & Comfort Stay" },
    headingText: { type: String, default: "Find Your Perfect" },
    highlightText: { type: String, default: "Sanctuary" },
    subtitleText: {
      type: String,
      default:
        "Discover handpicked luxury hotels, boutique rooms, and serene resorts with seamless instant booking and verified guest reviews.",
    },
    imageUrl: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80",
    },
    roomsBtnText: { type: String, default: "Explore Rooms" },
    hotelsBtnText: { type: String, default: "Browse Hotels" },
    metricStays: { type: String, default: "500+" },
    metricRating: { type: String, default: "4.9/5" },
    metricBadgeText: { type: String, default: "100% Verified Bookings" },
  },
  { timestamps: true },
);

const HeroBanner =
  models.HeroBanner || model<IHeroBanner>("HeroBanner", HeroBannerSchema);
export default HeroBanner;
