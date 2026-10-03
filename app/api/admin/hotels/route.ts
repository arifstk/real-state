// app/api/admin/hotels/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Hotel from "@/models/Hotel";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") {
    return NextResponse.json({ message: "Not authorized" }, { status: 403 });
  }

  await connectDB();
  const hotels = await Hotel.find()
    .populate("owner", "name email")
    .sort({ createdAt: -1 });
  return NextResponse.json({ hotels });
}
