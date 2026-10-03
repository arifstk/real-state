// components/MaintenanceBanner.tsx

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function MaintenanceBanner() {
  const { data: session, status } = useSession();
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    const checkMaintenance = () => {
      fetch("/api/admin/system-settings", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          setIsMaintenance(!!data?.settings?.maintenanceMode);
        })
        .catch(() => { });
    };

    // Initial check
    checkMaintenance();

    // Poll every 5 seconds for live status updates
    const interval = setInterval(checkMaintenance, 5000);
    return () => clearInterval(interval);
  }, []);

  if (status === "loading") return null;

  const userRole = session?.user?.role || (session as any)?.role;
  const isSuperAdmin = userRole === "superadmin";

  if (!isMaintenance || !isSuperAdmin) return null;

  return (
    <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-2 text-center shadow-inner flex items-center justify-center gap-2 z-50 relative">
      <span>⚠️ Maintenance Mode is ACTIVE. Non-admin access is currently blocked.</span>
    </div>
  );
}

