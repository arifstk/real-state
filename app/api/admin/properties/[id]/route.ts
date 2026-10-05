import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Property from "@/models/Property";
import Room from "@/models/Flat";
import { deleteCloudinaryImages } from "@/lib/uploadImage";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const property = await Property.findById(id).select("+cloudinaryIds");
    if (!property) {
      return NextResponse.json(
        { message: "Property not found" },
        { status: 404 },
      );
    }

    // Delete associated rooms and their Cloudinary images
    const rooms = await Room.find({ property: property._id }).select(
      "+cloudinaryIds",
    );
    for (const room of rooms) {
      if (room.cloudinaryIds?.length) {
        await deleteCloudinaryImages(room.cloudinaryIds);
      }
    }
    await Room.deleteMany({ property: property._id });

    // Delete property Cloudinary images
    if (property.cloudinaryIds?.length) {
      await deleteCloudinaryImages(property.cloudinaryIds);
    }

    // Delete the property itself
    await Property.findByIdAndDelete(property._id);

    return NextResponse.json(
      {
        success: true,
        message: "Property and associated flats deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete Property Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
