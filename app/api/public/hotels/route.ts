import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Hotel from "@/models/Property";

export async function GET() {
  try {
    await connectDB();
    const hotels = await Hotel.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ hotels });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
