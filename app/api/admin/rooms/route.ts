// app/api/admin/rooms/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Room from "@/models/Room";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") {
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });
  }

  await connectDB();
  const rooms = await Room.find()
    .populate("hotel", "name")
    .sort({ createdAt: -1 });
  return NextResponse.json({ rooms });
}
