"use client";

import React from "react";
import { Search, X } from "lucide-react";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";
import { useToast } from "@/contexts/ToastProvider";

function SearchBar({ stateData, cityData, categoryData, page }) {
  const { updateFilter, applyFilters, filters, appliedFilters } = useFilters();
  const { showCustomError } = useToast();

  const handleSearch = () => {
    if (filters.title.length > 50) {
      return showCustomError(
        "Please keep your business name under 50 characters..",
        "Search Input Too Long"
      );
    }

    const specialCharacters = new RegExp(
      /[!@#$%^*()+\=\[\]{};:"\\|,.<>\/?]/,
      "gi"
    );
    if (specialCharacters.test(filters.title)) {
      return showCustomError(
        "Allowed: ', -, &, _",
        "Invalid Special Characters"
      );
    }

    applyFilters(filters, appliedFilters, stateData, cityData, page, {
      analyticsEvent: "business_search_submitted",
      source: "search_bar",
      categoryData,
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearInput = () => {
    updateFilter("title", "");
  };

  return (
    <div className="flex-1">
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="relative flex-1">
          <label htmlFor="business-search" className="sr-only">
            Search for business name
          </label>
          <input
            id="business-search"
            type="text"
            placeholder="Enter business name…"
            value={filters.title}
            onChange={(e) => updateFilter("title", e.target.value)}
            onKeyDown={handleKeyPress}
            className="w-full rounded-full border border-border bg-card py-3 pr-10 pl-10 text-foreground outline-none transition-colors duration-200 focus:border-ring"
            aria-describedby="search-help"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search
              className="h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
          </div>

          {filters.title && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                onClick={handleClearInput}
                className="cursor-pointer text-muted-foreground duration-200 hover:text-destructive"
                aria-label="Clear search input"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
          aria-label="Search for businesses"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
          Search
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
