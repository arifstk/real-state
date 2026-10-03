// app/api/user/delete-account/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import User from "@/models/User";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Admins can't delete their own account
    if (user.role === "admin") {
      return NextResponse.json(
        {
          error:
            "Admin accounts can't be deleted from here. Ask another admin to remove your account, or manage it directly in the database.",
        },
        { status: 403 },
      );
    }

    // Optional Cleanup: Remove their avatar from Cloudinary if it exists
    if (user.cloudinaryId) {
      await cloudinary.uploader.destroy(user.cloudinaryId).catch(() => {});
    }

    // Delete user from MongoDB
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
