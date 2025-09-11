"use client";

import React from "react";
import useSWR from "swr";

// Components
import Listings from "./Listings";
import Pagination from "./Pagination";

// Fetcher function
const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function ListingsWrapper({ stateData, page = 1, limit = 10 }) {
  const { data, error } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URI}/businesses/state/${stateData.id}?page=${page}&limit=${limit}`,
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
  const totalPages = stateBusinessesData.totalPages;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Listings businesses={stateBusinessesData.businesses} />

      {/* Pagination */}
      <Pagination
        totalPages={totalPages}
        currentPage={page}
        state={stateData}
        totalBusinesses={stateBusinessesData.totalBusinesses}
        requestTotal={stateBusinessesData.requestTotal}
        limit={limit}
      />
    </div>
  );
}
