import React from "react";
import BusinessesContainer from "@/components/businesses/BusinessesContainer";
import LocationLinks from "@/components/seo/LocationLinks";
import { notFound } from "next/navigation";
import {
  fetchPrimaryCategoryBySlug,
  fetchPrimaryCategoryBusinessCounts,
  fetchStateBusinessCountsByLimit,
} from "@/lib/api/cachedReads";
import { CATEGORY_KEYWORDS } from "@/lib/seo/keywords";
import {
  buildDirectoryMetadata,
  composeDescription,
  NOINDEX_ROBOTS,
  SITE_URL,
  toTitleCase,
} from "@/lib/seo/metadata";
import { buildDirectoryCollectionSchema } from "@/lib/seo/structuredData";
import { getListingsPage } from "@/lib/businesses/listingsSearch";

export const revalidate = 120;

const TOP_STATE_LINKS = 12;
const SIBLING_CATEGORY_LINKS = 8;

async function getCategoryListingCount(categoryId) {
  const { data } = await fetchPrimaryCategoryBusinessCounts();
  return Number(
    (data?.categories ?? []).find((entry) => entry.id === categoryId)
      ?.business_count || 0
  );
}

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const formattedPage = getListingsPage(resolvedSearchParams);
  const { data: primaryCategory } = await fetchPrimaryCategoryBySlug(slug);

  if (!primaryCategory) {
    return {
      title: "Category Not Found | RadiatorRepairHub",
      description: "The requested category could not be found.",
      robots: NOINDEX_ROBOTS,
    };
  }

  const displayName = toTitleCase(primaryCategory.name);
  const lowerName = primaryCategory.name.toLowerCase();
  const listingCount = await getCategoryListingCount(primaryCategory.id);

  return buildDirectoryMetadata({
    headline: `${displayName} Near Me | Find Local Shops`,
    description: composeDescription(
      listingCount > 0
        ? `Compare ${listingCount.toLocaleString()} ${lowerName} listings near you.`
        : `Find ${lowerName} listings near you.`,
      "Browse ratings, reviews, and opening hours by city and state.",
      "Call a shop directly today."
    ),
    keywords:
      CATEGORY_KEYWORDS[slug.toLowerCase()] ??
      `${lowerName}, ${lowerName} near me, ${lowerName} services, radiator repair near me, auto repair, cooling system repair`,
    path: `/category/${slug}`,
    page: formattedPage,
    searchParams: resolvedSearchParams,
    indexable: listingCount > 0,
  });
}

async function Page({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const formattedPage = getListingsPage(resolvedSearchParams);

  const { data: primaryCategory } = await fetchPrimaryCategoryBySlug(slug);
  if (!slug || !primaryCategory) {
    return notFound();
  }

  const [{ data: categoryCounts }, { data: stateCounts }] = await Promise.all([
    fetchPrimaryCategoryBusinessCounts(),
    fetchStateBusinessCountsByLimit(TOP_STATE_LINKS),
  ]);

  const displayName = toTitleCase(primaryCategory.name);
  const lowerName = primaryCategory.name.toLowerCase();
  const pageUrl = `${SITE_URL}/category/${slug}`;

  const allCategories = categoryCounts?.categories ?? [];
  const listingCount = Number(
    allCategories.find((entry) => entry.id === primaryCategory.id)
      ?.business_count || 0
  );

  const stateLinks = (stateCounts?.states ?? [])
    .filter((state) => state?.code && Number(state.business_count) > 0)
    .slice(0, TOP_STATE_LINKS)
    .map((state) => ({
      name: state.name,
      href: `/state/${state.code}`,
      count: state.business_count,
    }));

  const siblingCategoryLinks = allCategories
    .filter(
      (entry) =>
        entry?.slug &&
        entry.id !== primaryCategory.id &&
        Number(entry.business_count) > 0
    )
    .sort((a, b) => Number(b.business_count) - Number(a.business_count))
    .slice(0, SIBLING_CATEGORY_LINKS)
    .map((entry) => ({
      name: toTitleCase(entry.name),
      href: `/category/${entry.slug}`,
      count: entry.business_count,
    }));

  const collectionSchema = buildDirectoryCollectionSchema({
    name: `${displayName} Near You`,
    description: `Browse verified ${lowerName} businesses across the United States.`,
    url: pageUrl,
    totalBusinesses: listingCount,
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema),
        }}
      />
      <BusinessesContainer
        categoryData={primaryCategory}
        searchParams={resolvedSearchParams}
        listingsListName={`${displayName} businesses`}
        listingsListUrl={pageUrl}
        pageDescription={
          listingCount > 0
            ? `RadiatorRepairHub lists ${listingCount.toLocaleString()} ${lowerName} businesses across the United States. Filter by city, rating, and opening hours to find one near you, then call or get directions.`
            : null
        }
      />

      <LocationLinks
        title={`${displayName} by state`}
        description={`Browse ${lowerName} listings in the states with the most shops, then narrow down to your city.`}
        links={stateLinks}
        footerLink={{
          label: "View all states",
          href: "/states",
        }}
      />

      <LocationLinks
        title="Related services"
        description={`Looking for something other than ${lowerName}? These categories cover the rest of the cooling system and general auto repair.`}
        links={siblingCategoryLinks}
        footerLink={{
          label: "View all categories",
          href: "/categories",
        }}
      />
    </>
  );
}

export default Page;
