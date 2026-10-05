// // app/api/public/rooms/route.ts

// import { NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Room from "@/models/Room";
// import Hotel from "@/models/Hotel";
// import Booking from "@/models/Booking";
// import Review from "@/models/Review";

// export async function GET() {
//   try {
//     await connectDB();

//     const _registerModels = [Hotel, Booking, Review];

//     const rooms = await Room.find()
//       .populate("hotel", "name city")
//       .sort({ createdAt: -1 })
//       .lean();

//     if (!rooms || rooms.length === 0) {
//       return NextResponse.json({ rooms: [] });
//     }

//     const roomIds = rooms.map((room) => room._id);

//     const activeBookings = await Booking.find({
//       room: { $in: roomIds },
//       status: { $in: ["pending", "confirmed", "checked_in"] },
//     })
//       .select("room")
//       .lean();

//     const bookedRoomIds = new Set(activeBookings.map((b) => b.room.toString()));

//     const reviewStats = await Review.aggregate([
//       { $match: { room: { $in: roomIds } } },
//       {
//         $group: {
//           _id: "$room",
//           avgRating: { $avg: "$rating" },
//           reviewCount: { $sum: 1 },
//         },
//       },
//     ]);

//     const statsMap = new Map(
//       reviewStats.map((stat) => [
//         stat._id.toString(),
//         {
//           rating: Number(stat.avgRating.toFixed(1)),
//           reviewCount: stat.reviewCount,
//         },
//       ]),
//     );

//     const roomsWithAvailabilityAndReviews = rooms.map((room: any) => {
//       const stats = statsMap.get(room._id.toString());
//       return {
//         ...room,
//         isAvailable: !bookedRoomIds.has(room._id.toString()),
//         rating: stats ? stats.rating : 0,
//         reviewCount: stats ? stats.reviewCount : 0,
//       };
//     });

//     return NextResponse.json({ rooms: roomsWithAvailabilityAndReviews });
//   } catch (error: any) {
//     console.error("Error in /api/public/rooms:", error);
//     return NextResponse.json(
//       { message: error.message || "Failed to fetch rooms" },
//       { status: 500 },
//     );
//   }
// }



import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Flat";
import Hotel from "@/models/Property";
import Booking from "@/models/Booking";
import Review from "@/models/Review";

export async function GET() {
  try {
    await connectDB();

    const _registerModels = [Hotel, Booking, Review];

    const rooms = await Room.find()
      .populate("hotel", "name city")
      .sort({ createdAt: -1 })
      .lean();

    if (!rooms || rooms.length === 0) {
      return NextResponse.json({ rooms: [] });
    }

    const roomIds = rooms.map((room) => room._id);

    const activeBookings = await Booking.find({
      room: { $in: roomIds },
      status: { $in: ["pending", "confirmed", "checked_in"] },
    })
      .select("room")
      .lean();

    const bookedRoomIds = new Set(activeBookings.map((b) => b.room.toString()));

    const reviewStats = await Review.aggregate([
      { $match: { room: { $in: roomIds } } },
      {
        $group: {
          _id: "$room",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const statsMap = new Map(
      reviewStats.map((stat) => [
        stat._id.toString(),
        {
          rating: Number(stat.avgRating.toFixed(1)),
          reviewCount: stat.reviewCount,
        },
      ]),
    );

    const roomsWithAvailabilityAndReviews = rooms.map((room: any) => {
      const stats = statsMap.get(room._id.toString());
      return {
        ...room,
        isAvailable: !bookedRoomIds.has(room._id.toString()),
        rating: stats ? stats.rating : 0,
        reviewCount: stats ? stats.reviewCount : 0,
      };
    });

    return NextResponse.json({ rooms: roomsWithAvailabilityAndReviews });
  } catch (error: any) {
    console.error("Error in /api/public/rooms:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch rooms" },
      { status: 500 },
    );
  }
}

