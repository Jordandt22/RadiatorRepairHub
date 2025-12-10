import { NextResponse } from "next/server";

export function proxy(req) {
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
