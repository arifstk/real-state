// app/api/vendor/dashboard-stats/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Flat from "@/models/Flat";
import Booking from "@/models/Booking";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // session.user.id may be missing – fall back to an email lookup
    let vendorId: string | undefined = (session.user as any).id;
    if (!vendorId && session.user.email) {
      const u: any = await User.findOne({ email: session.user.email })
        .select("_id")
        .lean();
      vendorId = u?._id?.toString();
    }
    if (!vendorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ── Flats ────────────────────────────────────────────────
    const vendorFlats: any[] = await Flat.find({ vendor: vendorId })
      .select("_id isSold isAvailable")
      .lean();
    const flatIds = vendorFlats.map((f) => f._id);

    const totalSoldFlats = vendorFlats.filter((f) => f.isSold).length;
    // Active = listed for sale (not sold, not switched off)
    const activeFlats = vendorFlats.filter(
      (f) => !f.isSold && f.isAvailable !== false,
    ).length;

    // ── Bookings ─────────────────────────────────────────────
    const bookings: any[] = await Booking.find({ flat: { $in: flatIds } })
      .select("user name totalPrice status createdAt updatedAt")
      .lean();

    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(
      (b) => b.status === "pending",
    ).length;

    const totalCustomers = new Set(
      bookings.map((b) => b.user?.toString() || b.name),
    ).size;

    // ── Revenue: completed (sold) bookings only ──────────────
    // The sale date is when the booking was marked completed (= last update)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthlyRevenue = 0;
    let yearlyRevenue = 0;
    let totalRevenue = 0;

    bookings.forEach((b) => {
      if (b.status !== "completed") return;
      const amount = b.totalPrice || 0;
      const soldAt = new Date(b.updatedAt || b.createdAt);

      totalRevenue += amount;
      if (soldAt.getFullYear() === currentYear) {
        yearlyRevenue += amount;
        if (soldAt.getMonth() === currentMonth) monthlyRevenue += amount;
      }
    });

    // ── Recent bookings (with flat title + buyer name) ───────
    const recent: any[] = await Booking.find({ flat: { $in: flatIds } })
      .populate("flat", "title flatType")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentBookings = recent.map((b) => ({
      _id: b._id.toString(),
      flatTitle: b.flat?.title || b.flat?.flatType || "Flat",
      customerName: b.name || "Buyer",
      amount: b.totalPrice || 0,
      status: b.status,
      createdAt: b.createdAt,
    }));

    return NextResponse.json(
      {
        stats: {
          totalSoldFlats,
          activeFlats,
          monthlyRevenue,
          yearlyRevenue,
          totalBookings,
          pendingBookings,
          totalCustomers,
          totalRevenue,
        },
        recentBookings,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching vendor dashboard stats:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
