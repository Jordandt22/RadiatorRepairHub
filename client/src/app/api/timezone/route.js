import { find } from "geo-tz";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ timezone: null }, { status: 400 });
  }

  try {
    const zones = find(lat, lng);
    return Response.json({ timezone: zones[0] ?? null });
  } catch {
    return Response.json({ timezone: null }, { status: 500 });
  }
}
