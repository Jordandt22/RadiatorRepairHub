import React from "react";

// Components
import BusinessesContainer from "@/components/businesses/BusinessesContainer";
import { SEARCH_KEYWORDS } from "@/lib/seo/keywords";
import {
  buildPageMetadata,
  isFilteredListingUrl,
  NOINDEX_ROBOTS,
  SITE_URL,
} from "@/lib/seo/metadata";
import { fetchActiveAffiliateProductsByAliases } from "@/lib/api/affiliate-products";

// Kept distinct from the homepage headline so the two pages do not compete for
// the same "radiator repair near me" query.
const searchTitle = "Search Radiator Repair Shops by City & Rating";
const searchDescription =
  "Search radiator repair shops near you by city, rating, reviews, and opening hours. Filter the directory to find a cooling system specialist you can call today.";

const baseSearchMetadata = buildPageMetadata({
  title: searchTitle,
  description: searchDescription,
  keywords: SEARCH_KEYWORDS,
  path: "/search",
});

/**
 * Filtered result sets are near-duplicates of the bare search page, so only the
 * clean URL stays indexable. The state, city, and category pages are the
 * intended landing pages for those queries.
 */
export async function generateMetadata({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  if (!isFilteredListingUrl(resolvedSearchParams)) {
    return baseSearchMetadata;
  }

  return { ...baseSearchMetadata, robots: NOINDEX_ROBOTS };
}

export const revalidate = 120;

async function Page({ searchParams }) {
  const searchParamsData = await searchParams;

  const { data: affiliateData } = await fetchActiveAffiliateProductsByAliases([
    "valvoline",
    "radiator-cap",
    "ir-thermometer",
  ]);
  const featuredProducts = affiliateData?.products ?? [];

  // SearchResultsPage Schema
  const searchResultsSchema = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: "Search radiator repair shops",
    description:
      "Filter radiator repair shops and cooling system specialists by city, rating, reviews, and opening hours.",
    url: `${SITE_URL}/search`,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
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
      <BusinessesContainer
        searchParams={searchParamsData}
        affiliateProducts={featuredProducts}
      />
    </>
  );
}

export default Page;
