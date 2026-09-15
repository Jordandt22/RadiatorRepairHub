import React from "react";
import { notFound } from "next/navigation";

import BusinessesContainer from "@/components/businesses/BusinessesContainer";
import LocationLinks from "@/components/seo/LocationLinks";
import STATES from "@/lib/data/states";
import {
  fetchStateCategoryCounts,
  fetchCategoryCityCounts,
  fetchCategoryStateCounts,
  fetchPrimaryCategoryBySlug,
} from "@/lib/api/cachedReads";
import { fetchBusinessesSearch } from "@/lib/api/businesses";
import {
  buildListingsSearchBody,
  getListingsPage,
} from "@/lib/businesses/listingsSearch";
import { CATEGORY_KEYWORDS } from "@/lib/seo/keywords";
import {
  buildDirectoryMetadata,
  composeDescription,
  NOINDEX_ROBOTS,
  SITE_URL,
  toTitleCase,
} from "@/lib/seo/metadata";
import { buildDirectoryCollectionSchema } from "@/lib/seo/structuredData";

export const revalidate = 3600;
export const dynamicParams = true;

const SIBLING_CATEGORY_LINKS = 8;
const CITY_LINKS = 12;
const SIBLING_STATE_LINKS = 8;

function findState(stateParam) {
  return STATES.find((s) => s.code === String(stateParam || "").toUpperCase());
}

async function getStateCategoryListingCount(stateId, categoryId) {
  const searchBody = buildListingsSearchBody({
    stateData: { id: stateId },
    categoryData: { id: categoryId },
    searchParams: {},
  });
  const { data } = await fetchBusinessesSearch(searchBody, 1, 1);
  return Number(data?.totalBusinesses || 0);
}

export async function generateMetadata({ params, searchParams }) {
  const { state, slug } = await params;
  const stateData = findState(state);
  const resolvedSearchParams = await searchParams;

  if (!stateData) {
    return {
      title: "Page Not Found | RadiatorRepairHub",
      description: "The requested page could not be found.",
      robots: NOINDEX_ROBOTS,
    };
  }

  const { data: primaryCategory } = await fetchPrimaryCategoryBySlug(slug);

  if (!primaryCategory) {
    return {
      title: "Page Not Found | RadiatorRepairHub",
      description: "The requested page could not be found.",
      robots: NOINDEX_ROBOTS,
    };
  }

  const displayName = toTitleCase(primaryCategory.name);
  const lowerName = primaryCategory.name.toLowerCase();
  const page = getListingsPage(resolvedSearchParams);
  const listingCount = await getStateCategoryListingCount(
    stateData.id,
    primaryCategory.id
  );

  return buildDirectoryMetadata({
    headline: `${displayName} in ${stateData.name}`,
    description: composeDescription(
      listingCount > 0
        ? `${listingCount.toLocaleString()} ${lowerName} shops in ${stateData.name}.`
        : `Find ${lowerName} near you in ${stateData.name}.`,
      `Browse by city across ${stateData.code} and compare ratings, hours, and phone numbers.`,
      "Call or get directions when you find a match."
    ),
    keywords:
      CATEGORY_KEYWORDS[slug.toLowerCase()] ??
      `${lowerName} ${stateData.name}, ${lowerName} ${stateData.code}, ${lowerName} near me, radiator repair ${stateData.name}`,
    path: `/state/${stateData.code}/category/${slug}`,
    page,
    searchParams: resolvedSearchParams,
    indexable: listingCount > 0,
  });
}

async function Page({ params, searchParams }) {
  const { state, slug } = await params;
  const searchParamsData = await searchParams;

  const stateData = findState(state);
  if (!stateData) {
    return notFound();
  }

  const { data: primaryCategory } = await fetchPrimaryCategoryBySlug(slug);
  if (!primaryCategory) {
    return notFound();
  }

  const [
    { data: stateCategoryCounts },
    { data: cityCounts },
    { data: categoryStateCounts },
    listingCount,
  ] = await Promise.all([
    fetchStateCategoryCounts(stateData.id),
    fetchCategoryCityCounts(primaryCategory.id, CITY_LINKS, stateData.id),
    fetchCategoryStateCounts(primaryCategory.id, SIBLING_STATE_LINKS + 1),
    getStateCategoryListingCount(stateData.id, primaryCategory.id),
  ]);

  const displayName = toTitleCase(primaryCategory.name);
  const lowerName = primaryCategory.name.toLowerCase();
  const pageUrl = `${SITE_URL}/state/${stateData.code}/category/${slug}`;

  const siblingCategories = (stateCategoryCounts?.categories ?? [])
    .filter(
      (entry) =>
        entry?.slug &&
        entry.id !== primaryCategory.id &&
        Number(entry.business_count) > 0
    )
    .slice(0, SIBLING_CATEGORY_LINKS)
    .map((entry) => ({
      name: toTitleCase(entry.name),
      href: `/state/${stateData.code}/category/${entry.slug}`,
      count: entry.business_count,
    }));

  const cityLinks = (cityCounts?.cities ?? [])
    .filter((entry) => entry?.slug && Number(entry.business_count) > 0)
    .slice(0, CITY_LINKS)
    .map((entry) => ({
      name: `${displayName} in ${entry.name}`,
      href: `/state/${stateData.code}/city/${entry.slug}/category/${slug}`,
      count: entry.business_count,
    }));

  const siblingStates = (categoryStateCounts?.states ?? [])
    .filter(
      (entry) =>
        entry?.code &&
        entry.code !== stateData.code &&
        Number(entry.business_count) > 0
    )
    .slice(0, SIBLING_STATE_LINKS)
    .map((entry) => ({
      name: `${displayName} in ${entry.name}`,
      href: `/state/${entry.code}/category/${slug}`,
      count: entry.business_count,
    }));

  const collectionSchema = buildDirectoryCollectionSchema({
    name: `${displayName} in ${stateData.name}`,
    description: `Directory of ${lowerName} shops in ${stateData.name}.`,
    url: pageUrl,
    totalBusinesses: listingCount,
    areaServed: {
      "@type": "State",
      name: stateData.name,
      address: {
        "@type": "PostalAddress",
        addressRegion: stateData.code,
        addressCountry: "US",
      },
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
        stateData={stateData}
        categoryData={primaryCategory}
        searchParams={searchParamsData}
        listingsListName={`${displayName} shops in ${stateData.name}`}
        listingsListUrl={pageUrl}
        pageDescription={
          listingCount > 0
            ? `RadiatorRepairHub lists ${listingCount.toLocaleString()} ${lowerName} ${
                listingCount === 1 ? "shop" : "shops"
              } in ${stateData.name}. Compare ratings, reviews, and opening hours, then call a shop or get directions.`
            : null
        }
      />

      <LocationLinks
        title={`${displayName} by city in ${stateData.name}`}
        description={`Narrow to a ${stateData.name} city to compare local ${lowerName} shops.`}
        links={cityLinks}
        footerLink={{
          label: `View all ${stateData.name} cities`,
          href: `/states/${stateData.code}/cities`,
        }}
      />

      <LocationLinks
        title={`Other services in ${stateData.name}`}
        description={`Looking for something other than ${lowerName}? These categories also have shops in ${stateData.name}.`}
        links={siblingCategories}
        footerLink={{
          label: `All shops in ${stateData.name}`,
          href: `/state/${stateData.code}`,
        }}
      />

      <LocationLinks
        title={`${displayName} in other states`}
        description={`Compare ${lowerName} shops across other states with listings in our directory.`}
        links={siblingStates}
        footerLink={{
          label: `All ${displayName} listings`,
          href: `/category/${slug}`,
        }}
      />
    </>
  );
}

export default Page;
