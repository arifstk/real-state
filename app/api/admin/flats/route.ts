// app/api/admin/flats/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Flat from "@/models/Flat";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Always check the role in the database, not in the session
    const me: any = await User.findOne({ email: session.user.email })
      .select("role")
      .lean();
    if (me?.role !== "superadmin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const flats = await Flat.find()
      .select(
        "title flatType city address price discountPercent images isAvailable isSold vendor createdAt",
      )
      .populate("vendor", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ flats }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
