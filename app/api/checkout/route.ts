// app/api/checkout/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let userId = (session.user as any)?.id;

    if (!userId && session.user.email) {
      const dbUser = await User.findOne({ email: session.user.email });
      if (dbUser) {
        userId = dbUser._id.toString();
      }
    }

    if (!userId) {
      return NextResponse.json(
        { message: "User account not found" },
        { status: 404 },
      );
    }

    const { roomId, hotelId, checkIn, checkOut, totalPrice, roomTitle } =
      await req.json();

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL;

    const formattedCheckIn = new Date(checkIn).toISOString();
    const formattedCheckOut = new Date(checkOut).toISOString();

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: roomTitle || "Room Reservation" },
            unit_amount: Math.round(Number(totalPrice) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/my-bookings?success=true`,
      cancel_url: `${origin}/rooms/${roomId}?canceled=true`,
      metadata: {
        userId: userId,
        roomId: roomId.toString(),
        hotelId: hotelId.toString(),
        checkIn: formattedCheckIn,
        checkOut: formattedCheckOut,
        totalPrice: totalPrice.toString(),
        paymentType: "online",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Checkout Error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
