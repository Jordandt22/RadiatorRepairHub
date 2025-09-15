"use client";

import React from "react";
import useSWR from "swr";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

// Components
import Listings from "./Listings";
import Pagination from "./Pagination";

// Fetcher function
const fetcher = (args) => {
  const url = args[0];
  const body = args[1];

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
};

export default function ListingsWrapper({ stateData, page = 1, limit = 10 }) {
  // Get filter state from context
  const {
    showFilters,
    setShowFilters,
    filters,
    clearAllFilters,
    updateFilter,
  } = useFilters();

  const { data, error } = useSWR(
    [
      `${process.env.NEXT_PUBLIC_API_URI}/businesses/search?page=${page}&limit=${limit}`,
      {
        state_id: stateData.id,
        sort_ascending: {
          total_score: false,
          reviews_count: false,
        },
      },
    ],
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      keepPreviousData: true,
    }
  );

  if (error)
    return <div className="py-8 text-center">Failed to load businesses.</div>;
  if (!data) return <div className="py-8 text-center">Loading...</div>;

  const stateBusinessesData = data.data;
  const totalPages = stateBusinessesData?.totalPages;
  const dataPage = stateBusinessesData?.page;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Listings
        businesses={stateBusinessesData?.businesses}
        dataPage={dataPage}
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
    </div>
  );
}
