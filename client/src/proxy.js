import { NextResponse } from "next/server";

const MEDIAVINE_ADS_TXT_URL =
  "https://adstxt.journeymv.com/sites/740b71f1-6750-4efc-8d1f-89390ce16418/ads.txt";

export function proxy(req) {
  if (req.nextUrl.pathname === "/ads.txt") {
    return NextResponse.redirect(MEDIAVINE_ADS_TXT_URL, 301);
  }

  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";
  const isMaintenancePage = req.nextUrl.pathname.startsWith("/maintenance");
  if (maintenanceMode && !isMaintenancePage) {
    const maintenanceUrl = req.nextUrl.clone();
    maintenanceUrl.pathname = "/maintenance";
    return NextResponse.redirect(maintenanceUrl);
  }

  return NextResponse.next();
}

// Define which routes the middleware runs on
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
