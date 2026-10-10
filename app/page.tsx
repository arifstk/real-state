// app/page.tsx

import HeroBanner from "@/components/sections/HeroBanner";
import FlatsSection from "@/components/sections/FlatsSection";
import { Metadata } from "next";
import Script from "next/script";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import {
  Search,
  CalendarCheck,
  KeyRound,
  ShieldCheck,
  PhoneCall,
  BadgePercent,
  Calculator,
} from "lucide-react";
import CustomerReviewsSection from "@/components/sections/CustomerReviewsSection";

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const steps = [
  {
    icon: Search,
    title: "Find your flat",
    text: "Browse verified apartments by city, size and price, with photos, floor details and amenities.",
  },
  {
    icon: CalendarCheck,
    title: "Book a visit",
    text: "Send a booking request with your preferred visit date. The seller gets in touch with you directly.",
  },
  {
    icon: KeyRound,
    title: "Close the deal",
    text: "Meet the seller, check the papers on site and finalize your purchase with confidence.",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Verified listings",
    text: "Every flat is posted by a registered seller or agent.",
  },
  {
    icon: PhoneCall,
    title: "Direct contact",
    text: "Call or WhatsApp the seller straight from the flat page.",
  },
  {
    icon: BadgePercent,
    title: "Transparent pricing",
    text: "Clear sale price, discounts and price per sq ft on every listing.",
  },
  {
    icon: Calculator,
    title: "Home loan calculator",
    text: "Estimate your monthly EMI before you decide.",
  },
];

export default function HomePage() {
  const realEstateJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    areaServed: { "@type": "Country", name: "Bangladesh" },
    sameAs: [],
  };

  // Escape "<" so the JSON can never close the script tag
  const jsonLd = JSON.stringify(realEstateJsonLd).replace(/</g, "\\u003c");

  return (
    <>
      <Script
        id="real-estate-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <div className="min-h-screen bg-slate-50/50 py-5">
        <div className="max-w-7xl mx-auto space-y-14 px-2">
          <HeroBanner />

          <FlatsSection
            limit={8}
            title="Featured Flats for Sale"
            subtitle="Explore our handpicked selection of premium residential flats."
            showViewAll={true}
          />

          {/* How it works */}
          <section className="space-y-8">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                How it works
              </h2>
              <p className="text-xs text-slate-500">Buying your next home in three simple steps.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map(({ icon: Icon, title, text }, i) => (
                <div
                  key={title}
                  className="relative bg-white rounded-2xl border border-slate-200/80 p-6 text-center space-y-3"
                >
                  <span className="absolute top-4 left-4 text-xs font-extrabold text-slate-300">
                    0{i + 1}
                  </span>
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Why choose us */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-8 space-y-8">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                Why buy with {SITE_NAME}
              </h2>
              <p className="text-xs text-slate-500">Everything you need to choose a flat with confidence.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex flex-col items-center text-center gap-2">
                  <div className="w-11 h-11 rounded-full bg-slate-100 text-teal-600 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <CustomerReviewsSection limit={6} title="What our customers say" />
          </section>
        </div>
      </div>
    </>
  );
}

