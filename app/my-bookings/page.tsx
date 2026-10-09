// app/my-bookings/page.tsx

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Flat from "@/models/Flat";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import FlatBookingItemCard from "@/components/FlatBookingItemCard";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/my-bookings");
  }

  await connectDB();

  // Make sure these models are registered before populate()
  const _register = [Flat, User];
  void _register;

  // session.user.id may be missing – fall back to an email lookup
  let userId: string | undefined = (session.user as any).id;
  if (!userId && session.user.email) {
    const u: any = await User.findOne({ email: session.user.email }).select("_id").lean();
    userId = u?._id?.toString();
  }
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    redirect("/login?callbackUrl=/my-bookings");
  }

  const userBookingsData = await Booking.find({ user: new mongoose.Types.ObjectId(userId) })
    .populate({
      path: "flat",
      select: "_id title flatType city address images isSold",
    })
    .populate({
      path: "seller",
      select: "name mobile",
    })
    .sort({ createdAt: -1 })
    .lean();

  const bookings = JSON.parse(JSON.stringify(userBookingsData));

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">My Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your flat booking requests and site visits.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
            <p className="text-slate-500 text-sm">
              You haven&apos;t made any booking requests yet.
            </p>
            <Link
              href="/flats"
              className="inline-block px-5 py-2.5 bg-teal-600 text-white font-semibold text-xs rounded-xl hover:bg-teal-700 transition"
            >
              Explore Flats
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: any) => (
              <FlatBookingItemCard key={booking._id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

