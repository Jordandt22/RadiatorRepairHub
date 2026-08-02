import React from "react";

// Components
import BusinessesContainer from "@/components/businesses/BusinessesContainer";
import { SEARCH_KEYWORDS } from "@/lib/seo/keywords";
import { buildPageMetadata } from "@/lib/seo/metadata";

const searchTitle =
  "Radiator Repair Near Me | Search Local Auto Repair Shops - RadiatorRepairHub";
const searchDescription =
  "Search radiator repair near me by location, rating, and services. Compare local auto repair shops, read reviews, and contact certified cooling system professionals.";

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
