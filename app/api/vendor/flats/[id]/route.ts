// app/api/vendor/flats/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import Flat from "@/models/Flat";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { uploadMultipleImages } from "@/lib/uploadImage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !["vendor", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const vendorId = session.user.id;
    const { id } = await params;

    if (id && id !== "all") {
      const flat = await Flat.findOne({ _id: id, vendor: vendorId });
      if (!flat) {
        return NextResponse.json(
          { message: "Flat not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ flat }, { status: 200 });
    }

    const flats = await Flat.find({ vendor: vendorId }).sort({ createdAt: -1 });
    return NextResponse.json({ flats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching flats:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !["vendor", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const vendorId = session.user.id;
    const { id } = await params;

    const formData = await req.formData();

    const title = formData.get("title") as string;
    const flatType = formData.get("flatType") as string;
    const price = Number(formData.get("price"));
    const discountPercent = Number(formData.get("discountPercent")) || 0;
    const description = formData.get("description") as string;
    const city = formData.get("city") as string;
    const address = formData.get("address") as string;

    const existingImages = formData.getAll("existingImages") as string[];
    const newFiles = formData.getAll("images") as File[];

    let updatedImages = [...existingImages];

    if (newFiles.length > 0 && newFiles[0].size > 0) {
      const uploaded = await uploadMultipleImages(
        newFiles,
        "real-estate/flats",
      );
      updatedImages = [...updatedImages, ...uploaded.urls];
    }

    const updatedFlat = await Flat.findOneAndUpdate(
      { _id: id, vendor: vendorId },
      {
        $set: {
          title,
          flatType,
          price,
          discountPercent,
          description,
          city,
          address,
          images: updatedImages,
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedFlat) {
      return NextResponse.json(
        { message: "Flat not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Flat updated successfully", flat: updatedFlat },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating flat:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session || !["vendor", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const vendorId = session.user.id;
    const { id } = await params;

    const deletedFlat = await Flat.findOneAndDelete({
      _id: id,
      vendor: vendorId,
    });

    if (!deletedFlat) {
      return NextResponse.json(
        { message: "Flat not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Flat deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting flat:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
