// app/api/vendor/rooms/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Hotel from "@/models/Hotel";
import Room from "@/models/Room";
import { uploadMultipleImages } from "@/lib/uploadImage";

async function verifyHotelOwnership(
  hotelId: string,
  userId: string,
  role: string,
) {
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) return null;
  if (role !== "superadmin" && hotel.owner.toString() !== userId) return null;
  return hotel;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });

  const hotelId = req.nextUrl.searchParams.get("hotelId");
  if (!hotelId)
    return NextResponse.json({ message: "hotelId Needed" }, { status: 400 });

  await connectDB();
  const hotel = await verifyHotelOwnership(
    hotelId,
    session.user.id,
    session.user.role,
  );
  if (!hotel)
    return NextResponse.json({ message: "Not found Hotel" }, { status: 404 });

  const rooms = await Room.find({ hotel: hotelId }).sort({ createdAt: -1 });
  return NextResponse.json({ hotel, rooms });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["vendor", "superadmin"].includes(session.user.role)) {
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const hotelId = formData.get("hotelId") as string;
    const roomType = formData.get("roomType") as string;
    const pricePerNight = Number(formData.get("pricePerNight"));
    const discountPercent = Number(formData.get("discountPercent")) || 0;
    const amenities = formData.getAll("amenities") as string[];
    const files = formData.getAll("images") as File[];

    if (!hotelId || !roomType || !pricePerNight || pricePerNight <= 0) {
      return NextResponse.json(
        { message: "Room Type & Price Per Night Price Required" },
        { status: 400 },
      );
    }

    await connectDB();
    const hotel = await verifyHotelOwnership(
      hotelId,
      session.user.id,
      session.user.role,
    );
    if (!hotel)
      return NextResponse.json({ message: "Hotel Not found" }, { status: 404 });

    let urls: string[] = [];
    let publicIds: string[] = [];

    if (files.length > 0 && files[0].size > 0) {
      const uploaded = await uploadMultipleImages(files, "hotel-booking/rooms");
      urls = uploaded.urls;
      publicIds = uploaded.publicIds;
    }

    const room = await Room.create({
      hotel: hotelId,
      roomType,
      pricePerNight,
      discountPercent,
      amenities,
      images: urls,
      cloudinaryIds: publicIds,
    });

    return NextResponse.json(
      { message: "Room Added successfully", room },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("Create room error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
