// app/api/admin/hero-banner/route.ts

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import HeroBanner from "@/models/HeroBanner";
import User from "@/models/User";
import { uploadImageToCloudinary } from "@/lib/uploadImage";

// Only fields the hero banner actually shows, with a max length for each
const FIELDS = {
  badgeText: 80, // small caps label above the heading
  headingText: 80, // heading (first part)
  highlightText: 60, // gold line under the heading
  subtitleText: 300, // paragraph under the heading
  metricBadgeText: 80, // first item in the bottom features row
  imageUrl: 500, // image on the right
} as const;

type FieldKey = keyof typeof FIELDS;

// Returns an error response unless the logged-in user is a super admin
async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
  await connectDB();
  const me: any = await User.findOne({ email: session.user.email })
    .select("role")
    .lean();
  if (me?.role !== "superadmin") {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }
  return null;
}

export async function GET() {
  try {
    const denied = await requireSuperAdmin();
    if (denied) return denied;

    let banner = await HeroBanner.findOne().lean();
    if (!banner) {
      banner = await HeroBanner.create({});
    }
    return NextResponse.json({ success: true, banner });
  } catch {
    return NextResponse.json(
      { success: false, message: "Error loading banner data" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const denied = await requireSuperAdmin();
    if (denied) return denied;

    const body = await req.json();

    // Accept only the known fields 
    const update: Partial<Record<FieldKey, string>> = {};
    for (const key of Object.keys(FIELDS) as FieldKey[]) {
      if (body[key] === undefined) continue;
      if (typeof body[key] !== "string") {
        return NextResponse.json(
          { success: false, message: `${key} must be text.` },
          { status: 400 },
        );
      }
      const value = body[key].trim();
      if (value.length > FIELDS[key]) {
        return NextResponse.json(
          {
            success: false,
            message: `${key} is too long (max ${FIELDS[key]} characters).`,
          },
          { status: 400 },
        );
      }
      update[key] = value;
    }

    if (update.imageUrl && !/^https:\/\//i.test(update.imageUrl)) {
      return NextResponse.json(
        { success: false, message: "Image URL must start with https://" },
        { status: 400 },
      );
    }

    let banner = await HeroBanner.findOne();
    if (banner) {
      banner.set(update);
      await banner.save();
    } else {
      banner = await HeroBanner.create(update);
    }

    revalidatePath("/");
    return NextResponse.json({ success: true, banner });
  } catch {
    return NextResponse.json(
      { success: false, message: "Error updating banner" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const denied = await requireSuperAdmin();
    if (denied) return denied;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 },
      );
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Only image files are allowed." },
        { status: 400 },
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Image must be 5 MB or smaller." },
        { status: 400 },
      );
    }

    // Upload using existing helper function
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
