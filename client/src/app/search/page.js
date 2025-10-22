import React from "react";

// Components
import BusinessesContainer from "@/components/businesses/BusinessesContainer";

export const metadata = {
  title:
    "Search Radiator Repair Services | Find Auto Repair Shops Near You - RadiatorRepairHub",
  description:
    "Search for radiator repair services near you. Find trusted auto repair shops, compare ratings, read reviews, and connect with certified professionals in your area.",
  keywords:
    "search radiator repair, find auto repair shop, radiator repair near me, auto repair directory, cooling system repair",
  openGraph: {
    title:
      "Search Radiator Repair Services | Find Auto Repair Shops Near You - RadiatorRepairHub",
    description:
      "Search for radiator repair services near you. Find trusted auto repair shops, compare ratings, read reviews, and connect with certified professionals in your area.",
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
  },
  alternates: {
    canonical: "https://radiatorrepairhub.com/search",
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

async function Page({ searchParams }) {
  const searchParamsData = await searchParams;

  // SearchResultsPage Schema
  const searchResultsSchema = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: "Search Radiator Repair Services",
    description:
      "Search results for radiator repair services and auto repair shops",
    url: "https://radiatorrepairhub.com/search",
    isPartOf: {
      "@id": "https://radiatorrepairhub.com/#website",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(searchResultsSchema),
        }}
      />
      <BusinessesContainer searchParams={searchParamsData} />
    </>
  );
}

export default Page;
