// app/page.tsx

import HeroBanner from "@/components/sections/HeroBanner";
import HotelsSection from "@/components/sections/PropertiesSection";
import RoomsSection from "@/components/sections/FlatsSection";
import { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import Script from "next/script";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const hotelJsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    sameAs: [],
  };

  return (
    <>
      <Script
        id="hotel-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelJsonLd) }}
      />
      <div className="min-h-screen bg-slate-50/50 py-5">
        <div className="max-w-7xl mx-auto space-y-10">
          <HeroBanner />
          <HotelsSection limit={4} />
          <RoomsSection limit={8} showViewAll={true} />
        </div>
      </div>
    </>
  );
}

