// lib/seo.ts

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Luxury Stays";

export const SITE_DESCRIPTION =
  "Book premium hotels, luxury suites, and comfortable rooms at the best rates.";
