import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Property from "@/models/Property";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    await connectDB();
    const properties = await Property.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, properties }, { status: 200 });
  } catch (error) {
    console.error("Fetch Properties Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
