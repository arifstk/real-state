import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// only superadmin 
async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "superadmin") {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ message: "Not allowed" }, { status: 403 });
  }

  await connectDB();
  const users = await User.find().sort({ createdAt: -1 }).lean();

  return NextResponse.json({ users });
}
