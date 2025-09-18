import React from "react";

// Components
import SearchBar from "./SearchBar";
import Filters from "./filters/Filters";
import FilterSection from "./filters/FilterSection";

function FiltersWrapper({ stateData, cityData, sort }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <SearchBar />

          {/* Filter Buttons */}
          <Filters stateData={stateData} cityData={cityData} sort={sort} />
        </div>

        {/* Filter Section */}
        <FilterSection stateData={stateData} cityData={cityData} />
      </div>
    </div>
  );
}

export default FiltersWrapper;
