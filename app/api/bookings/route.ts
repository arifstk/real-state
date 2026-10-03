// app/api/bookings/route.ts

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Hotel from "@/models/Hotel";
import Room from "@/models/Room";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendBookingEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Login/Authentication required to book a room" },
        { status: 401 },
      );
    }

    const { roomId, hotelId, checkIn, checkOut, totalPrice, paymentType } =
      await req.json();

    if (
      !roomId ||
      !hotelId ||
      !checkIn ||
      !checkOut ||
      !totalPrice ||
      !paymentType
    ) {
      return NextResponse.json(
        { message: "All booking details including payment type are required" },
        { status: 400 },
      );
    }

    await connectDB();

    const newBooking = await Booking.create({
      user: session.user.id,
      hotel: hotelId,
      room: roomId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      totalPrice,
      paymentType,
      status: "pending",
      paymentStatus: paymentType === "direct" ? "unpaid" : "pending",
    });

    await Room.findByIdAndUpdate(roomId, { isAvailable: true });

    const hotel = await Hotel.findById(hotelId).select("name");

    // Send 1st Email: Booking Placed/Confirmed
    try {
      await sendBookingEmail("CONFIRMED", {
        to: session.user.email!,
        userName: session.user.name || "Valued Customer",
        hotelName: hotel?.name || "our hotel",
        checkIn,
        checkOut,
        totalPrice,
        bookingId: newBooking._id.toString(),
      });
    } catch (emailErr) {
      console.error("Failed to send booking confirmation email:", emailErr);
    }

    return NextResponse.json(
      {
        message: "Booking successful!",
        booking: newBooking,
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
