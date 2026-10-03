import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Hotel from "@/models/Hotel";
import Room from "@/models/Room";
import Booking from "@/models/Booking";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") {
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });
  }

  await connectDB();

  const [usersCount, hotelsCount, roomsCount] = await Promise.all([
    User.countDocuments(),
    Hotel.countDocuments(),
    Room.countDocuments(),
  ]);

  const hotelStats = await Hotel.aggregate([
    {
      $lookup: {
        from: "rooms",
        localField: "_id",
        foreignField: "hotel",
        as: "rooms",
      },
    },
    {
      $lookup: {
        from: "bookings",
        localField: "_id",
        foreignField: "hotel",
        as: "bookings",
      },
    },
    {
      $project: {
        _id: 1,
        hotelName: "$name",
        city: "$city",
        totalRooms: { $size: "$rooms" },
        totalOrders: { $size: "$bookings" },

        totalRevenue: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: "$bookings",
                  as: "b",
                  cond: { $eq: ["$$b.paymentStatus", "paid"] },
                },
              },
              as: "paidBooking",
              in: "$$paidBooking.totalPrice",
            },
          },
        },

        activeServingRooms: {
          $size: {
            $filter: {
              input: "$bookings",
              as: "b",
              cond: { $eq: ["$$b.status", "checked_in"] },
            },
          },
        },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  const totalRevenue = hotelStats.reduce(
    (acc, curr) => acc + (curr.totalRevenue || 0),
    0,
  );
  const totalOrders = hotelStats.reduce(
    (acc, curr) => acc + (curr.totalOrders || 0),
    0,
  );
  const activeServingRooms = hotelStats.reduce(
    (acc, curr) => acc + (curr.activeServingRooms || 0),
    0,
  );

  return NextResponse.json({
    summary: {
      users: usersCount,
      hotels: hotelsCount,
      rooms: roomsCount,
      totalRevenue,
      totalOrders,
      activeServingRooms,
    },
    hotelStats,
  });
}
