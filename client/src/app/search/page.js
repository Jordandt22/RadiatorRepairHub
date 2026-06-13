import React from "react";

// Components
import BusinessesContainer from "@/components/businesses/BusinessesContainer";
import { SEARCH_KEYWORDS } from "@/lib/seo/keywords";
import { buildPageMetadata } from "@/lib/seo/metadata";

const searchTitle =
  "Radiator Repair Near Me | Auto Repair Shops Near Me - RadiatorRepairHub";
const searchDescription =
  "Find radiator repair near me and auto repair shops near me in your area. Search for a radiator repair shop near me, compare ratings, read reviews, and connect with certified professionals.";

export const metadata = buildPageMetadata({
  title: searchTitle,
  description: searchDescription,
  keywords: SEARCH_KEYWORDS,
  path: "/search",
});

async function Page({ searchParams }) {
  const searchParamsData = await searchParams;

  // SearchResultsPage Schema
  const searchResultsSchema = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: "Radiator Repair Near Me",
    description:
      "Search results for radiator repair near me, auto repair shops near me, and radiator repair shop near me",
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
