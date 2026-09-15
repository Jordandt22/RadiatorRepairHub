import React from "react";
import { notFound } from "next/navigation";

import BusinessesContainer from "@/components/businesses/BusinessesContainer";
import LocationLinks from "@/components/seo/LocationLinks";
import STATES from "@/lib/data/states";
import {
  fetchCityBySlug,
  fetchCityCategoryCounts,
  fetchCategoryCityCounts,
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
const NEARBY_CITY_LINKS = 12;

function findState(stateParam) {
  return STATES.find((s) => s.code === String(stateParam || "").toUpperCase());
}

function titleCaseSlug(slug) {
  return String(slug || "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function getCityCategoryListingCount(cityId, categoryId) {
  const searchBody = buildListingsSearchBody({
    cityData: { id: cityId },
    categoryData: { id: categoryId },
    searchParams: {},
  });
  const { data } = await fetchBusinessesSearch(searchBody, 1, 1);
  return Number(data?.totalBusinesses || 0);
}

export async function generateMetadata({ params, searchParams }) {
  const { state, city, slug } = await params;
  const stateData = findState(state);
  const resolvedSearchParams = await searchParams;

  if (!stateData) {
    return {
      title: "Page Not Found | RadiatorRepairHub",
      description: "The requested page could not be found.",
      robots: NOINDEX_ROBOTS,
    };
  }

  const [{ data: cityData }, { data: primaryCategory }] = await Promise.all([
    fetchCityBySlug(stateData.id, city),
    fetchPrimaryCategoryBySlug(slug),
  ]);

  if (!cityData || !primaryCategory) {
    return {
      title: "Page Not Found | RadiatorRepairHub",
      description: "The requested page could not be found.",
      robots: NOINDEX_ROBOTS,
    };
  }

  const displayName = toTitleCase(primaryCategory.name);
  const lowerName = primaryCategory.name.toLowerCase();
  const cityName = cityData.name || titleCaseSlug(city);
  const location = `${cityName}, ${stateData.code}`;
  const page = getListingsPage(resolvedSearchParams);
  const listingCount = await getCityCategoryListingCount(
    cityData.id,
    primaryCategory.id
  );

  return buildDirectoryMetadata({
    headline: `${displayName} in ${location}`,
    description: composeDescription(
      listingCount > 0
        ? `${listingCount.toLocaleString()} ${lowerName} shops in ${location}.`
        : `Find ${lowerName} near you in ${location}.`,
      `Compare local ${lowerName} options with ratings, hours, and phone numbers.`,
      `Get directions in ${cityName} today.`
    ),
    keywords:
      CATEGORY_KEYWORDS[slug.toLowerCase()] ??
      `${lowerName} ${cityName}, ${lowerName} ${location}, ${lowerName} near me, radiator repair ${cityName}`,
    path: `/state/${stateData.code}/city/${city}/category/${slug}`,
    page,
    searchParams: resolvedSearchParams,
    indexable: listingCount > 0,
  });
}

async function Page({ params, searchParams }) {
  const { state, city, slug } = await params;
  const searchParamsData = await searchParams;

  const stateData = findState(state);
  if (!stateData) {
    return notFound();
  }

  const [{ data: cityData }, { data: primaryCategory }] = await Promise.all([
    fetchCityBySlug(stateData.id, city),
    fetchPrimaryCategoryBySlug(slug),
  ]);

  if (!cityData || !primaryCategory) {
    return notFound();
  }

  const [
    { data: cityCategoryCounts },
    { data: categoryCityCounts },
    listingCount,
  ] = await Promise.all([
    fetchCityCategoryCounts(cityData.id),
    fetchCategoryCityCounts(
      primaryCategory.id,
      NEARBY_CITY_LINKS + 1,
      stateData.id
    ),
    getCityCategoryListingCount(cityData.id, primaryCategory.id),
  ]);

  const displayName = toTitleCase(primaryCategory.name);
  const lowerName = primaryCategory.name.toLowerCase();
  const location = `${cityData.name}, ${stateData.code}`;
  const pageUrl = `${SITE_URL}/state/${stateData.code}/city/${city}/category/${slug}`;

  const siblingCategories = (cityCategoryCounts?.categories ?? [])
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
      href: `/state/${stateData.code}/city/${cityData.slug}/category/${entry.slug}`,
      count: entry.business_count,
    }));

  const nearbyCities = (categoryCityCounts?.cities ?? [])
    .filter(
      (entry) =>
        entry?.slug &&
        entry.state_code &&
        entry.id !== cityData.id &&
        Number(entry.business_count) > 0
    )
    .slice(0, NEARBY_CITY_LINKS)
    .map((entry) => ({
      name: `${displayName} in ${entry.name}`,
      href: `/state/${entry.state_code}/city/${entry.slug}/category/${slug}`,
      count: entry.business_count,
    }));

  const collectionSchema = buildDirectoryCollectionSchema({
    name: `${displayName} in ${location}`,
    description: `Directory of ${lowerName} shops in ${cityData.name}, ${stateData.name}.`,
    url: pageUrl,
    totalBusinesses: listingCount,
    areaServed: {
      "@type": "City",
      name: cityData.name,
      containedInPlace: {
        "@type": "State",
        name: stateData.name,
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
        cityData={cityData}
        categoryData={primaryCategory}
        searchParams={searchParamsData}
        listingsListName={`${displayName} shops in ${location}`}
        listingsListUrl={pageUrl}
        pageDescription={
          listingCount > 0
            ? `RadiatorRepairHub lists ${listingCount.toLocaleString()} ${lowerName} ${
                listingCount === 1 ? "shop" : "shops"
              } in ${location}. Compare ratings, reviews, and opening hours, then call a shop or get directions.`
            : null
        }
      />

      <LocationLinks
        title={`Other services in ${cityData.name}`}
        description={`Looking for something other than ${lowerName}? These categories also have shops in ${cityData.name}.`}
        links={siblingCategories}
        footerLink={{
          label: `All shops in ${cityData.name}`,
          href: `/state/${stateData.code}/city/${cityData.slug}`,
        }}
      />

      <LocationLinks
        title={`${displayName} in other ${stateData.name} cities`}
        description={`Compare ${lowerName} shops in other ${stateData.name} cities with listings in our directory.`}
        links={nearbyCities}
        footerLink={{
          label: `All ${displayName} in ${stateData.name}`,
          href: `/state/${stateData.code}/category/${slug}`,
        }}
      />
    </>
  );
}

export default Page;
