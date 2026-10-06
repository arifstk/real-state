// app/api/vendor/dashboard-stats/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Flat from "@/models/Flat";
import Booking from "@/models/Booking";

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const vendorId = session.user.id;

    const vendorFlats = await Flat.find({ vendor: vendorId });
    const flatIds = vendorFlats.map((f) => f._id);

    const activeFlats = vendorFlats.filter(
      (f) => f.status === "active" || f.status === "available",
    ).length;

    const bookings = await Booking.find({ flatId: { $in: flatIds } });

    const totalBookings = bookings.length;
    const soldFlats = bookings.filter(
      (b) => b.status === "completed" || b.status === "sold",
    );
    const totalSoldFlats = soldFlats.length;
    const pendingBookings = bookings.filter(
      (b) => b.status === "pending",
    ).length;

    const uniqueCustomers = new Set(
      bookings.map((b) => b.customer?.toString() || b.customerName),
    ).size;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthlyRevenue = 0;
    let yearlyRevenue = 0;
    let totalRevenue = 0;

    bookings.forEach((b) => {
      if (
        b.status === "completed" ||
        b.status === "sold" ||
        b.status === "approved"
      ) {
        totalRevenue += b.amount || 0;
        const bDate = new Date(b.createdAt);
        if (bDate.getFullYear() === currentYear) {
          yearlyRevenue += b.amount || 0;
          if (bDate.getMonth() === currentMonth) {
            monthlyRevenue += b.amount || 0;
          }
        }
      }
    });

    const stats = {
      totalSoldFlats,
      activeFlats,
      monthlyRevenue,
      yearlyRevenue,
      totalBookings,
      pendingBookings,
      totalCustomers: uniqueCustomers,
      totalRevenue,
    };

    const recentBookings = bookings
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    return NextResponse.json(
      {
        stats,
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
