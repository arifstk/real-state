// components/CookieConsentBanner.tsx

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCookieConsent } from "@/context/CookieConsentContext";
import { Cookie } from "lucide-react";

const DELAY_MS = 8000;

export default function CookieConsentBanner() {
  const { status, accept, reject } = useCookieConsent();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status !== "pending") return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [status]);

  if (status !== "pending" || !visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-3 sm:pb-5">
      <div
        role="dialog"
        aria-label="Cookie consent"
        className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-xl shadow-slate-900/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 shrink-0 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
            <Cookie size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">We use cookies</p>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
              This site uses cookies to personalize your experience.{" "}
              <Link
                href="/privacy-policy"
                className="font-semibold text-teal-700 hover:text-teal-900 underline underline-offset-2"
              >
                Learn more
              </Link>
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 shrink-0 sm:ml-2">
          <button
            onClick={reject}
            className="flex-1 sm:flex-none px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition cursor-pointer"
          >
            Reject
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700 shadow-sm active:scale-95 transition cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

