import { NextResponse } from "next/server";
import { buildSitemapEntries } from "@/lib/seo/sitemap";
import { fetchCitiesForSitemap, fetchCityCategoriesForSitemap, fetchStateCategoriesForSitemap, fetchStateBusinessCounts } from "@/lib/api/location";
import { fetchPrimaryCategoryBusinessCounts } from "@/lib/api/categories";
import { fetchBusinessSlugsForSitemap } from "@/lib/api/businesses";
import { getAllBlogPosts } from "@/lib/blogs";
import STATES from "@/lib/data/states";
import { SITE_URL } from "@/lib/seo/metadata";
import { SITEMAP_CACHE } from "@/lib/cachePolicy";

export const revalidate = 86400;

function formatSitemapUrl(baseUrl, page) {
  const lastmodLine = page.lastModified
    ? `\n    <lastmod>${page.lastModified}</lastmod>`
    : "";

  return `  <url>
    <loc>${baseUrl}${page.url}</loc>${lastmodLine}
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
}

export async function GET() {
  const blogPosts = getAllBlogPosts();

  const [citiesResult, cityCategoriesResult, stateCategoriesResult, categoriesResult, businessesResult, statesResult] =
    await Promise.all([
      fetchCitiesForSitemap(SITEMAP_CACHE),
      fetchCityCategoriesForSitemap(SITEMAP_CACHE),
      fetchStateCategoriesForSitemap(SITEMAP_CACHE),
      fetchPrimaryCategoryBusinessCounts(SITEMAP_CACHE),
      fetchBusinessSlugsForSitemap(),
      fetchStateBusinessCounts(
        { codes: STATES.map((state) => state.code) },
        SITEMAP_CACHE
      ),
    ]);

  if (citiesResult.error) {
    console.warn("Sitemap: failed to fetch cities", citiesResult.error);
  }

  if (cityCategoriesResult.error) {
    console.warn(
      "Sitemap: failed to fetch city-category pairs",
      cityCategoriesResult.error
    );
  }

  if (stateCategoriesResult.error) {
    console.warn(
      "Sitemap: failed to fetch state-category pairs",
      stateCategoriesResult.error
    );
  }

  if (categoriesResult.error) {
    console.warn("Sitemap: failed to fetch categories", categoriesResult.error);
  }

  if (businessesResult.error) {
    console.warn("Sitemap: failed to fetch businesses", businessesResult.error);
  }

  if (statesResult.error) {
    console.warn("Sitemap: failed to fetch state counts", statesResult.error);
  }

  const statesWithBusinesses = new Set(
    (statesResult.data?.states ?? [])
      .filter((state) => Number(state.business_count) > 0)
      .map((state) => String(state.code).toUpperCase())
  );

  const allPages = buildSitemapEntries({
    cities: citiesResult.data || [],
    cityCategories: cityCategoriesResult.data || [],
    stateCategories: stateCategoriesResult.data || [],
    primaryCategories: categoriesResult.data?.categories || [],
    businesses: businessesResult.data || [],
    blogPosts,
    statesWithBusinesses,
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((page) => formatSitemapUrl(SITE_URL, page)).join("\n")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
