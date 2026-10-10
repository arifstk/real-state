// // proxy.ts

// import { getToken } from "next-auth/jwt";
// import { NextRequest, NextResponse } from "next/server";

// export async function proxy(req: NextRequest) {
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   const { pathname } = req.nextUrl;

//   // Maintenance Mode Check
//   const isExcludedFromMaintenance =
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/api") ||
//     pathname.startsWith("/admin") ||
//     pathname.startsWith("/login") ||
//     pathname === "/maintenance";

//   if (!isExcludedFromMaintenance) {
//     try {
//       const settingsRes = await fetch(
//         `${req.nextUrl.origin}/api/admin/system-settings`,
//         {
//           cache: "no-store",
//         },
//       );
//       const settingsData = await settingsRes.json();
//       const isMaintenanceActive =
//         settingsData?.settings?.maintenanceMode ?? false;

//       // const userRole = token?.role || (token?.user as any)?.role;
//       const userRole = token?.role || (token?.user as { role?: string })?.role;

//       // If maintenance is ON and the user is NOT superadmin, redirect to /maintenance
//       if (isMaintenanceActive && userRole !== "superadmin") {
//         return NextResponse.redirect(new URL("/maintenance", req.url));
//       }
//     } catch (error) {
//       console.error("Maintenance check error in middleware:", error);
//     }
//   }

//   // 2. Existing Superadmin-only routes
//   if (pathname.startsWith("/admin")) {
//     if (!token || token.role !== "superadmin") {
//       return NextResponse.redirect(new URL("/", req.url));
//     }
//   }

//   // 3. Existing Logged-in user only routes
//   if (pathname.startsWith("/profile") || pathname.startsWith("/purchase")) {
//     if (!token) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }
//   }

//   // 4. Existing Vendor (এবং superadmin) only routes
//   if (pathname.startsWith("/vendor-dashboard")) {
//     if (!token || (token.role !== "vendor" && token.role !== "superadmin")) {
//       return NextResponse.redirect(new URL("/", req.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   // Added matcher patterns to ensure maintenance mode catches home/public routes as well
//   matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
// };



// proxy.ts

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Maintenance Mode Check
  const isExcludedFromMaintenance =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname === "/maintenance" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt";

  if (!isExcludedFromMaintenance) {
    try {
      const settingsRes = await fetch(
        `${req.nextUrl.origin}/api/admin/system-settings`,
        {
          cache: "no-store",
          signal: AbortSignal.timeout(3000),
        },
      );
      const settingsData = await settingsRes.json();
      const isMaintenanceActive =
        settingsData?.settings?.maintenanceMode ?? false;

      // const userRole = token?.role || (token?.user as any)?.role;
      const userRole = token?.role || (token?.user as { role?: string })?.role;

      // If maintenance is ON and the user is NOT superadmin, redirect to /maintenance
      if (isMaintenanceActive && userRole !== "superadmin") {
        return NextResponse.redirect(new URL("/maintenance", req.url));
      }
    } catch (error) {
      console.error("Maintenance check error in middleware:", error);
    }
  }

  // Existing Superadmin-only routes
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "superadmin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Existing Logged-in user only routes
  if (pathname.startsWith("/profile") || pathname.startsWith("/purchase")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Existing Vendor (superadmin) only routes
  if (pathname.startsWith("/vendor-dashboard")) {
    if (!token || (token.role !== "vendor" && token.role !== "superadmin")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|txt|xml)$).*)",
  ],
};
