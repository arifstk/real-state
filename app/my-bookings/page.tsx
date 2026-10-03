

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Review from "@/models/Review";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import BookingItemCard from "@/components/BookingItemCard";
import mongoose from "mongoose";

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/my-bookings");
  }

  await connectDB();

  const userId = (session.user as any).id;
  
  // Convert string ID to ObjectId for reliable MongoDB queries
  const targetUserId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  // Fetch bookings for the logged-in user
  const userBookingsData = await Booking.find({ user: targetUserId })
    .populate({
      path: "hotel",
      select: "_id name city images address",
    })
    .populate({
      path: "room",
      select: "_id roomType images pricePerNight",
    })
    .sort({ createdAt: -1 })
    .lean();

  // Fetch all user reviews querying ObjectId & selecting all matching reference keys
  const userReviews = await Review.find({ user: targetUserId })
    .select("booking bookingId room hotel")
    .lean();

  // Build a Set of all reviewed booking and room ID strings
  const reviewedKeys = new Set(
    userReviews
      .flatMap((rev: any) => [
        rev.booking?.toString(),
        rev.bookingId?.toString(),
        rev.room?.toString(),
      ])
      .filter(Boolean)
  );

  // Attach isReviewed boolean flag
  const formattedBookings = userBookingsData.map((booking: any) => {
    const bookingIdStr = booking._id.toString();
    const roomIdStr = booking.room?._id
      ? booking.room._id.toString()
      : booking.room?.toString();

    return {
      ...booking,
      isReviewed:
        reviewedKeys.has(bookingIdStr) ||
        (roomIdStr ? reviewedKeys.has(roomIdStr) : false),
    };
  });

  const bookings = JSON.parse(JSON.stringify(formattedBookings));

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">My Bookings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your past and upcoming hotel reservations.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-4">
            <p className="text-slate-500 text-sm">
              You haven't made any bookings yet.
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-teal-600 text-white font-semibold text-xs rounded-xl hover:bg-teal-700 transition"
            >
              Explore Hotels
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking: any) => (
              <BookingItemCard key={booking._id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

