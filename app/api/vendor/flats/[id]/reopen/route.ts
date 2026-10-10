// app/api/vendor/flats/[id]/reopen/route.ts

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Flat from "@/models/Flat";
import Booking from "@/models/Booking";
import User from "@/models/User";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid flat." }, { status: 400 });
    }

    await connectDB();

    const me: any = await User.findOne({ email: session.user.email })
      .select("_id role")
      .lean();
    if (!me) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const flat: any = await Flat.findById(id).select("vendor isSold");
    if (!flat) {
      return NextResponse.json({ message: "Flat not found." }, { status: 404 });
    }

    // Only the owner/vendor (or a superadmin) can reopen it
    const isOwner = flat.vendor?.toString() === me._id.toString();
    if (!isOwner && me.role !== "superadmin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (!flat.isSold) {
      return NextResponse.json(
        { message: "This flat is already for sale." },
        { status: 409 },
      );
    }

    flat.isSold = false;
    flat.isAvailable = true;
    await flat.save();

    await Booking.updateMany(
      { flat: flat._id, status: "completed" },
      { status: "cancelled" },
    );

    return NextResponse.json({ message: "Flat reopened for sale." });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
