// app/api/admin/rooms/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { deleteCloudinaryImages } from "@/lib/uploadImage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") {
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });
  }

  const { id } = await params;
  await connectDB();

  const room = await Room.findById(id).select("+cloudinaryIds");
  if (!room)
    return NextResponse.json({ message: "Room not found" }, { status: 404 });

  if (room.cloudinaryIds?.length)
    await deleteCloudinaryImages(room.cloudinaryIds);
  await Room.findByIdAndDelete(id);

  return NextResponse.json({ message: "Room deleted" });
}
