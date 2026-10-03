// app/api/user/update-profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { name, email, mobile } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    // Check email not taken by another user
    if (email !== session.user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return NextResponse.json(
          { error: "This email is already used by another account." },
          { status: 400 },
        );
      }
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { name: name.trim(), email: email.trim(), mobile: mobile?.trim() || "" },
      { new: true },
    ).select("name email mobile role image");

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
