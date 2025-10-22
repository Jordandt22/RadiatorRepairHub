import React from "react";

// Components
import BusinessesContainer from "@/components/businesses/BusinessesContainer";

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

  // Convert slug to readable format
  const cityName = city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const stateName = state.toUpperCase();

  const title = `Radiator Repair in ${cityName}, ${stateName} | Find Auto Repair Shops - RadiatorRepairHub`;
  const description = `Find trusted radiator repair services in ${cityName}, ${stateName}. Browse our directory of verified auto repair shops, mechanics, and cooling system specialists. Compare services, read reviews, and connect with certified professionals.`;

  return {
    title,
    description,
    keywords: `radiator repair ${cityName} ${stateName}, auto repair ${cityName}, ${cityName} mechanics, cooling system repair ${cityName} ${stateName}, automotive services ${cityName}`,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      siteName: "RadiatorRepairHub",
    },
    alternates: {
      canonical: `https://radiatorrepairhub.com/state/${state}/city/${city}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

async function Page({ params, searchParams }) {
  const { state, city } = await params;
  const searchParamsData = await searchParams;

  // Convert slug to readable format for schema
  const cityName = city
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const stateName = state.toUpperCase();

  // CollectionPage Schema for City
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Radiator Repair Services in ${cityName}, ${stateName}`,
    description: `Directory of radiator repair shops and auto repair services in ${cityName}, ${stateName}`,
    url: `https://radiatorrepairhub.com/state/${state}/city/${city}`,
    isPartOf: {
      "@id": "https://radiatorrepairhub.com/#website",
    },
    about: {
      "@type": "Service",
      serviceType: "Radiator Repair",
      areaServed: {
        "@type": "City",
        name: cityName,
        containedInPlace: {
          "@type": "State",
          name: stateName,
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
        state={state}
        city={city}
        searchParams={searchParamsData}
      />
    </>
  );
}

export default Page;
