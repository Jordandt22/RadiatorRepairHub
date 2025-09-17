import React from "react";
import { notFound } from "next/navigation";

// Data
import states from "@/lib/data/states";

// Contexts
import { FilterProvider } from "@/contexts/FilterProvider";
import { ToastProvider } from "@/contexts/ToastProvider";

// Components
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import Filters from "./components/filters/Filters";
import ListingsWrapper from "./components/ListingsWrapper";
import FilterSection from "./components/filters/FilterSection";

export async function generateStaticParams() {
  const topStates = ["CA", "TX", "FL", "NY", "PA", "IL"];
  return topStates.map((state) => ({ state }));
}

async function Page({ params, searchParams }) {
  const { state } = await params;
  const { page: pageParam, sort: sortParam } = await searchParams;
  const limit = 12;
  let page = 1;
  let sort = 1;

  // Validate Page Param
  if (!isNaN(pageParam) && pageParam >= 1) {
    page = Number(pageParam);
  }

  // Validate Sort Param
  const sortOptions = {
    most_reviews: 1,
    least_reviews: 2,
    highest_rating: 3,
    lowest_rating: 4,
  };
  if (sortOptions[sortParam]) {
    sort = sortOptions[sortParam];
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
      <ToastProvider>
        <FilterProvider>
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <SearchBar />

                {/* Filter Buttons */}
                <Filters stateData={stateData} sort={sort} />
              </div>

              {/* Filter Section */}
              <FilterSection stateData={stateData} />
            </div>
          </div>

          {/* Business Listings */}
          <ListingsWrapper stateData={stateData} page={page} limit={limit} />
        </FilterProvider>
      </ToastProvider>
    </div>
  );
}

export default Page;
