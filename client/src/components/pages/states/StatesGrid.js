"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import BusinessCount from "@/components/content/BusinessCount";
import AnimatedStaggerRows from "@/components/ui/AnimatedStaggerRows";
import StateSearch from "./StateSearch";
import StateSort from "./StateSort";

function StateCard({ state }) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-4 transition-colors duration-200 hover:border-interactive">
      <Link
        href={`/state/${state.code}`}
        className="group flex min-w-0 items-center gap-3"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tint">
          <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-base font-semibold text-foreground">
            {state.name}
          </h3>
          <span className="text-sm text-muted-foreground">
            {state.code} · <BusinessCount count={state.business_count} />
          </span>
        </div>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-interactive"
          aria-hidden="true"
        />
      </Link>
      <Link
        href={`/states/${state.code}/cities`}
        className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted"
      >
        Cities
      </Link>
    </div>
  );
}

function StatesGrid({
  states,
  searchTerm,
  onSearchChange,
  sort,
  onSortChange,
  totalStates,
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
      <p className="mb-6 text-sm text-muted-foreground">
        <span className="font-semibold text-green-700">
          {(filteredCount ?? states.length).toLocaleString()}
        </span>{" "}
        {(filteredCount ?? states.length) === 1 ? "State" : "States"}
        {searchTerm?.trim() && totalStates
          ? ` of ${totalStates.toLocaleString()}`
          : null}
      </p>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <StateSearch searchTerm={searchTerm} onSearchChange={onSearchChange} />
        <StateSort sort={sort} onSortChange={onSortChange} />
      </div>

      {!states || states.length === 0 ? (
        <div className="mt-16 text-center">
          <h2 className="mb-4 font-heading text-2xl font-bold text-foreground">
            No States Found
          </h2>
          <p className="text-muted-foreground">
            No states match your search. Try a different name or abbreviation.
          </p>
        </div>
      ) : (
        <AnimatedStaggerRows
          items={states}
          getKey={(state) => state.id || state.code}
          refreshKey={refreshKey}
          renderItem={(state) => <StateCard state={state} />}
        />
      )}
    </div>
  );
}

export default StatesGrid;
