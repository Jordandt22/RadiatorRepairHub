import React from "react";
import { notFound } from "next/navigation";
import CitiesPage from "@/components/pages/cities/CitiesPage";
import BranchBoundBanner from "@/components/promo/BranchBoundBanner";

// Data
import STATES from "@/lib/data/states";
import { fetchCitiesByStateId } from "@/lib/api/location";
import { NOINDEX_ROBOTS, INDEX_ROBOTS } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

// Generate metadata for cities page
export async function generateMetadata({ params }) {
  const { state } = await params;
  const stateCode = state.toUpperCase();

  const stateData = STATES.find((s) => s.code === stateCode);

  if (!stateData) {
    return {
      title: "Cities Not Found - RadiatorRepairHub",
      description: "The requested state cities could not be found.",
      robots: NOINDEX_ROBOTS,
    };
  }

  const title = `Cities in ${stateData.name} | Find Radiator Repair by City - RadiatorRepairHub`;
  const description = `Browse all cities in ${stateData.name} with radiator repair services. Find auto repair shops and cooling system specialists by city. Compare services and read reviews.`;

  return {
    title,
    description,
    keywords: `${stateData.name} cities, radiator repair by city, auto repair ${stateData.name} cities, mechanics by city ${stateData.name}`,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      siteName: "RadiatorRepairHub",
    },
    alternates: {
      canonical: `https://radiatorrepairhub.com/states/${stateCode}/cities`,
    },
    robots: INDEX_ROBOTS,
  };
}

async function Page({ params }) {
  const { state } = await params;
  const stateCode = state.toUpperCase();

  const stateData = STATES.find((s) => s.code === stateCode);
  if (!stateData) {
    return notFound();
  }

  const { data: stateCities } = await fetchCitiesByStateId(stateData.id);
  const sortedCities = [...(stateCities || [])].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Cities in ${stateData.name}`,
    description: `Browse all cities in ${stateData.name} with radiator repair services`,
    url: `https://radiatorrepairhub.com/states/${stateCode}/cities`,
    isPartOf: {
      "@id": "https://radiatorrepairhub.com/#website",
    },
    about: {
      "@type": "Service",
      serviceType: "Radiator Repair",
      areaServed: {
        "@type": "State",
        name: stateData.name,
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
      <CitiesPage stateData={stateData} stateCities={sortedCities} />
      <BranchBoundBanner />
    </>
  );
}

export default Page;
