"use client";

import React from "react";
import { ChevronDown, Filter } from "lucide-react";

import { useFilters } from "@/contexts/FilterProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SORT_OPTIONS = [
  { value: 1, label: "Most Reviews" },
  { value: 2, label: "Least Reviews" },
  { value: 3, label: "Highest Rating" },
  { value: 4, label: "Lowest Rating" },
];

function Filters({ stateData, cityData, categoryData }) {
  const {
    showFilters,
    setShowFilters,
    updateSortOption,
    filters,
    appliedFilters,
  } = useFilters();

  const currentSort =
    SORT_OPTIONS.find(
      (option) => option.value === Number(appliedFilters?.sort_option || 1)
    ) ?? SORT_OPTIONS[0];

  const handleSortChange = (sortNum) => {
    setShowFilters(false);
    updateSortOption(stateData, cityData, filters, sortNum, categoryData);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          className="inline-flex min-w-[11.5rem] cursor-pointer items-center justify-between gap-2 rounded-full border border-border bg-card px-4 py-3 text-sm font-medium text-foreground outline-none transition-colors duration-200 hover:bg-muted"
          aria-label="Sort listings"
        >
          <span className="truncate">{currentSort.label}</span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-44 rounded-lg">
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className={`cursor-pointer rounded-md ${
                option.value === currentSort.value
                  ? "bg-tint text-primary"
                  : ""
              }`}
              onClick={() => handleSortChange(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`inline-flex cursor-pointer items-center justify-between gap-2 rounded-full border px-4 py-3 text-sm font-medium transition-colors duration-200 ${
          showFilters
            ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
            : "border-border bg-card text-foreground hover:bg-muted"
        }`}
      >
        <span className="flex items-center gap-2">
          <Filter className="h-4 w-4" aria-hidden="true" />
          Filters
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            showFilters
              ? "rotate-180 text-primary-foreground/70"
              : "text-muted-foreground"
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export default Filters;
