// app/api/vendor/bookings/[id]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { revalidatePath } from "next/cache";
import { sendBookingEmail } from "@/lib/mail";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["vendor", "superadmin"].includes(session.user.role)) {
      return NextResponse.json({ message: "Not allowed" }, { status: 403 });
    }

    const { id } = await params;
    const { status, paymentStatus } = await req.json();

    await connectDB();

    // Fetch original booking with user and hotel details
    const existingBooking = await Booking.findById(id)
      .populate("user", "name email")
      .populate("hotel", "name");

    if (!existingBooking) {
      return NextResponse.json(
        { message: "Booking record not found in database" },
        { status: 404 },
      );
    }

    const updateFields: Record<string, any> = {};

    if (status) {
      updateFields.status = status;
      if (status === "completed") {
        updateFields.paymentStatus = "paid";
      }
    }

    if (paymentStatus) {
      updateFields.paymentStatus = paymentStatus;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    revalidatePath("/vendor-dashboard/bookings");
    revalidatePath("/my-bookings");

    // Email Notification Logic
    if (existingBooking.user?.email) {
      const emailPayload = {
        to: existingBooking.user.email,
        userName: existingBooking.user.name || "Valued Customer",
        hotelName: existingBooking.hotel?.name || "our hotel",
        checkIn: existingBooking.checkIn,
        checkOut: existingBooking.checkOut,
        totalPrice: existingBooking.totalPrice,
        bookingId: existingBooking._id.toString(),
        // Crucial Fix: Send the real payment fields to lib/mail.ts
        paymentStatus:
          updatedBooking.paymentStatus || existingBooking.paymentStatus,
        paymentType: updatedBooking.paymentType || existingBooking.paymentType,
      };

      try {
        // 1. Order Confirmed by Vendor Email
        const isNowConfirmed =
          updatedBooking.status === "confirmed" &&
          existingBooking.status !== "confirmed";

        if (isNowConfirmed) {
          await sendBookingEmail("CONFIRMED", emailPayload);
        }

        // 2. Payment Completed Email
        const isNowPaid =
          updatedBooking.paymentStatus === "paid" &&
          existingBooking.paymentStatus !== "paid";

        if (isNowPaid) {
          await sendBookingEmail("PAYMENT_COMPLETED", emailPayload);
        }

        // 3. Checked-Out / Completed Email
        const isNowCheckedOut =
          (updatedBooking.status === "checked-out" ||
            updatedBooking.status === "completed") &&
          existingBooking.status !== "checked-out" &&
          existingBooking.status !== "completed";

        if (isNowCheckedOut) {
          await sendBookingEmail("CHECKED_OUT", emailPayload);
        }
      } catch (emailError) {
        console.error(
          "Failed to send status update email via Nodemailer:",
          emailError,
        );
      }
    }

    return NextResponse.json({
      message: "Booking record updated successfully",
      booking: updatedBooking,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update booking status" },
      { status: 500 },
    );
  }
}
