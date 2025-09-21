import React from "react";
import { notFound } from "next/navigation";

// Data
import STATES from "@/lib/data/states";
import CITIES from "@/lib/data/cities";

// Contexts
import { ToastProvider } from "@/contexts/ToastProvider";
import { FilterProvider } from "@/contexts/FilterProvider";

// Components
import Header from "./Header";
import SearchHeader from "./SearchHeader";
import ContentWrapper from "./ContentWrapper";

function BusinessesContainer({ state, city, searchParams }) {
  // Get State Data
  let stateData = null;
  if (state) {
    stateData = STATES.find((s) => s.code === state);
    if (!stateData) {
      return notFound();
    }
  }

  // Get City Data
  let cityData = null;
  if (city) {
    cityData = CITIES.find(
      (c) => c.slug === city && c.state_id === stateData.id
    );
    if (!cityData) {
      return notFound();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {stateData ? (
        <Header stateData={stateData} cityData={cityData} />
      ) : (
        <SearchHeader query={"PLACEHOLDER"} />
      )}

      <ToastProvider>
        <FilterProvider>
          <ContentWrapper
            stateData={stateData}
            cityData={cityData}
            searchParams={searchParams}
          />
        </FilterProvider>
      </ToastProvider>
    </div>
  );
}

export default BusinessesContainer;
