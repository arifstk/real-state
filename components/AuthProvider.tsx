// components/AuthProvider.tsx

"use client";

import { CookieConsentProvider } from "@/context/CookieConsentContext";
import { SessionProvider } from "next-auth/react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>
    <CookieConsentProvider>
      {children}
    </CookieConsentProvider>
  </SessionProvider>;
}
