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
    searchParams,
  });

  const { data: initialListings, error: initialError } =
    await fetchBusinessesSearch(searchBody, page, LISTINGS_PAGE_LIMIT);

  return (
    <div className="min-h-screen bg-background">
      {stateData ? (
        <Header stateData={stateData} cityData={cityData} />
      ) : (
        <SearchHeader title={searchParams?.title} />
      )}

      <ToastProvider>
        <FilterProvider>
          <ContentWrapper
            stateData={stateData}
            cityData={cityData}
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
