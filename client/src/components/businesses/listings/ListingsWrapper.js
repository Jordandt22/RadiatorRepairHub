"use client";

import React, { useEffect, useMemo } from "react";
import useSWR from "swr";

// Utils
import { postFetcher } from "@/lib/utils/utils";
import { LISTINGS_PAGE_LIMIT } from "@/lib/businesses/listingsSearch";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

// Components
import Listings from "./Listings";
import Pagination from "./Pagination";
import PageErrorMessage from "@/components/status/Errors/PageErrorMessage";
import ListingsSkeleton from "@/components/status/Skeletons/ListingsSkeleton";

const DEFAULT_APPLIED_FILTERS = {
  title: "",
  state_id: "",
  city_id: "",
  postal_code_id: "",
  total_score: 3,
  reviews_count: 1,
  primary_category_id: "",
  secondary_categories: [],
  features: {},
  open: {
    weekdays: false,
    weekends: false,
  },
  sort_option: 1,
};

export default function ListingsWrapper({
  stateData,
  cityData,
  page = 1,
  initialListings = null,
  initialListingsPage = 1,
  initialSearchBody = null,
}) {
  const { appliedFilters, setShowFilters } = useFilters();
  const limit = LISTINGS_PAGE_LIMIT;

  const requestBody = useMemo(() => {
    const base = appliedFilters ?? initialSearchBody ?? DEFAULT_APPLIED_FILTERS;
    return {
      ...base,
      state_id: stateData ? stateData.id : base.state_id,
      city_id: cityData ? cityData.id : base.city_id,
      sort_option: base.sort_option || 1,
    };
  }, [appliedFilters, initialSearchBody, stateData, cityData]);

  const swrKey = [
    `${process.env.NEXT_PUBLIC_API_URI}/businesses/search?page=${page}&limit=${limit}`,
    requestBody,
  ];

  const fallbackData =
    initialListings && page === initialListingsPage
      ? { data: initialListings, error: null }
      : undefined;

  const { data, error } = useSWR(swrKey, postFetcher, {
    fallbackData,
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  useEffect(() => {
    setShowFilters(false);
  }, [page, setShowFilters]);

  if (error || data?.error)
    return (
      <PageErrorMessage message={error?.message || data?.error?.message} />
    );
  if (!data) return <ListingsSkeleton />;

  const businessesData = data.data;
  const totalPages = businessesData?.totalPages;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Listings
        businesses={businessesData?.businesses}
        data={businessesData}
        page={page}
        stateData={stateData}
        cityData={cityData}
      />

      {totalPages > 0 && (
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          stateData={stateData}
          cityData={cityData}
          totalBusinesses={businessesData?.totalBusinesses}
          requestTotal={businessesData?.requestTotal}
          limit={limit}
        />
      )}
    </div>
  );
}
