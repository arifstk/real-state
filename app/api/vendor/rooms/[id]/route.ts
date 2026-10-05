// app/api/vendor/rooms/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Hotel from "@/models/Property";
import Room from "@/models/Flat";
import {
  uploadMultipleImages,
  deleteCloudinaryImages,
} from "@/lib/uploadImage";

async function verifyRoomOwner(roomId: string, userId: string, role: string) {
  const room = await Room.findById(roomId);
  if (!room) return null;

  const hotel = await Hotel.findById(room.hotel);
  if (!hotel) return null;

  if (role !== "superadmin" && hotel.owner.toString() !== userId) return null;

  return { room, hotel };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });
  }

  const { id } = await params;

  await connectDB();
  const data = await verifyRoomOwner(id, session.user.id, session.user.role);

  if (!data) {
    return NextResponse.json({ message: "Room not found" }, { status: 404 });
  }

  return NextResponse.json({ room: data.room });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session || !["vendor", "superadmin"].includes(session.user.role)) {
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const formData = await req.formData();
    const roomType = formData.get("roomType") as string;
    const pricePerNight = Number(formData.get("pricePerNight"));
    const rawDiscount = formData.get("discountPercent");
    const discountPercent =
      rawDiscount !== null ? Number(rawDiscount) : undefined;
    const amenities = formData.getAll("amenities") as string[];
    const files = formData.getAll("images") as File[];

    await connectDB();
    const data = await verifyRoomOwner(id, session.user.id, session.user.role);

    if (!data) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    const { room } = data;

    if (roomType?.trim()) room.roomType = roomType.trim();
    if (pricePerNight && pricePerNight > 0) room.pricePerNight = pricePerNight;
    if (discountPercent !== undefined && !isNaN(discountPercent)) {
      room.discountPercent = discountPercent;
    }
    if (amenities) room.amenities = amenities;

    // Preserve existing images if no new files are uploaded
    if (files.length > 0 && files[0].size > 0) {
      if (room.cloudinaryIds && room.cloudinaryIds.length > 0) {
        await deleteCloudinaryImages(room.cloudinaryIds);
      }
      const uploaded = await uploadMultipleImages(files, "hotel-booking/rooms");
      room.images = uploaded.urls;
      room.cloudinaryIds = uploaded.publicIds;
    }

    await room.save();
    return NextResponse.json({ message: "Room updated successfully", room });
  } catch (err: any) {
    console.error("Update room error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });
  }

  const { id } = await params;
  await connectDB();
  const data = await verifyRoomOwner(id, session.user.id, session.user.role);

  if (!data) {
    return NextResponse.json({ message: "Room not found" }, { status: 404 });
  }

  if (data.room.cloudinaryIds && data.room.cloudinaryIds.length > 0) {
    await deleteCloudinaryImages(data.room.cloudinaryIds);
  }

  await Room.findByIdAndDelete(id);
  return NextResponse.json({ message: "Room deleted successfully" });
}
