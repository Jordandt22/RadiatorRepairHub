import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import BusinessCount from "@/components/content/BusinessCount";
import CitySearch from "./CitySearch";
import CitySort from "./CitySort";

function CitiesGrid({
  cities,
  stateData,
  searchTerm,
  onSearchChange,
  sort,
  onSortChange,
  totalCities,
  filteredCount,
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="mb-6 text-sm text-muted-foreground">
        <span className="font-semibold text-green-700">
          {(filteredCount ?? cities.length).toLocaleString()}
        </span>{" "}
        {(filteredCount ?? cities.length) === 1 ? "City" : "Cities"}
        {searchTerm?.trim() && totalCities
          ? ` of ${totalCities.toLocaleString()}`
          : null}{" "}
        in {stateData.name}
      </p>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <CitySearch searchTerm={searchTerm} onSearchChange={onSearchChange} />
        <CitySort sort={sort} onSortChange={onSortChange} />
      </div>

      {!cities || cities.length === 0 ? (
        <div className="mt-16 text-center">
          <h2 className="mb-4 font-heading text-2xl font-bold text-foreground">
            No Cities Found
          </h2>
          <p className="text-muted-foreground">
            No cities match your search. Try a different city name.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={`/state/${stateData.code}/city/${city.slug}`}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors duration-200 hover:border-interactive"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tint">
                <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-heading text-base font-semibold text-foreground">
                  {city.name}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {stateData.code} ·{" "}
                  <BusinessCount count={city.business_count} />
                </span>
              </div>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-interactive"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default CitiesGrid;
