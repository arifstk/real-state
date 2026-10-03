import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import HeroBanner from "@/models/HeroBanner";
import { uploadImageToCloudinary } from "@/lib/uploadImage";

export async function GET() {
  try {
    await connectDB();
    let banner = await HeroBanner.findOne().lean();
    if (!banner) {
      banner = await HeroBanner.create({});
    }
    return NextResponse.json({ success: true, banner });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error loading banner data" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    let banner = await HeroBanner.findOne();
    if (banner) {
      Object.assign(banner, body);
      await banner.save();
    } else {
      banner = await HeroBanner.create(body);
    }

    revalidatePath("/");
    return NextResponse.json({ success: true, banner });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error updating banner" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 },
      );
    }

    // Upload using your existing helper function
    const uploadResult = await uploadImageToCloudinary(file, "hero_banners");

    return NextResponse.json({ success: true, url: uploadResult.url });
  } catch (error) {
    console.error("Hero Banner upload error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload image" },
      { status: 500 },
    );
  }
}
