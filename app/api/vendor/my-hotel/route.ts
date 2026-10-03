// app/api/vendor/my-hotel/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Hotel from "@/models/Hotel";
import Room from "@/models/Room";
import Booking from "@/models/Booking";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !["vendor", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const hotel = await Hotel.findOne({ owner: session.user.id }).lean();
    if (!hotel) {
      return NextResponse.json({ hotel: null, stats: null });
    }

    const rooms = await Room.find({ hotel: hotel._id }).select("_id").lean();
    const roomIds = rooms.map((r) => r._id);

    const totalRooms = rooms.length;

    const totalOrders = await Booking.countDocuments({
      room: { $in: roomIds },
    });

    const totalServings = await Booking.countDocuments({
      room: { $in: roomIds },
      status: "checked_in",
    });

    const paidBookings = await Booking.find({
      room: { $in: roomIds },
      paymentStatus: "paid",
    }).select("totalPrice");

    const totalRevenue = paidBookings.reduce(
      (sum, b) => sum + (b.totalPrice || 0),
      0,
    );

    return NextResponse.json({
      hotel,
      stats: {
        totalRevenue,
        totalRooms,
        totalServings,
        totalOrders,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 },
    );
  }
}
