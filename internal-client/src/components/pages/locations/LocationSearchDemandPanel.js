"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import {
  fetchAdminSearchStatsList,
  fetchAdminSearchStatsSummary,
} from "@/lib/api/searchStats";
import SearchStatsSummary, {
  SearchStatsSummarySkeleton,
} from "@/components/pages/businesses/search-stats/SearchStatsSummary";
import SearchStatsTable, {
  SearchStatsTableSkeleton,
} from "@/components/pages/businesses/search-stats/SearchStatsTable";
import SearchStatsTrendChart from "@/components/pages/businesses/search-stats/SearchStatsTrendChart";
import Pagination from "@/components/pages/dashboard/Pagination";
import { Input } from "@/components/ui/input";

const PAGE_LIMIT = 20;
const STATS_STALE_MS = 5 * 60_000;

function resolveSearchSort(value) {
  const allowed = new Set([
    "searches_desc",
    "searches_asc",
    "zero_results_desc",
    "zero_results_asc",
    "businesses_desc",
    "businesses_asc",
    "claimed_desc",
    "claimed_asc",
    "featured_desc",
    "featured_asc",
    "name_asc",
    "name_desc",
  ]);
  return allowed.has(value) ? value : "searches_desc";
}

export default function LocationSearchDemandPanel({
  location,
  kind,
  days,
  daysParam,
  page,
  searchQuery,
  searchInput,
  onSearchChange,
  sort,
  onSortChange,
  onPageChange,
  accessToken,
  logout,
}) {
  const dimension = kind === "city" ? "city" : "state";
  const dimensionId = location?.id || null;
  const resolvedSort = resolveSearchSort(sort);
  const showCityTable = kind === "state" && Boolean(dimensionId);

  const summaryQuery = useQuery({
    queryKey: [
      "admin-search-stats-summary",
      daysParam,
      dimension,
      dimensionId,
    ],
    queryFn: async () => {
      const result = await fetchAdminSearchStatsSummary(
        { days, dimension, dimensionId },
        accessToken,
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load search stats.");
      }
      return result.data;
    },
    enabled: Boolean(accessToken && dimensionId),
    staleTime: STATS_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const cityListQuery = useQuery({
    queryKey: [
      "admin-search-stats-list",
      "location-cities",
      dimensionId,
      page,
      daysParam,
      searchQuery,
      resolvedSort,
    ],
    queryFn: async () => {
      const result = await fetchAdminSearchStatsList(
        {
          page,
          limit: PAGE_LIMIT,
          days,
          dimension: "city",
          q: searchQuery,
          sort: resolvedSort,
          stateId: dimensionId,
        },
        accessToken,
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load search stats.");
      }
      return result.data;
    },
    enabled: Boolean(accessToken && showCityTable),
    staleTime: STATS_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const summaryError = summaryQuery.error?.message || null;
  const listError = cityListQuery.error?.message || null;
  const showSummarySkeleton = summaryQuery.isLoading && !summaryQuery.data;
  const showListSkeleton = cityListQuery.isLoading && !cityListQuery.data;
  const rows = cityListQuery.data?.rows ?? [];
  const total = cityListQuery.data?.count ?? 0;
  const totalPages = cityListQuery.data?.totalPages ?? 0;

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      {showSummarySkeleton ? (
        <SearchStatsSummarySkeleton />
      ) : summaryError && !summaryQuery.data ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {summaryError}
        </div>
      ) : summaryQuery.data ? (
        <>
          <SearchStatsSummary
            summary={summaryQuery.data}
            dimensionLabel={kind === "city" ? "Cities" : "States"}
            showTracked={false}
          />
          {days !== 1 ? (
            <SearchStatsTrendChart stats={summaryQuery.data} days={days} />
          ) : null}
        </>
      ) : null}

      {showCityTable ? (
        <>
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-medium text-foreground">
              Cities in {location?.name || "this state"}
            </h2>
            <p className="text-sm text-muted-foreground">
              City-page search demand. Click a row to open that city.
            </p>
          </div>
          <div className="relative min-w-0 md:max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Search cities…"
              aria-label="Search cities"
              className="rounded-full pl-9"
            />
          </div>
          {showListSkeleton ? (
            <SearchStatsTableSkeleton />
          ) : listError && !cityListQuery.data ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {listError}
            </div>
          ) : (
            <SearchStatsTable
              rows={rows}
              dimension="city"
              sort={resolvedSort}
              onSortChange={(nextSort) =>
                onSortChange?.(resolveSearchSort(nextSort))
              }
            />
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            displayPage={page}
            total={total}
            isFetching={cityListQuery.isFetching}
            onPrevious={() => onPageChange?.(Math.max(1, page - 1))}
            onNext={() => onPageChange?.(page + 1)}
          />
        </>
      ) : null}
    </div>
  );
}
