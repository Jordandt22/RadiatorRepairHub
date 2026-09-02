"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchAdminBusinessStatsList,
  fetchAdminBusinessStatsSummary,
} from "@/lib/api/businessStats";
import BusinessFilterTabs, {
  TAB_FILTERS,
  VALID_TABS,
} from "@/components/pages/businesses/BusinessFilterTabs";
import BusinessesAnalyticsActions, {
  ACTIVITY_OPTIONS,
} from "@/components/pages/businesses/listing-analytics/BusinessesAnalyticsActions";
import BusinessesAnalyticsSummary, {
  BusinessesAnalyticsContactClicks,
  BusinessesAnalyticsSummarySkeleton,
} from "@/components/pages/businesses/listing-analytics/BusinessesAnalyticsSummary";
import BusinessesAnalyticsTable, {
  BusinessesAnalyticsTableSkeleton,
} from "@/components/pages/businesses/listing-analytics/BusinessesAnalyticsTable";
import BusinessesAnalyticsTrendChart from "@/components/pages/businesses/listing-analytics/BusinessesAnalyticsTrendChart";
import Pagination from "@/components/pages/dashboard/Pagination";

const PAGE_LIMIT = 20;
const STATS_STALE_MS = 5 * 60_000;

function resolveSegment(value) {
  return VALID_TABS.includes(value) ? value : "all";
}

function resolveActivity(value) {
  return ACTIVITY_OPTIONS.some((option) => option.id === value)
    ? value
    : "all";
}

function resolveAnalyticsSort(value) {
  const allowed = new Set([
    "impressions_desc",
    "impressions_asc",
    "listing_clicks_desc",
    "listing_clicks_asc",
    "ctr_desc",
    "ctr_asc",
    "page_views_desc",
    "page_views_asc",
    "title_asc",
    "title_desc",
  ]);
  return allowed.has(value) ? value : "impressions_desc";
}

export default function LocationAnalyticsPanel({
  location,
  kind,
  placeLabel,
  days,
  daysParam,
  page,
  searchQuery,
  searchInput,
  onSearchChange,
  sort,
  onSortChange,
  segment,
  onSegmentChange,
  activity,
  onActivityChange,
  scoreTier = null,
  onScoreTierChange,
  emailFilter = null,
  onEmailFilterChange,
  onPageChange,
  accessToken,
  logout,
}) {
  const locationId = location?.id || null;
  const stateId = kind === "state" ? locationId : null;
  const cityId = kind === "city" ? locationId : null;
  const resolvedSegment = resolveSegment(segment);
  const resolvedActivity = resolveActivity(activity);
  const resolvedSort = resolveAnalyticsSort(sort);
  const claimedFilter = TAB_FILTERS[resolvedSegment]?.claimed ?? null;
  const featuredFilter = TAB_FILTERS[resolvedSegment]?.featured ?? null;
  const scoreTierId = scoreTier?.id ?? null;
  const emailFilterId = emailFilter?.id ?? null;

  const listQuery = useQuery({
    queryKey: [
      "admin-business-stats-list",
      "location",
      kind,
      locationId,
      page,
      daysParam,
      resolvedSegment,
      resolvedActivity,
      searchQuery,
      resolvedSort,
      scoreTierId,
      emailFilterId,
    ],
    queryFn: async () => {
      const result = await fetchAdminBusinessStatsList(
        {
          page,
          limit: PAGE_LIMIT,
          days,
          q: searchQuery,
          claimed: claimedFilter === true,
          featured: featuredFilter === true,
          activity: resolvedActivity,
          sort: resolvedSort,
          stateId,
          cityId,
          scoreTier: scoreTierId,
          emailFilter: emailFilterId,
        },
        accessToken,
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to load listing stats.",
        );
      }
      return result.data;
    },
    enabled: Boolean(accessToken && locationId),
    staleTime: STATS_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const summaryQuery = useQuery({
    queryKey: [
      "admin-business-stats-summary",
      "location",
      kind,
      locationId,
      daysParam,
      resolvedSegment,
      scoreTierId,
      emailFilterId,
    ],
    queryFn: async () => {
      const result = await fetchAdminBusinessStatsSummary(
        {
          days,
          claimed: claimedFilter === true,
          featured: featuredFilter === true,
          stateId,
          cityId,
          scoreTier: scoreTierId,
          emailFilter: emailFilterId,
        },
        accessToken,
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to load listing stats.",
        );
      }
      return result.data;
    },
    enabled: Boolean(accessToken && locationId),
    staleTime: STATS_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const listError = listQuery.error?.message || null;
  const summaryError = summaryQuery.error?.message || null;
  const showListSkeleton = listQuery.isLoading && !listQuery.data;
  const showSummarySkeleton = summaryQuery.isLoading && !summaryQuery.data;
  const rows = listQuery.data?.rows ?? [];
  const total = listQuery.data?.count ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 0;
  const summary = summaryQuery.data;
  const hasTracked = Number(summary?.trackedCount || 0) > 0;

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <p className="text-sm text-muted-foreground">
        Impressions, clicks, and page views for shops located in {placeLabel},
        across all site surfaces.
      </p>

      <BusinessFilterTabs
        value={resolvedSegment}
        onValueChange={onSegmentChange}
      />

      {showSummarySkeleton ? (
        <BusinessesAnalyticsSummarySkeleton />
      ) : summaryError && !summary ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {summaryError}
        </div>
      ) : summary ? (
        <>
          <BusinessesAnalyticsSummary summary={summary} />
          {hasTracked && days !== 1 ? (
            <BusinessesAnalyticsTrendChart stats={summary} days={days} />
          ) : null}
          {hasTracked ? (
            <BusinessesAnalyticsContactClicks summary={summary} />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
              <p className="font-medium text-foreground">No tracked stats</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Charts exclude listings with no stats in this period.
              </p>
            </div>
          )}
        </>
      ) : null}

      <BusinessesAnalyticsActions
        searchValue={searchInput}
        onSearchChange={onSearchChange}
        activity={resolvedActivity}
        onActivityChange={onActivityChange}
        scoreTier={scoreTier}
        onScoreTierChange={onScoreTierChange}
        emailFilter={emailFilter}
        onEmailFilterChange={onEmailFilterChange}
        disabled={showListSkeleton}
      />

      {showListSkeleton ? (
        <BusinessesAnalyticsTableSkeleton />
      ) : listError && !listQuery.data ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {listError}
        </div>
      ) : (
        <BusinessesAnalyticsTable
          rows={rows}
          sort={resolvedSort}
          onSortChange={(nextSort) =>
            onSortChange?.(resolveAnalyticsSort(nextSort))
          }
        />
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        displayPage={page}
        total={total}
        isFetching={listQuery.isFetching}
        onPrevious={() => onPageChange?.(Math.max(1, page - 1))}
        onNext={() => onPageChange?.(page + 1)}
      />
    </div>
  );
}
