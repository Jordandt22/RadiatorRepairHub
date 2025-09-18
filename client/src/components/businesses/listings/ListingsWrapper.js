"use client";

import React, { useEffect } from "react";
import useSWR from "swr";
import { Toaster } from "sonner";

// Utils
import { postFetcher } from "@/lib/utils/utils";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

// Components
import Listings from "./Listings";
import Pagination from "./Pagination";
import PageErrorMessage from "@/components/status/Errors/PageErrorMessage";
import ListingsSkeleton from "@/components/status/Skeletons/ListingsSkeleton";

export default function ListingsWrapper({ stateData, cityData, page = 1 }) {
  // Get filter state from context
  const { appliedFilters, setShowFilters } = useFilters();

  // Get Businesses
  const limit = 12;
  const { data, error } = useSWR(
    [
      `${process.env.NEXT_PUBLIC_API_URI}/businesses/search?page=${page}&limit=${limit}`,
      {
        ...appliedFilters,
        state_id: stateData ? stateData.id : appliedFilters.state_id,
        city_id: cityData ? cityData.id : appliedFilters.city_id,
      },
    ],
    postFetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  useEffect(() => {
    setShowFilters(false);
  }, [page]);

  if (error) return <PageErrorMessage message={error.message} />;
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
      />

      {/* Pagination */}
      {totalPages > 0 && (
        <>
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            stateData={stateData}
            cityData={cityData}
            totalBusinesses={businessesData?.totalBusinesses}
            requestTotal={businessesData?.requestTotal}
            limit={limit}
          />
        </>
      )}

      <Toaster
        toastOptions={{
          style: {
            background: "transparent",
            boxShadow: "none",
          },
        }}
      />
    </div>
  );
}
