"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { debounce } from "@/lib/debounce";
import useUrlQueryState from "@/hooks/useUrlQueryState";
import {
  fetchAdminBusinessStatsList,
  fetchAdminBusinessStatsSummary,
} from "@/lib/api/businessStats";
import BusinessFilterTabs, {
  TAB_FILTERS,
  VALID_TABS,
} from "@/components/pages/businesses/BusinessFilterTabs";
import { EMAIL_FILTERS, SCORE_TIERS } from "@/lib/businessTiers";
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
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;
const STATS_STALE_MS = 5 * 60_000;
const STATS_REFRESH_DEBOUNCE_MS = 1000;
const PERIOD_OPTIONS = [
  { days: "1", label: "Today" },
  { days: "7", label: "Last 7 days" },
  { days: "30", label: "Last 30 days" },
  { days: "all", label: "All" },
];
const DAYS_OPTIONS = PERIOD_OPTIONS.map((option) => ({
  id: option.days,
  label: option.label,
}));
const SORT_VALUES = new Set([
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

function resolveSegment(value) {
  return VALID_TABS.includes(value) ? value : "all";
}

function resolveDaysParam(value) {
  if (value === "1" || value === "7" || value === "30" || value === "all") {
    return value;
  }
  return "7";
}

function resolveSort(value) {
  return SORT_VALUES.has(value) ? value : "impressions_desc";
}

function apiDays(value) {
  return value === "all" ? "all" : Number(value);
}

export default function BusinessesAnalyticsPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const [refreshLocked, setRefreshLocked] = useState(false);
  const refreshLockedRef = useRef(false);
  const refreshUnlockTimeoutRef = useRef(null);

  const {
    q,
    page,
    days: daysOption,
    segment: segmentOption,
    activity: activityOption,
    score: scoreTier,
    contact: emailFilter,
    sort: sortRaw,
    setField,
  } = useUrlQueryState(
    {
      q: { type: "string", param: "q" },
      page: { type: "page" },
      days: {
        type: "option",
        param: "days",
        options: DAYS_OPTIONS,
        defaultValue: DAYS_OPTIONS[1],
      },
      segment: {
        type: "option",
        param: "segment",
        options: VALID_TABS.map((id) => ({ id, label: id })),
      },
      activity: {
        type: "option",
        param: "activity",
        options: ACTIVITY_OPTIONS,
      },
      score: { type: "option", param: "score", options: SCORE_TIERS },
      contact: { type: "option", param: "contact", options: EMAIL_FILTERS },
      sort: {
        type: "string",
        param: "sort",
        defaultValue: "impressions_desc",
      },
    },
    { pathname: "/businesses/analytics" },
  );

  const daysParam = resolveDaysParam(daysOption?.id || "7");
  const days = apiDays(daysParam);
  const segment = resolveSegment(segmentOption?.id || "all");
  const activity = activityOption?.id || "all";
  const scoreTierId = scoreTier?.id ?? null;
  const emailFilterId = emailFilter?.id ?? null;
  const sort = resolveSort(sortRaw);
  const searchQuery = (q || "").trim();
  const claimedFilter = TAB_FILTERS[segment]?.claimed ?? null;
  const featuredFilter = TAB_FILTERS[segment]?.featured ?? null;
  const [searchInput, setSearchInput] = useState(() => q || "");
  const setFieldRef = useRef(setField);
  setFieldRef.current = setField;

  useEffect(() => {
    if (isReady && !accessToken) {
      router.replace("/");
    }
  }, [isReady, accessToken, router]);

  useEffect(() => {
    setSearchInput(q || "");
  }, [q]);

  useEffect(() => {
    return () => {
      if (refreshUnlockTimeoutRef.current) {
        clearTimeout(refreshUnlockTimeoutRef.current);
      }
    };
  }, []);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value) => {
        setFieldRef.current("q", value);
      }, SEARCH_DEBOUNCE_MS),
    [],
  );

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const listQuery = useQuery({
    queryKey: [
      "admin-business-stats-list",
      page,
      daysParam,
      segment,
      activity,
      searchQuery,
      sort,
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
          activity,
          sort,
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
    enabled: Boolean(isReady && accessToken),
    staleTime: STATS_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const summaryQuery = useQuery({
    queryKey: [
      "admin-business-stats-summary",
      daysParam,
      segment,
      scoreTierId,
      emailFilterId,
    ],
    queryFn: async () => {
      const result = await fetchAdminBusinessStatsSummary(
        {
          days,
          claimed: claimedFilter === true,
          featured: featuredFilter === true,
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
    enabled: Boolean(isReady && accessToken),
    staleTime: STATS_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const isFetching = listQuery.isFetching || summaryQuery.isFetching;
  const refreshPending = isFetching || refreshLocked;
  const listError = listQuery.error?.message || null;
  const summaryError = summaryQuery.error?.message || null;
  const rows = listQuery.data?.rows ?? [];
  const total = listQuery.data?.count ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 0;
  const showListSkeleton = listQuery.isLoading && !listQuery.data;
  const showSummarySkeleton = summaryQuery.isLoading && !summaryQuery.data;
  const summary = summaryQuery.data;
  const hasTracked = Number(summary?.trackedCount || 0) > 0;

  const handleRefresh = () => {
    if (refreshPending || refreshLockedRef.current) return;
    refreshLockedRef.current = true;
    setRefreshLocked(true);
    queryClient.invalidateQueries({ queryKey: ["admin-business-stats-list"] });
    queryClient.invalidateQueries({
      queryKey: ["admin-business-stats-summary"],
    });
    refreshUnlockTimeoutRef.current = setTimeout(() => {
      refreshLockedRef.current = false;
      setRefreshLocked(false);
      refreshUnlockTimeoutRef.current = null;
    }, STATS_REFRESH_DEBOUNCE_MS);
  };

  if (!isReady || !accessToken) {
    return null;
  }

  return (
    <TooltipProvider delay={200}>
      <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold tracking-tight">
              Listing analytics
            </h1>
            <p className="text-sm text-muted-foreground">
              Impressions, clicks, and page views across non-test listings.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex max-w-full flex-wrap rounded-full border border-border bg-muted p-1">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() =>
                    setField(
                      "days",
                      DAYS_OPTIONS.find((item) => item.id === option.days),
                    )
                  }
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    daysParam === option.days
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshPending}
              aria-label="Refresh listing stats"
              className="shrink-0 cursor-pointer rounded-full"
            >
              <RefreshCw
                className={cn(isFetching && "animate-spin")}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        <BusinessFilterTabs
          value={segment}
          onValueChange={(next) =>
            setField(
              "segment",
              next === "all" ? null : { id: next, label: next },
            )
          }
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
          onSearchChange={(value) => {
            setSearchInput(value);
            debouncedSetSearch(value);
          }}
          activity={activity}
          onActivityChange={(value) =>
            setField(
              "activity",
              value === "all"
                ? null
                : ACTIVITY_OPTIONS.find((option) => option.id === value),
            )
          }
          scoreTier={scoreTier}
          onScoreTierChange={(tier) => setField("score", tier)}
          emailFilter={emailFilter}
          onEmailFilterChange={(filter) => setField("contact", filter)}
          disabled={refreshPending && showListSkeleton}
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
            sort={sort}
            onSortChange={(nextSort) =>
              setField("sort", resolveSort(nextSort))
            }
          />
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          displayPage={page}
          total={total}
          isFetching={listQuery.isFetching}
          onPrevious={() => setField("page", Math.max(1, page - 1), { resetPage: false })}
          onNext={() => setField("page", page + 1, { resetPage: false })}
        />
      </div>
    </TooltipProvider>
  );
}
