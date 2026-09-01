import React from "react";
import { notFound } from "next/navigation";

// Contexts
import { FilterProvider } from "@/contexts/FilterProvider";

// Components
import Header from "./Header";
import SearchHeader from "./SearchHeader";
import ContentWrapper from "./ContentWrapper";
import { fetchBusinessesSearch } from "@/lib/api/businesses";
import {
  buildListingsSearchBody,
  getListingsPage,
  LISTINGS_PAGE_LIMIT,
} from "@/lib/businesses/listingsSearch";
import { buildListingsItemList } from "@/lib/seo/structuredData";

async function BusinessesContainer({
  stateData,
  cityData,
  categoryData,
  searchParams,
  affiliateProducts = [],
  listingsListName = null,
  listingsListUrl = null,
  pageDescription = null,
}) {
  if (cityData && !stateData) {
    return notFound();
  }

  const page = getListingsPage(searchParams);
  const searchBody = buildListingsSearchBody({
    stateData,
    cityData,
    categoryData,
    searchParams,
  });

  const { data: initialListings, error: initialError } =
    await fetchBusinessesSearch(searchBody, page, LISTINGS_PAGE_LIMIT);

  const showLocationHeader = Boolean(stateData);
  const showCategoryHeader = Boolean(categoryData) && !showLocationHeader;

  const listingsSchema =
    listingsListName && listingsListUrl
      ? buildListingsItemList({
          businesses: initialError ? [] : initialListings?.businesses,
          name: listingsListName,
          url: listingsListUrl,
          page,
          pageSize: LISTINGS_PAGE_LIMIT,
        })
      : null;

  return (
    <div className="min-h-screen bg-background">
      {listingsSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(listingsSchema),
          }}
        />
      ) : null}

      {showLocationHeader ? (
        <Header
          stateData={stateData}
          cityData={cityData}
          pageDescription={pageDescription}
        />
      ) : showCategoryHeader ? (
        <Header
          categoryData={categoryData}
          pageDescription={pageDescription}
        />
      ) : (
        <SearchHeader title={searchParams?.title} />
      )}

      <FilterProvider>
        <ContentWrapper
          stateData={stateData}
          cityData={cityData}
          categoryData={categoryData}
          searchParams={searchParams}
          initialListings={initialError ? null : initialListings}
          initialListingsPage={page}
          initialSearchBody={searchBody}
          affiliateProducts={affiliateProducts}
        />
      </FilterProvider>
    </div>
  );
}

export default BusinessesContainer;
