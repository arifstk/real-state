// app/api/admin/flats/[id]/route.ts

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Flat from "@/models/Flat";
import User from "@/models/User";

async function checkSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const me: any = await User.findOne({ email: session.user.email })
    .select("role")
    .lean();
  if (me?.role !== "superadmin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null; // allowed
}

// Mark a flat as sold / reopen it for sale
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await checkSuperAdmin();
    if (denied) return denied;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid flat." }, { status: 400 });
    }

    const { isSold } = await req.json();
    if (typeof isSold !== "boolean") {
      return NextResponse.json(
        { message: "isSold must be true or false." },
        { status: 400 },
      );
    }

    const flat = await Flat.findByIdAndUpdate(
      id,
      { isSold, isAvailable: !isSold },
      { new: true },
    ).select("isSold isAvailable");

    if (!flat) {
      return NextResponse.json({ message: "Flat not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Flat updated.", flat });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await checkSuperAdmin();
    if (denied) return denied;

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid flat." }, { status: 400 });
    }

    const deleted = await Flat.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Flat not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Flat deleted." });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
