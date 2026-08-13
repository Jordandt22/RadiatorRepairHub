import React from "react";
import { notFound } from "next/navigation";

// Contexts
import { ToastProvider } from "@/contexts/ToastProvider";
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

async function BusinessesContainer({
  stateData,
  cityData,
  categoryData,
  searchParams,
  affiliateProducts = [],
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

  return (
    <div className="min-h-screen bg-background">
      {showLocationHeader ? (
        <Header stateData={stateData} cityData={cityData} />
      ) : showCategoryHeader ? (
        <Header categoryData={categoryData} />
      ) : (
        <SearchHeader title={searchParams?.title} />
      )}

      <ToastProvider>
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
      </ToastProvider>
    </div>
  );
}

export default BusinessesContainer;
