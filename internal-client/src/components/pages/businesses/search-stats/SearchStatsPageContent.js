"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { RefreshCw, SearchIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { debounce } from "@/lib/debounce";
import useUrlQueryState from "@/hooks/useUrlQueryState";
import {
  fetchAdminSearchStatsList,
  fetchAdminSearchStatsSummary,
} from "@/lib/api/searchStats";
import SearchStatsDimensionTabs, {
  SEARCH_STATS_DIMENSIONS,
} from "@/components/pages/businesses/search-stats/SearchStatsDimensionTabs";
import SearchStatsSummary, {
  SearchStatsSummarySkeleton,
} from "@/components/pages/businesses/search-stats/SearchStatsSummary";
import SearchStatsTable, {
  SearchStatsTableSkeleton,
} from "@/components/pages/businesses/search-stats/SearchStatsTable";
import SearchStatsTrendChart from "@/components/pages/businesses/search-stats/SearchStatsTrendChart";
import Pagination from "@/components/pages/dashboard/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

function resolveDimension(value) {
  return SEARCH_STATS_DIMENSIONS.some((item) => item.id === value)
    ? value
    : "state";
}

function resolveDaysParam(value) {
  if (value === "1" || value === "7" || value === "30" || value === "all") {
    return value;
  }
  return "7";
}

function resolveSort(value) {
  return SORT_VALUES.has(value) ? value : "searches_desc";
}

function apiDays(value) {
  return value === "all" ? "all" : Number(value);
}

function dimensionLabel(dimension) {
  return (
    SEARCH_STATS_DIMENSIONS.find((item) => item.id === dimension)?.label ||
    "States"
  );
}

function searchPlaceholder(dimension) {
  if (dimension === "city") return "Search cities…";
  if (dimension === "category") return "Search categories…";
  return "Search states…";
}

export default function SearchStatsPageContent() {
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
    dimension: dimensionOption,
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
      dimension: {
        type: "option",
        param: "dimension",
        options: SEARCH_STATS_DIMENSIONS,
        defaultValue: SEARCH_STATS_DIMENSIONS[0],
      },
      sort: {
        type: "string",
        param: "sort",
        defaultValue: "searches_desc",
      },
    },
    { pathname: "/businesses/search-stats" },
  );

  const daysParam = resolveDaysParam(daysOption?.id || "7");
  const days = apiDays(daysParam);
  const dimension = resolveDimension(dimensionOption?.id || "state");
  const sort = resolveSort(sortRaw);
  const searchQuery = (q || "").trim();
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
      "admin-search-stats-list",
      page,
      daysParam,
      dimension,
      searchQuery,
      sort,
    ],
    queryFn: async () => {
      const result = await fetchAdminSearchStatsList(
        {
          page,
          limit: PAGE_LIMIT,
          days,
          dimension,
          q: searchQuery,
          sort,
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
    enabled: Boolean(isReady && accessToken),
    staleTime: STATS_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const summaryQuery = useQuery({
    queryKey: ["admin-search-stats-summary", daysParam, dimension],
    queryFn: async () => {
      const result = await fetchAdminSearchStatsSummary(
        { days, dimension },
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

  const handleRefresh = () => {
    if (refreshPending || refreshLockedRef.current) return;
    refreshLockedRef.current = true;
    setRefreshLocked(true);
    queryClient.invalidateQueries({ queryKey: ["admin-search-stats-list"] });
    queryClient.invalidateQueries({
      queryKey: ["admin-search-stats-summary"],
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
              Search Demand
            </h1>
            <p className="text-sm text-muted-foreground">
              Directory searches by state, city, and category, with live
              inventory for outreach.
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
              aria-label="Refresh search stats"
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

        <SearchStatsDimensionTabs
          value={dimension}
          onValueChange={(next) =>
            setField(
              "dimension",
              SEARCH_STATS_DIMENSIONS.find((item) => item.id === next) ??
                SEARCH_STATS_DIMENSIONS[0],
            )
          }
        />

        {showSummarySkeleton ? (
          <SearchStatsSummarySkeleton />
        ) : summaryError && !summary ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {summaryError}
          </div>
        ) : summary ? (
          <>
            <SearchStatsSummary
              summary={summary}
              dimensionLabel={dimensionLabel(dimension)}
            />
            {days !== 1 ? (
              <SearchStatsTrendChart stats={summary} days={days} />
            ) : null}
          </>
        ) : null}

        <div className="relative min-w-0 md:max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              debouncedSetSearch(event.target.value);
            }}
            placeholder={searchPlaceholder(dimension)}
            aria-label={searchPlaceholder(dimension)}
            disabled={refreshPending && showListSkeleton}
            className="rounded-full pl-9"
          />
        </div>

        {showListSkeleton ? (
          <SearchStatsTableSkeleton />
        ) : listError && !listQuery.data ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {listError}
          </div>
        ) : (
          <SearchStatsTable
            rows={rows}
            dimension={dimension}
            sort={sort}
            onSortChange={(nextSort) => setField("sort", resolveSort(nextSort))}
          />
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          displayPage={page}
          total={total}
          isFetching={listQuery.isFetching}
          onPrevious={() =>
            setField("page", Math.max(1, page - 1), { resetPage: false })
          }
          onNext={() => setField("page", page + 1, { resetPage: false })}
        />
      </div>
    </TooltipProvider>
  );
}
