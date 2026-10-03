// app/api/reviews/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import Booking from "@/models/Booking";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, roomId, hotelId, rating, comment } = await req.json();

    if (!bookingId || !roomId || !hotelId || !rating || !comment) {
      return NextResponse.json(
        { message: "Missing review fields" },
        { status: 400 },
      );
    }

    await connectDB();

    const userId = (session.user as any).id;

    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    if (!["completed", "checked_out"].includes(booking.status)) {
      return NextResponse.json(
        {
          message: "Review is allowed only after check-out or stay completion.",
        },
        { status: 400 },
      );
    }

    const existingReview = await Review.findOne({
      user: userId,
      room: roomId,
      hotel: hotelId,
    });

    if (existingReview) {
      return NextResponse.json(
        { message: "You have already reviewed this stay." },
        { status: 400 },
      );
    }

    const newReview = await Review.create({
      user: userId,
      room: roomId,
      hotel: hotelId,
      rating: Number(rating),
      comment,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Review posted successfully!",
        review: newReview,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
