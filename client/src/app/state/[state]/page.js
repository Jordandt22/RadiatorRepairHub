import React from "react";
import { notFound } from "next/navigation";

// Data
import states from "@/lib/data/states";

// Components
import Header from "./Header";
import SearchBar from "./SearchBar";
import Filters from "./Filters";
import ListingsWrapper from "./ListingsWrapper";

export async function generateStaticParams() {
  const topStates = ["CA", "TX", "FL", "NY", "PA", "IL"];
  return topStates.map((state) => ({ state }));
}

async function Page({ params, searchParams }) {
  const { state } = await params;
  const { page: pageParam } = await searchParams;
  const limit = 10;
  let page = 1;

  // Validate Page Param
  if (!isNaN(pageParam) && pageParam >= 1) {
    page = Number(pageParam);
  }

  // Get State Data
  const stateData = states.find((s) => s.code === state);
  if (!stateData) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <Header stateName={stateData.name} />

      {/* Search and Filter Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <SearchBar />

            {/* Sorting Dropdowns */}
            <Filters />
          </div>
        </div>
      </div>

      {/* Business Listings */}
      <ListingsWrapper stateData={stateData} page={page} limit={limit} />
    </div>
  );
}

export default Page;
