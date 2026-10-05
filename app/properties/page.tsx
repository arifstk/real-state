
import { Metadata } from "next";
import HotelsSection from "@/components/sections/PropertiesSection";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse All Hotels | Premium Accommodations",
  description:
    "Explore our full directory of hotels. Find top-rated accommodations, modern amenities, and comfortable stays for your next trip.",
  alternates: {
    canonical: `${SITE_URL}/hotels`,
  },
  openGraph: {
    title: "Browse All Hotels | Premium Accommodations",
    description:
      "Explore our full directory of hotels. Find top-rated accommodations, modern amenities, and comfortable stays for your next trip.",
    url: `${SITE_URL}/hotels`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Hotels Directory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse All Hotels | Premium Accommodations",
    description:
      "Explore our full directory of hotels. Find top-rated accommodations, modern amenities, and comfortable stays for your next trip.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

const page = () => {
  return (
    <div className="max-w-7xl mx-auto pt-5 px-2">
      <HotelsSection />
    </div>
  );
};

export default page;

