import React from "react";
import { notFound } from "next/navigation";

// Contexts
import { ToastProvider } from "@/contexts/ToastProvider";
import { FilterProvider } from "@/contexts/FilterProvider";

// Components
import Header from "./Header";
import SearchHeader from "./SearchHeader";
import ContentWrapper from "./ContentWrapper";

function BusinessesContainer({ stateData, cityData, searchParams }) {
  if (cityData && !stateData) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          />
        </FilterProvider>
      </ToastProvider>
    </div>
  );
}

export default BusinessesContainer;
