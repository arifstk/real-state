// app/api/search/route.ts

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Flat from "@/models/Flat";

// Escape user input so characters like ( or * can't break the regex
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({ success: true, results: [] });
    }

    await connectDB();
    const regex = new RegExp(escapeRegex(query.slice(0, 80)), "i");

    // Search flats by title, type, city, address or amenities
    const flats: any[] = await Flat.find({
      $or: [
        { title: regex },
        { flatType: regex },
        { city: regex },
        { address: regex },
        { amenities: regex },
      ],
    })
      .select("_id title flatType city address price discountPercent isSold")
      .sort({ isSold: 1, createdAt: -1 }) // flats still for sale first
      .limit(6)
      .lean();

    const results = flats.map((flat) => {
      const price = flat.discountPercent
        ? Math.round(flat.price * (1 - flat.discountPercent / 100))
        : flat.price;

      return {
        _id: flat._id.toString(),
        title: flat.title,
        subtitle: [
          flat.flatType,
          [flat.address, flat.city].filter(Boolean).join(", "),
        ]
          .filter(Boolean)
          .join(" · "),
        type: "flat",
        price,
        isSold: !!flat.isSold,
      };
    });

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching search results" },
      { status: 500 },
    );
  }
}
