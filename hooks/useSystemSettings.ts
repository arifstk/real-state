// hooks/useSystemSettings.ts
"use client";

import { useEffect, useState } from "react";

export interface SystemSettingsData {
  email: string;
  phone: string;
  address: string;
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettingsData>({
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings({
            email: data.settings.email || "",
            phone: data.settings.phone || "",
            address: data.settings.address || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { settings, loading };
}
