"use client";

import React from "react";
import useSWR from "swr";
import { Toaster } from "sonner";

// Utils
import { postFetcher } from "@/lib/utils/utils";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

// Components
import Listings from "./Listings";
import Pagination from "./Pagination";

export default function ListingsWrapper({ stateData, page = 1, limit = 10 }) {
  // Get filter state from context
  const { appliedFilters } = useFilters();

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

  if (error)
    return <div className="py-8 text-center">Failed to load businesses.</div>;
  if (!data) return <div className="py-8 text-center">Loading...</div>;

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

      <Toaster />
    </div>
  );
}
