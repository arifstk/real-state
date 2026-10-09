// app/api/vendor/bookings/[id]/route.ts

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Flat from "@/models/Flat";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

const ALLOWED_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { message: "Invalid booking." },
        { status: 400 },
      );
    }

    const { status } = await req.json();
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ message: "Invalid status." }, { status: 400 });
    }

    await connectDB();

    // session.user.id may be missing – fall back to an email lookup
    let userId: string | undefined = (session.user as any).id;
    if (!userId && session.user.email) {
      const u = await User.findOne({ email: session.user.email }).select("_id");
      userId = u?._id?.toString();
    }
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const booking: any = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found." },
        { status: 404 },
      );
    }

    const flat: any = await Flat.findById(booking.flat).select("vendor isSold");
    if (!flat) {
      return NextResponse.json({ message: "Flat not found." }, { status: 404 });
    }

    // Only the flat's owner (or a superadmin) can manage its bookings
    const isOwner = flat.vendor?.toString() === userId;
    const isSuperAdmin = (session.user as any).role === "superadmin";
    if (!isOwner && !isSuperAdmin) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // A completed (sold) booking is final – avoids a flat marked SOLD with an open booking
    if (booking.status === "completed") {
      return NextResponse.json(
        { message: "This flat is already sold. The booking can't be changed." },
        { status: 409 },
      );
    }
    if (status === "completed" && flat.isSold) {
      return NextResponse.json(
        { message: "This flat is already marked as sold." },
        { status: 409 },
      );
    }

    booking.status = status;
    await booking.save();

    // "completed" = deal done → flat becomes SOLD and other open requests are closed
    if (status === "completed") {
      await Flat.findByIdAndUpdate(flat._id, {
        isSold: true,
        isAvailable: false,
      });
      await Booking.updateMany(
        {
          flat: flat._id,
          _id: { $ne: booking._id },
          status: { $in: ["pending", "confirmed"] },
        },
        { status: "cancelled" },
      );
    }

    return NextResponse.json({
      message: "Booking updated.",
      status: booking.status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
