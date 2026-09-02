import { NextResponse } from "next/server";
import { getApiUri } from "@/lib/api/fetchApi";

function backendUnsubscribeUrl(token) {
  const apiUri = (getApiUri() || "").replace(/\/$/, "");
  return `${apiUri}/email/unsubscribe?token=${encodeURIComponent(token)}`;
}

export async function GET(request) {
  const token = request.nextUrl.searchParams.get("token") || "";
  const dest = new URL("/email/unsubscribe", request.nextUrl.origin);
  if (token) dest.searchParams.set("token", token);
  return NextResponse.redirect(dest);
}

export async function POST(request) {
  const token = request.nextUrl.searchParams.get("token") || "";
  if (!token) {
    return new NextResponse(null, { status: 400 });
  }

  const apiUri = getApiUri();
  if (!apiUri) {
    return new NextResponse(null, { status: 500 });
  }

  const response = await fetch(backendUnsubscribeUrl(token), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "List-Unsubscribe=One-Click",
    cache: "no-store",
  });

  if (response.ok) {
    return new NextResponse(null, { status: 200 });
  }
  return new NextResponse(null, { status: response.status === 500 ? 500 : 400 });
}
