// app/api/vendor/hotels/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Hotel from "@/models/Hotel";
import { uploadMultipleImages } from "@/lib/uploadImage";

async function requireVendor() {
  const session = await getServerSession(authOptions);
  if (!session || !["vendor", "superadmin"].includes(session.user.role)) return null;
  return session;
}

// Logged-in vendor's own hotel list
export async function GET() {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ message: "Not allowed" }, { status: 403 });

  await connectDB();
  const hotels = await Hotel.find({ owner: session.user.id }).sort({ createdAt: -1 });

  return NextResponse.json({ hotels });
}

// Register a new hotel (name, phone, address, city + one or more images)
// Each vendor can register a maximum of 1 hotel
export async function POST(req: NextRequest) {
  const session = await requireVendor();
  if (!session) return NextResponse.json({ message: "Not allowed" }, { status: 403 });

  await connectDB();

  const existing = await Hotel.findOne({ owner: session.user.id });
  if (existing) {
    return NextResponse.json(
      { message: "You can register only 1 hotel under your vendor account." },
      { status: 400 }
    );
  }

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const files = formData.getAll("images") as File[];

    if (!name?.trim() || !phone?.trim() || !address?.trim() || !city?.trim()) {
      return NextResponse.json({ message: "Please fill in all fields" }, { status: 400 });
    }

    let urls: string[] = [];
    let publicIds: string[] = [];

    if (files.length > 0 && files[0].size > 0) {
      const uploaded = await uploadMultipleImages(files, "hotel-booking/hotels");
      urls = uploaded.urls;
      publicIds = uploaded.publicIds;
    }

    const hotel = await Hotel.create({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      images: urls,
      cloudinaryIds: publicIds,
      owner: session.user.id,
    });

    return NextResponse.json({ message: "Hotel registered successfully", hotel }, { status: 201 });
  } catch (err: any) {
    console.error("Create hotel error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

