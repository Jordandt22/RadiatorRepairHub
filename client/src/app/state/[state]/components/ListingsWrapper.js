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
import PageErrorMessage from "@/components/Errors/PageErrorMessage";
import ListingsSkeleton from "@/components/Skeletons/ListingsSkeleton";

export default function ListingsWrapper({ stateData, page = 1, limit = 10 }) {
  // Get filter state from context
  const { appliedFilters, setShowFilters } = useFilters();

  // Get Businesses
  const { data, error } = useSWR(
    [
      `${process.env.NEXT_PUBLIC_API_URI}/businesses/search?page=${page}&limit=${limit}`,
      {
        ...appliedFilters,
        state_id: stateData.id,
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

  const stateBusinessesData = data.data;
  const totalPages = stateBusinessesData?.totalPages;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Listings
        businesses={stateBusinessesData?.businesses}
        data={stateBusinessesData}
        page={page}
        stateData={stateData}
      />

      {/* Pagination */}
      <Pagination
        totalPages={totalPages}
        currentPage={page}
        state={stateData}
        totalBusinesses={stateBusinessesData?.totalBusinesses}
        requestTotal={stateBusinessesData?.requestTotal}
        limit={limit}
      />

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
