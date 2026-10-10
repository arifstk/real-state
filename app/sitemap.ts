// app/sitemap.ts

import { MetadataRoute } from "next";
import connectDB from "@/lib/mongodb";
import Flat from "@/models/Flat";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (SITE_URL || "").replace(/\/+$/, "");
  if (!/^https:\/\//i.test(baseUrl) || /localhost|127\.0\.0\.1/.test(baseUrl)) {
    console.warn(
      `[Sitemap] SITE_URL is "${baseUrl}". Set NEXT_PUBLIC_SITE_URL to your live https:// domain in production.`,
    );
  }

  let flatUrls: MetadataRoute.Sitemap = [];

  try {
    await connectDB();

    // Fetch all flats
    const flats = await Flat.find()
      .select("_id updatedAt isSold")
      .limit(45000)
      .lean();

    flatUrls = flats.map((f: any) => ({
      url: `${baseUrl}/flats/${f._id}`,
      lastModified: f.updatedAt ? new Date(f.updatedAt) : new Date(),
      changeFrequency: f.isSold ? "monthly" : "weekly",
      priority: f.isSold ? 0.3 : 0.8,
    }));
  } catch (error) {
    console.error("[Sitemap Generation Error]:", error);
  }

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/flats`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
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

  return [...staticRoutes, ...flatUrls];
}
