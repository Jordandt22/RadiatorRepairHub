import React from "react";
import { notFound } from "next/navigation";
import CitiesPage from "@/components/pages/cities/CitiesPage";

// Data
import STATES from "@/lib/data/states";
import CITIES from "@/lib/data/cities";

// Generate metadata for cities page
export async function generateMetadata({ params }) {
  const { state } = await params;

  const stateData = STATES.find((s) => s.code === state);

  if (!stateData) {
    return {
      title: "Cities Not Found - RadiatorRepairHub",
      description: "The requested state cities could not be found.",
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
      canonical: `https://radiatorrepairhub.com/states/${state}/cities`,
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

async function Page({ params }) {
  const { state } = await params;

  // Find the state data
  const stateData = STATES.find((s) => s.code === state);
  if (!stateData) {
    return notFound();
  }

  // Filter cities by state
  const stateCities = CITIES.filter((city) => city.state_id === stateData.id);

  // Sort cities alphabetically
  stateCities.sort((a, b) => a.name.localeCompare(b.name));

  // CollectionPage Schema for Cities
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Cities in ${stateData.name}`,
    description: `Browse all cities in ${stateData.name} with radiator repair services`,
    url: `https://radiatorrepairhub.com/states/${state}/cities`,
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
      <CitiesPage stateData={stateData} stateCities={stateCities} />
    </>
  );
}

export default Page;
