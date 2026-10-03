// app/api/user/upload-avatar/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // FIX: Verify session and make sure the secure session ID exists
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 5MB." },
        { status: 400 },
      );
    }

    await connectDB();
    
    // FIX: Look up the user by their stable session ID, not their email
    const userId = (session.user as any).id;
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Delete old avatar from Cloudinary if it exists
    if (user.cloudinaryId) {
      await cloudinary.uploader.destroy(user.cloudinaryId).catch(() => {});
    }

    // Upload new avatar via buffer streams
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "shop.one/avatars",
            transformation: [
              { width: 200, height: 200, crop: "fill", gravity: "face" },
              { quality: "auto:good", fetch_format: "auto" },
            ],
          },
          (err: any, result: any) => {
            if (err) reject(err);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    // Save Cloudinary image data to MongoDB
    user.image = result.secure_url;
    user.cloudinaryId = result.public_id;
    await user.save();

    return NextResponse.json({ success: true, url: result.secure_url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}