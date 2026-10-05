// app/api/search/route.ts

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Flat";
import Hotel from "@/models/Property";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || !query.trim()) {
      return NextResponse.json({ success: true, results: [] });
    }

    await connectDB();
    const regex = new RegExp(query, "i");

    // Search Hotels matching name, city, or location
    const matchingHotels = await Hotel.find({
      $or: [{ name: regex }, { city: regex }, { location: regex }],
    })
      .select("_id name city")
      .limit(6)
      .lean();

    const hotelIds = matchingHotels.map((h: any) => h._id);

    // Search Rooms matching roomType, amenities, OR belonging to matching hotels
    const rooms = await Room.find({
      $or: [
        { roomType: regex },
        { amenities: regex },
        { hotel: { $in: hotelIds } },
      ],
    })
      .populate("hotel", "name city")
      .limit(6)
      .lean();

    // Format room results
    const roomResults = rooms.map((room: any) => ({
      _id: room._id.toString(),
      title: room.roomType || "Standard Room",
      subtitle: room.hotel?.name
        ? `${room.hotel.name}${room.hotel.city ? `, ${room.hotel.city}` : ""}`
        : "Hotel Stay",
      type: "room",
      price: room.pricePerNight,
    }));

    // Format direct hotel results (if no rooms matched directly)
    const hotelResults = matchingHotels.map((hotel: any) => ({
      _id: hotel._id.toString(),
      title: hotel.name,
      subtitle: hotel.city || "Hotel",
      type: "hotel",
      price: undefined,
    }));

    // Combine and deduplicate top results
    const combinedResults = [...roomResults, ...hotelResults].slice(0, 6);

    return NextResponse.json({ success: true, results: combinedResults });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching search results" },
      { status: 500 },
    );
  }
}
