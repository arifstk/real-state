// app/api/vendor/flats/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Flat from "@/models/Flat";
import { uploadMultipleImages } from "@/lib/uploadImage";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["vendor", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    await connectDB();

    const vendorId = session.user.id;
    const flats = await Flat.find({ vendor: vendorId }).sort({ createdAt: -1 });

    return NextResponse.json({ flats }, { status: 200 });
  } catch (err) {
    console.error("Fetch flats error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["vendor", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const propertyType = formData.get("propertyType") as string;
    const price = Number(formData.get("price"));
    const discountPercent = Number(formData.get("discountPercent")) || 0;
    const bedrooms = Number(formData.get("bedrooms")) || 1;
    const bathrooms = Number(formData.get("bathrooms")) || 1;
    const sizeSqFt = Number(formData.get("sizeSqFt")) || 0;
    const floorNo = formData.get("floorNo") as string;
    const facing = formData.get("facing") as string;
    const parking = formData.get("parking") === "true";
    const description = formData.get("description") as string;
    const city = formData.get("city") as string;
    const address = formData.get("address") as string;
    const amenities = formData.getAll("amenities") as string[];
    const files = formData.getAll("images") as File[];

    if (!title || !price || price <= 0 || !city || !address) {
      return NextResponse.json(
        { message: "Title, Price, City & Address are required" },
        { status: 400 },
      );
    }

    await connectDB();

    let urls: string[] = [];
    let publicIds: string[] = [];

    if (files.length > 0 && files[0].size > 0) {
      const uploaded = await uploadMultipleImages(files, "real-estate/flats");
      urls = uploaded.urls;
      publicIds = uploaded.publicIds;
    }

    const flat = await Flat.create({
      vendor: session.user.id,
      title,
      propertyType,
      price,
      discountPercent,
      bedrooms,
      bathrooms,
      sizeSqFt,
      floorNo,
      facing,
      parking,
      description,
      city,
      address,
      amenities,
      images: urls,
      cloudinaryIds: publicIds,
    });

    return NextResponse.json(
      { message: "Flat Added successfully", flat },
      { status: 201 },
    );
  } catch (err) {
    console.error("Create flat error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
