// app/api/webhook/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/Booking";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("Webhook Error: Signature or secret missing");
      return NextResponse.json(
        { message: "Signature or secret missing" },
        { status: 400 },
      );
    }

    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err: any) {
    console.error(`Webhook Verification Error: ${err.message}`);
    return NextResponse.json({ message: err.message }, { status: 400 });
  }

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (!metadata) {
      console.error("Webhook Error: No metadata found in session");
      return NextResponse.json(
        { message: "No metadata found" },
        { status: 400 },
      );
    }

    try {
      await connectDB();

      // Duplicate booking prevention using checkIn, checkOut, user and room
      const existingBooking = await Booking.findOne({
        user: metadata.userId,
        room: metadata.roomId,
        checkIn: new Date(metadata.checkIn),
        checkOut: new Date(metadata.checkOut),
      });

      if (!existingBooking) {
        await Booking.create({
          user: metadata.userId,
          hotel: metadata.hotelId,
          room: metadata.roomId,
          checkIn: new Date(metadata.checkIn),
          checkOut: new Date(metadata.checkOut),
          totalPrice: parseFloat(metadata.totalPrice),
          paymentType: "online",
          paymentStatus: "paid",
          status: "pending",
        });
        console.log("Booking successfully created from Webhook!");
      } else {
        // If booking exists, update payment status to paid
        await Booking.findByIdAndUpdate(existingBooking._id, {
          paymentStatus: "paid",
          paymentType: "online",
        });
        console.log("Existing booking status updated to paid!");
      }
    } catch (dbErr: any) {
      console.error("Database Save Error in Webhook:", dbErr);
      return NextResponse.json(
        { message: "Database creation failed", error: dbErr.message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
