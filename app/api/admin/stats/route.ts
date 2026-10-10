// app/api/admin/stats/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Flat from "@/models/Flat";
import Booking from "@/models/Booking";

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

    const totalUsers = await User.countDocuments();

    // ── 1. Every vendor on the website ───────────────────────
    const vendors: any[] = await User.find({ role: "vendor" })
      .select("_id name email")
      .lean();
    const vendorIds = vendors.map((v) => v._id);

    // ── 2. Every flat that belongs to those vendors ──────────
    const allFlats: any[] = await Flat.find({ vendor: { $in: vendorIds } })
      .select("_id vendor isSold isAvailable")
      .lean();

    // flatId -> vendorId, so each booking can be credited to the right vendor
    const flatOwner = new Map<string, string>(
      allFlats.map((f) => [String(f._id), String(f.vendor)]),
    );

    // ── 3. Every booking made on those flats ─────────────────
    const allBookings: any[] = await Booking.find({
      flat: { $in: allFlats.map((f) => f._id) },
    })
      .select("flat status totalPrice")
      .lean();

    // ── 4. The vendor-dashboard calculation, once per vendor ─
    // (per vendor: flats, sold / active flats, bookings, and
    //  revenue = total price of "completed" (sold) bookings)
    const perVendor = new Map<
      string,
      {
        totalFlats: number;
        soldFlats: number;
        availableFlats: number;
        totalBookings: number;
        pendingBookings: number;
        totalRevenue: number;
      }
    >();

    vendors.forEach((v) =>
      perVendor.set(String(v._id), {
        totalFlats: 0,
        soldFlats: 0,
        availableFlats: 0,
        totalBookings: 0,
        pendingBookings: 0,
        totalRevenue: 0,
      }),
    );

    allFlats.forEach((f) => {
      const stat = perVendor.get(String(f.vendor));
      if (!stat) return;
      stat.totalFlats += 1;
      if (f.isSold) stat.soldFlats += 1;
      if (!f.isSold && f.isAvailable !== false) stat.availableFlats += 1;
    });

    allBookings.forEach((b) => {
      const vendorId = flatOwner.get(String(b.flat));
      const stat = vendorId ? perVendor.get(vendorId) : undefined;
      if (!stat) return;

      stat.totalBookings += 1;
      if (b.status === "pending") stat.pendingBookings += 1;
      if (b.status === "completed") stat.totalRevenue += b.totalPrice || 0;
    });

    // ── 5. Table rows + platform totals (sum of all vendors) ─
    const sellerStats = vendors
      .map((v) => ({
        _id: String(v._id),
        sellerName: v.name || "Unknown seller",
        email: v.email || "",
        ...perVendor.get(String(v._id))!,
      }))
      .sort(
        (a, b) =>
          b.totalRevenue - a.totalRevenue || b.totalFlats - a.totalFlats,
      );

    const sumOf = (key: keyof (typeof sellerStats)[number]) =>
      sellerStats.reduce((acc, s) => acc + (Number(s[key]) || 0), 0);

    return NextResponse.json({
      summary: {
        users: totalUsers,
        sellers: vendors.length,
        flats: sumOf("totalFlats"),
        availableFlats: sumOf("availableFlats"),
        soldFlats: sumOf("soldFlats"),
        totalBookings: sumOf("totalBookings"),
        pendingBookings: sumOf("pendingBookings"),
        // Total Sales Revenue = revenue of vendor 1 + vendor 2 + ... (all vendors)
        totalRevenue: sumOf("totalRevenue"),
      },
      sellerStats,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
