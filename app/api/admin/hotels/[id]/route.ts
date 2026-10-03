// app/api/admin/hotels/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { deleteCloudinaryImages } from "@/lib/uploadImage";
import Room from "@/models/Room";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Hotel from "@/models/Hotel";

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

  const hotel = await Hotel.findById(id).select("+cloudinaryIds");
  if (!hotel)
    return NextResponse.json({ message: "Hotel not found" }, { status: 404 });

  // Delete associated rooms and room images
  const rooms = await Room.find({ hotel: hotel._id }).select("+cloudinaryIds");
  for (const room of rooms) {
    if (room.cloudinaryIds?.length)
      await deleteCloudinaryImages(room.cloudinaryIds);
  }
  await Room.deleteMany({ hotel: hotel._id });

  // Delete hotel images
  if (hotel.cloudinaryIds?.length)
    await deleteCloudinaryImages(hotel.cloudinaryIds);
  await Hotel.findByIdAndDelete(hotel._id);

  return NextResponse.json({ message: "Hotel and rooms deleted" });
}
