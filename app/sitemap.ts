// app/sitemap.ts

import { MetadataRoute } from "next";
import connectDB from "@/lib/mongodb";
import Hotel from "@/models/Property";
import Room from "@/models/Flat";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (SITE_URL || "").replace(/\/+$/, "");

  let hotelUrls: MetadataRoute.Sitemap = [];
  let roomUrls: MetadataRoute.Sitemap = [];

  try {
    await connectDB();

    // Fetch Hotels
    const hotels = await Hotel.find().select("_id updatedAt").lean();

    hotelUrls = hotels.map((h: any) => ({
      url: `${baseUrl}/hotels/${h._id}`,
      lastModified: h.updatedAt ? new Date(h.updatedAt) : new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    // Fetch Rooms
    const rooms = await Room.find().select("_id updatedAt").lean();

    roomUrls = rooms.map((r: any) => ({
      url: `${baseUrl}/rooms/${r._id}`,
      lastModified: r.updatedAt ? new Date(r.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("[Sitemap Generation Error]:", error);
  }

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl || "/",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/hotels`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rooms`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/help-center`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [...staticRoutes, ...hotelUrls, ...roomUrls];
}
