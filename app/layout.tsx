// app/layout.tsx

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import MaintenanceBanner from "@/components/MaintenanceBanner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Suspense } from "react";
import GAPageTracker from "@/components/GAPageTracker";
import CookieConsentBanner from "@/components/CookieConsentBanner";

// Configure Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    SITE_NAME,
    "Luxury Stays",
    "Hotel Booking",
    "Luxury Rooms",
    "Resort Reservation",
    "Online Hotel Booking BD",
    "Best Rates Hotel",
  ],
  authors: [{ name: SITE_NAME }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg?t=${Date.now()}`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} | Hotel Booking`,
        type: "image/jpeg",
      },
      {
        url: `${SITE_URL}/og-image.jpg?t=${Date.now()}`,
        width: 800,
        height: 420,
        alt: `${SITE_NAME} | Hotel Booking`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og-image.jpg?t=${Date.now()}`],
  },
  verification: {
    google: "btnaOk_cok44sK_BnN1Pz-trMY2KiXzEYTLT4L0Uyl8",
  },
  other: {
    "og:updated_time": new Date().toISOString(),
    "og:locale": "en_US",
    pinterest: "nopin",
    "format-detection": "telephone=no",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const timestamp = Date.now();

  return (
    <html lang="en">
      <head>
        {/* Pinterest */}
        <meta name="pinterest-rich-pin" content="true" />

        {/* Dynamic updated time */}
        <meta property="og:updated_time" content={new Date().toISOString()} />

        {/* Fallback Image */}
        <meta name="image" content={`${SITE_URL}/og-image.jpg?t=${timestamp}`} />

        {/* Google Verification */}
        <meta
          name="google-site-verification"
          content="btnaOk_cok44sK_BnN1Pz-trMY2KiXzEYTLT4L0Uyl8"
        />
      </head>
      <body className={`${poppins.className}`}>
        <AuthProvider>
          <MaintenanceBanner />
          <Navbar />
          {children}
          <Toaster position="top-center" />
          <Footer />
          <GoogleAnalytics />
          <Suspense fallback={null}>
            <GAPageTracker />
          </Suspense>
          <CookieConsentBanner />
        </AuthProvider>
      </body>
    </html>
  );
}


