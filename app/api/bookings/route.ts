// app/api/bookings/route.ts

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Flat from "@/models/Flat";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
// import { sendBookingEmail } from "@/lib/mail"; // TODO: update the mail template for flats (see notes)

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Please log in to book a flat." },
        { status: 401 },
      );
    }

    const {
      flat: flatId,
      name,
      phone,
      email,
      visitDate,
      message,
    } = await req.json();

    if (!flatId || !mongoose.isValidObjectId(flatId)) {
      return NextResponse.json({ message: "Invalid flat." }, { status: 400 });
    }
    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { message: "Name and phone number are required." },
        { status: 400 },
      );
    }

    let visit: Date | undefined;
    if (visitDate) {
      visit = new Date(visitDate);
      if (Number.isNaN(visit.getTime())) {
        return NextResponse.json(
          { message: "Invalid visit date." },
          { status: 400 },
        );
      }
    }

    await connectDB();

    let userId: string | undefined = (session.user as any).id;
    if (!userId && session.user.email) {
      const dbUser = await User.findOne({ email: session.user.email }).select(
        "_id",
      );
      userId = dbUser?._id?.toString();
    }
    if (!userId) {
      return NextResponse.json(
        { message: "Could not identify your account. Please log in again." },
        { status: 401 },
      );
    }

    const flat: any = await Flat.findById(flatId).select(
      "title price discountPercent vendor isAvailable",
    );
    if (!flat || flat.isAvailable === false) {
      return NextResponse.json(
        { message: "This flat is no longer available." },
        { status: 409 },
      );
    }

    const totalPrice = flat.discountPercent
      ? flat.price * (1 - flat.discountPercent / 100)
      : flat.price;

    const newBooking = await Booking.create({
      user: userId,
      seller: flat.vendor,
      flat: flat._id,
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || session.user.email || undefined,
      visitDate: visit,
      message: message?.trim() || undefined,
      totalPrice,
      status: "pending",
      paymentStatus: "pending",
    });

    return NextResponse.json(
      {
        message: "Booking request sent!",
        bookingId: newBooking._id,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
