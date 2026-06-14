import React from "react";
import { notFound } from "next/navigation";

// Components
import BusinessesContainer from "@/components/businesses/BusinessesContainer";
import { NOINDEX_ROBOTS, INDEX_ROBOTS } from "@/lib/seo/metadata";

// Data
import STATES from "@/lib/data/states";
import { fetchCityBySlug } from "@/lib/api/location";

export async function generateStaticParams() {
  const topCities = [
    { state: "CA", city: "los-angeles" },
    { state: "TX", city: "houston" },
    { state: "FL", city: "miami" },
    { state: "NY", city: "new-york-city" },
    { state: "PA", city: "philadelphia" },
    { state: "IL", city: "chicago" },
  ];
  return topCities.map((item) => ({ ...item }));
}

// Generate metadata for city pages
export async function generateMetadata({ params }) {
  const { state, city } = await params;
  const stateCode = state.toUpperCase();
  const stateData = STATES.find((s) => s.code === stateCode);

  let cityName = city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  if (stateData) {
    const { data: cityData } = await fetchCityBySlug(stateData.id, city);
    if (cityData?.name) {
      cityName = cityData.name;
    }
  }

  const stateName = stateCode;

  const title = `Radiator Repair in ${cityName}, ${stateName} | Find Auto Repair Shops - RadiatorRepairHub`;
  const description = `Find trusted radiator repair services in ${cityName}, ${stateName}. Browse our directory of verified auto repair shops, mechanics, and cooling system specialists. Compare services, read reviews, and connect with certified professionals.`;

  return {
    title,
    description,
    keywords: `radiator repair ${cityName} ${stateName}, auto repair shop ${cityName}, auto repair ${cityName}, radiator services ${cityName}, ${cityName} mechanics, cooling system repair ${cityName} ${stateName}`,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      siteName: "RadiatorRepairHub",
    },
    alternates: {
      canonical: `https://radiatorrepairhub.com/state/${stateName}/city/${city}`,
    },
    robots: INDEX_ROBOTS,
  };
}

async function Page({ params, searchParams }) {
  const { state, city } = await params;
  const searchParamsData = await searchParams;
  const stateCode = state.toUpperCase();

  const stateData = STATES.find((s) => s.code === stateCode);
  if (!stateData) {
    return notFound();
  }

  const { data: cityData } = await fetchCityBySlug(stateData.id, city);
  if (!cityData) {
    return notFound();
  }

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Radiator Repair Services in ${cityData.name}, ${stateCode}`,
    description: `Directory of radiator repair shops and auto repair services in ${cityData.name}, ${stateCode}`,
    url: `https://radiatorrepairhub.com/state/${state}/city/${city}`,
    isPartOf: {
      "@id": "https://radiatorrepairhub.com/#website",
    },
    about: {
      "@type": "Service",
      serviceType: "Radiator Repair",
      areaServed: {
        "@type": "City",
        name: cityData.name,
        containedInPlace: {
          "@type": "State",
          name: stateData.name,
        },
      },
    },
  };

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
      />
    </>
  );
}

export default Page;
