"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import BusinessCount from "@/components/content/BusinessCount";
import AnimatedStaggerRows from "@/components/ui/AnimatedStaggerRows";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import CitySearch from "./CitySearch";
import CitySort from "./CitySort";

/** Display unit above the city count on state cities pages */
const CITIES_DISPLAY_SLOT = "1971759429";

function CityCard({ city, stateData }) {
  return (
    <Link
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
          {stateData.code} · <BusinessCount count={city.business_count} />
        </span>
      </div>
      <ArrowRight
        className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-interactive"
        aria-hidden="true"
      />
    </Link>
  );
}

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
  const isFirstRender = useRef(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setRefreshKey((key) => key + 1);
  }, [searchTerm, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <AdSenseUnit
        slot={CITIES_DISPLAY_SLOT}
        className="mb-6 min-h-[90px] overflow-hidden rounded-lg"
      />

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
        <AnimatedStaggerRows
          items={cities}
          getKey={(city) => city.id}
          refreshKey={refreshKey}
          renderItem={(city) => (
            <CityCard city={city} stateData={stateData} />
          )}
        />
      )}
    </div>
  );
}

export default CitiesGrid;
