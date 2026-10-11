// app/api/admin/pages/[slug]/route.ts

import { NextResponse } from "next/server";
import Page from "@/models/Page";
import connectDB from "@/lib/mongodb";

// GET page content
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    await connectDB();
    const page = await Page.findOne({ slug });
    return NextResponse.json({
      success: true,
      page: page || { slug, title: "", content: "" },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch page" },
      { status: 500 },
    );
  }
}

// POST/UPDATE page content
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    await connectDB();
    const { title, content } = await req.json();

    const normalizedContent =
      typeof content === "string"
        ? content.replace(/&nbsp;/g, " ").replace(/\u00A0/g, " ")
        : content;

    const updatedPage = await Page.findOneAndUpdate(
      { slug },
      { title, content: normalizedContent },
      { upsert: true, new: true },
    );

    return NextResponse.json({ success: true, page: updatedPage });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to save page" },
      { status: 500 },
    );
  }
}

