import React from "react";
import { notFound } from "next/navigation";

// Components
import BusinessesContainer from "@/components/businesses/BusinessesContainer";
import LocationLinks from "@/components/seo/LocationLinks";
import {
  buildDirectoryMetadata,
  composeDescription,
  NOINDEX_ROBOTS,
  SITE_URL,
} from "@/lib/seo/metadata";
import { buildDirectoryCollectionSchema } from "@/lib/seo/structuredData";

// Data
import STATES from "@/lib/data/states";
import {
  fetchCityBySlug,
  fetchCityBusinessCounts,
} from "@/lib/api/cachedReads";
import { getListingsPage } from "@/lib/businesses/listingsSearch";

// ISR for city listings. Do not pair revalidate with a non-empty
// generateStaticParams subset — Next 16 then 404s cities outside that list.
export const revalidate = 120;
export const dynamicParams = true;

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

// Generate metadata for city pages
export async function generateMetadata({ params, searchParams }) {
  const { state, city } = await params;
  const stateData = findState(state);

  if (!stateData) {
    return {
      title: "City Not Found | RadiatorRepairHub",
      description: "The requested city could not be found.",
      robots: NOINDEX_ROBOTS,
    };
  }

  const resolvedSearchParams = await searchParams;
  const [{ data: cityData }, { data: cityCounts }] = await Promise.all([
    fetchCityBySlug(stateData.id, city),
    fetchCityBusinessCounts(stateData.id),
  ]);

  const cityName = cityData?.name || titleCaseSlug(city);
  const location = `${cityName}, ${stateData.code}`;
  const page = getListingsPage(resolvedSearchParams);
  const listingCount = Number(
    (cityCounts?.cities ?? []).find((entry) => entry.id === cityData?.id)
      ?.business_count || 0
  );

  return buildDirectoryMetadata({
    // City name leads the title because the queries that actually convert are
    // geo-specific ("radiator repair houston"), not the generic head term.
    headline: `Radiator Repair ${location} | Compare Local Shops`,
    description: composeDescription(
      listingCount > 0
        ? `Compare ${listingCount.toLocaleString()} radiator repair shops in ${location}.`
        : `Find radiator repair near you in ${location}.`,
      "See ratings, reviews, opening hours, and phone numbers.",
      "Call or get directions today."
    ),
    keywords: `radiator repair ${cityName}, radiator repair ${location}, radiator shop ${cityName}, radiator repair near me, auto repair shop ${cityName}, cooling system repair ${cityName}`,
    path: `/state/${stateData.code}/city/${city}`,
    page,
    searchParams: resolvedSearchParams,
    indexable: listingCount > 0,
  });
}

async function Page({ params, searchParams }) {
  const { state, city } = await params;
  const searchParamsData = await searchParams;

  const stateData = findState(state);
  if (!stateData) {
    return notFound();
  }

  const [{ data: cityData }, { data: cityCounts }] = await Promise.all([
    fetchCityBySlug(stateData.id, city),
    fetchCityBusinessCounts(stateData.id),
  ]);

  if (!cityData) {
    return notFound();
  }

  const pageUrl = `${SITE_URL}/state/${stateData.code}/city/${city}`;
  const location = `${cityData.name}, ${stateData.code}`;

  const allCities = cityCounts?.cities ?? [];
  const currentCityCount = allCities.find(
    (entry) => entry.id === cityData.id
  )?.business_count;

  const nearbyCities = allCities
    .filter(
      (entry) =>
        entry?.slug &&
        entry.id !== cityData.id &&
        Number(entry.business_count) > 0
    )
    .sort((a, b) => Number(b.business_count) - Number(a.business_count))
    .slice(0, NEARBY_CITY_LINKS)
    .map((entry) => ({
      name: `Radiator repair in ${entry.name}`,
      href: `/state/${stateData.code}/city/${entry.slug}`,
      count: entry.business_count,
    }));

  const collectionSchema = buildDirectoryCollectionSchema({
    name: `Radiator Repair in ${location}`,
    description: `Directory of radiator repair shops and cooling system specialists in ${cityData.name}, ${stateData.name}.`,
    url: pageUrl,
    totalBusinesses: currentCityCount,
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
        searchParams={searchParamsData}
        listingsListName={`Radiator repair shops in ${location}`}
        listingsListUrl={pageUrl}
        pageDescription={
          Number(currentCityCount) > 0
            ? `RadiatorRepairHub lists ${Number(currentCityCount).toLocaleString()} radiator repair and cooling system ${
                Number(currentCityCount) === 1 ? "shop" : "shops"
              } in ${location}. Compare ratings, reviews, and opening hours, then call a shop or get directions.`
            : null
        }
      />

      <LocationLinks
        title={`Radiator Repair near ${cityData.name}`}
        description={`No match in ${cityData.name}? These nearby ${stateData.name} cities also have radiator repair shops with reviews and contact details.`}
        links={nearbyCities}
        footerLink={{
          label: `View all ${stateData.name} cities`,
          href: `/states/${stateData.code}/cities`,
        }}
      />
    </>
  );
}

export default Page;
