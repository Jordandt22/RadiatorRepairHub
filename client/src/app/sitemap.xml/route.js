import { NextResponse } from "next/server";
import { buildSitemapEntries } from "@/lib/seo/sitemap";
import { fetchAllCities } from "@/lib/api/location";
import { fetchPrimaryCategories } from "@/lib/api/categories";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = "https://radiatorrepairhub.com";
  const currentDate = new Date().toISOString();

  const [citiesResult, categoriesResult] = await Promise.all([
    fetchAllCities(),
    fetchPrimaryCategories(),
  ]);

  if (citiesResult.error) {
    console.warn("Sitemap: failed to fetch cities", citiesResult.error);
  }

  if (categoriesResult.error) {
    console.warn("Sitemap: failed to fetch categories", categoriesResult.error);
  }

  const allPages = buildSitemapEntries(
    currentDate,
    citiesResult.data || [],
    categoriesResult.data || []
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
