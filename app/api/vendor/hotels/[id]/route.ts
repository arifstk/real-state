// app/api/vendor/hotels/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Hotel from "@/models/Hotel";
import Room from "@/models/Room";
import {
  uploadMultipleImages,
  deleteCloudinaryImages,
} from "@/lib/uploadImage";

async function getOwnedHotel(id: string, userId: string, role: string) {
  const hotel = await Hotel.findById(id).select("+cloudinaryIds");
  if (!hotel) return null;
  if (role !== "superadmin" && hotel.owner.toString() !== userId) return null;
  return hotel;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });

  const { id } = await params;

  await connectDB();
  const hotel = await getOwnedHotel(id, session.user.id, session.user.role);
  if (!hotel)
    return NextResponse.json({ message: "Not found hotel" }, { status: 404 });

  const roomCount = await Room.countDocuments({ hotel: hotel._id });

  return NextResponse.json({ hotel, roomCount });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });

  const { id } = await params;

  await connectDB();
  const hotel = await getOwnedHotel(id, session.user.id, session.user.role);
  if (!hotel)
    return NextResponse.json({ message: "Not found hotel" }, { status: 404 });

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const files = formData.getAll("images") as File[];

    if (name?.trim()) hotel.name = name.trim();
    if (phone?.trim()) hotel.phone = phone.trim();
    if (address?.trim()) hotel.address = address.trim();
    if (city?.trim()) hotel.city = city.trim();

    if (files.length > 0 && files[0].size > 0) {
      if (hotel.cloudinaryIds && hotel.cloudinaryIds.length > 0) {
        await deleteCloudinaryImages(hotel.cloudinaryIds);
      }
      const uploaded = await uploadMultipleImages(
        files,
        "hotel-booking/hotels",
      );
      hotel.images = uploaded.urls;
      hotel.cloudinaryIds = uploaded.publicIds;
    }

    await hotel.save();
    return NextResponse.json({ message: "Hotel Updated", hotel });
  } catch (err: any) {
    console.error("Update hotel error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });

  const { id } = await params;

  await connectDB();
  const hotel = await getOwnedHotel(id, session.user.id, session.user.role);
  if (!hotel)
    return NextResponse.json({ message: "not found hotel" }, { status: 404 });

  const rooms = await Room.find({ hotel: hotel._id }).select("+cloudinaryIds");
  for (const room of rooms) {
    if (room.cloudinaryIds && room.cloudinaryIds.length > 0) {
      await deleteCloudinaryImages(room.cloudinaryIds);
    }
  }
  await Room.deleteMany({ hotel: hotel._id });

  if (hotel.cloudinaryIds && hotel.cloudinaryIds.length > 0) {
    await deleteCloudinaryImages(hotel.cloudinaryIds);
  }
  await Hotel.findByIdAndDelete(hotel._id);

  return NextResponse.json({ message: "Hotel and associated rooms deleted" });
}
