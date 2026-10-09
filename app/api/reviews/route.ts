// app/api/reviews/route.ts

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import Booking from "@/models/Booking";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, rating, comment } = await req.json();

    const ratingNum = Number(rating);
    const text = typeof comment === "string" ? comment.trim() : "";

    if (!bookingId || !mongoose.isValidObjectId(bookingId)) {
      return NextResponse.json(
        { message: "Invalid booking." },
        { status: 400 },
      );
    }
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5." },
        { status: 400 },
      );
    }
    if (!text) {
      return NextResponse.json(
        { message: "Please write a short review." },
        { status: 400 },
      );
    }
    if (text.length > 1000) {
      return NextResponse.json(
        { message: "Review is too long (max 1000 characters)." },
        { status: 400 },
      );
    }

    await connectDB();

    // session.user.id may be missing – fall back to an email lookup
    let userId: string | undefined = (session.user as any).id;
    if (!userId && session.user.email) {
      const u: any = await User.findOne({ email: session.user.email })
        .select("_id")
        .lean();
      userId = u?._id?.toString();
    }
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // The flat comes from the booking in the database, never from the browser
    const booking: any = await Booking.findOne({
      _id: bookingId,
      user: userId,
    }).select("flat status");
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 },
      );
    }

    // "completed" = the vendor marked the flat as SOLD to this buyer
    if (booking.status !== "completed") {
      return NextResponse.json(
        {
          message: "You can review a flat only after it has been sold to you.",
        },
        { status: 400 },
      );
    }

    const existing = await Review.findOne({
      user: userId,
      flat: booking.flat,
    }).select("_id");
    if (existing) {
      return NextResponse.json(
        { message: "You have already reviewed this flat." },
        { status: 400 },
      );
    }

    const review = await Review.create({
      user: userId,
      flat: booking.flat,
      booking: booking._id,
      rating: ratingNum,
      comment: text,
    });

    return NextResponse.json(
      { success: true, message: "Review posted successfully!", review },
      { status: 201 },
    );
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { message: "You have already reviewed this flat." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
