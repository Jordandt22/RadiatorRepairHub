import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * On-demand cache invalidation for the public site.
 * Called by the API server after claim / unclaim / account delete.
 */
export async function POST(request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const paths = Array.isArray(body?.paths) ? body.paths : [];
  const tags = Array.isArray(body?.tags) ? body.tags : [];

  const revalidatedPaths = [];
  const revalidatedTags = [];

  for (const path of paths) {
    if (typeof path !== "string" || !path.startsWith("/")) continue;
    revalidatePath(path);
    revalidatedPaths.push(path);
  }

  for (const tag of tags) {
    if (typeof tag !== "string" || !tag.trim()) continue;
    // Immediate expire for external/API-triggered updates (claim status).
    revalidateTag(tag, { expire: 0 });
    revalidatedTags.push(tag);
  }

  return NextResponse.json({
    revalidated: true,
    paths: revalidatedPaths,
    tags: revalidatedTags,
    now: Date.now(),
  });
}
