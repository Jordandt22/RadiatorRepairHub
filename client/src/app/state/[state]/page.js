import React from "react";
import { notFound } from "next/navigation";
import STATES from "@/lib/data/states";
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
import {
  fetchCityBusinessCounts,
  fetchStateListingCount,
} from "@/lib/api/cachedReads";
import { getListingsPage } from "@/lib/businesses/listingsSearch";

export const revalidate = 120;
export const dynamicParams = true;

const TOP_CITY_LINKS = 24;

export async function generateStaticParams() {
  const topStates = ["CA", "TX", "FL", "NY", "WA"];
  return topStates.map((state) => ({ state }));
}

function findState(stateParam) {
  return STATES.find((s) => s.code === String(stateParam || "").toUpperCase());
}

// Generate metadata for state pages
export async function generateMetadata({ params, searchParams }) {
  const { state } = await params;
  const stateData = findState(state);

  if (!stateData) {
    return {
      title: "State Not Found | RadiatorRepairHub",
      description: "The requested state could not be found.",
      robots: NOINDEX_ROBOTS,
    };
  }

  const resolvedSearchParams = await searchParams;
  const page = getListingsPage(resolvedSearchParams);
  const listingCount = await fetchStateListingCount(stateData.id);

  return buildDirectoryMetadata({
    headline: `Radiator Repair in ${stateData.name} | Shops Near You`,
    description: composeDescription(
      listingCount > 0
        ? `Compare ${listingCount.toLocaleString()} radiator repair shops in ${stateData.name}.`
        : `Find radiator repair near you in ${stateData.name}.`,
      "Browse ratings, reviews, opening hours, and phone numbers by city.",
      "Call or get directions today."
    ),
    keywords: `radiator repair ${stateData.name}, radiator repair ${stateData.code}, radiator repair near me, auto repair shop ${stateData.name}, cooling system repair ${stateData.name}`,
    path: `/state/${stateData.code}`,
    page,
    searchParams: resolvedSearchParams,
  });
}

async function Page({ params, searchParams }) {
  const { state } = await params;
  const searchParamsData = await searchParams;

  const stateData = findState(state);

  if (!stateData) {
    return notFound();
  }

  const pageUrl = `${SITE_URL}/state/${stateData.code}`;

  const { data: cityCounts } = await fetchCityBusinessCounts(stateData.id);
  const topCities = [...(cityCounts?.cities ?? [])]
    .filter((city) => city?.slug && Number(city.business_count) > 0)
    .sort((a, b) => Number(b.business_count) - Number(a.business_count))
    .slice(0, TOP_CITY_LINKS)
    .map((city) => ({
      name: `Radiator repair in ${city.name}`,
      href: `/state/${stateData.code}/city/${city.slug}`,
      count: city.business_count,
    }));

  const totalBusinesses = (cityCounts?.cities ?? []).reduce(
    (sum, city) => sum + (Number(city.business_count) || 0),
    0
  );
  const cityCountWithListings = (cityCounts?.cities ?? []).filter(
    (city) => Number(city.business_count) > 0
  ).length;

  const collectionSchema = buildDirectoryCollectionSchema({
    name: `Radiator Repair in ${stateData.name}`,
    description: `Directory of radiator repair shops and cooling system specialists in ${stateData.name}.`,
    url: pageUrl,
    totalBusinesses,
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
        searchParams={searchParamsData}
        listingsListName={`Radiator Repair Shops in ${stateData.name}`}
        listingsListUrl={pageUrl}
        pageDescription={
          totalBusinesses > 0
            ? `RadiatorRepairHub lists ${totalBusinesses.toLocaleString()} radiator repair and cooling system shops across ${cityCountWithListings.toLocaleString()} ${stateData.name} ${
                cityCountWithListings === 1 ? "city" : "cities"
              }. Compare ratings, reviews, and opening hours, then call a shop or get directions.`
            : null
        }
      />

      <LocationLinks
        title={`Radiator Repair by City in ${stateData.name}`}
        description={`Pick a city to see radiator repair shops near you, with reviews, hours, and contact details for each ${stateData.name} listing.`}
        links={topCities}
        footerLink={{
          label: `View all ${stateData.name} cities`,
          href: `/states/${stateData.code}/cities`,
        }}
      />
    </>
  );
}

export default Page;
