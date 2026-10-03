import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { name, email, mobile, password } = await req.json();

    if (!name || !email || !mobile || !password) {
      return NextResponse.json(
        { message: "Fill in all fields." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    await connectDB();

    const existing = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existing) {
      return NextResponse.json(
        {
          message:
            "There is already an account with this email or mobile number.",
        },
        { status: 409 },
      );
    }

    // First user automatically becomes superadmin
    const totalUsers = await User.countDocuments();
    const role = totalUsers === 0 ? "superadmin" : "user";

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      provider: "credentials",
      role,
    });

    return NextResponse.json(
      {
        message: "Registration successful.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { message: "Server error occurred." },
      { status: 500 },
    );
  }
}
