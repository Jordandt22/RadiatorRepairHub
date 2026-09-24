"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { PhoneIcon, RefreshCw, SearchIcon } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { debounce } from "@/lib/debounce";
import useUrlQueryState from "@/hooks/useUrlQueryState";
import {
  fetchAdminBusinessStatsList,
  fetchAdminBusinessStatsSummary,
  fetchAdminPhoneClickEvents,
} from "@/lib/api/businessStats";
import BusinessFilterTabs, {
  TAB_FILTERS,
  VALID_TABS,
} from "@/components/pages/businesses/BusinessFilterTabs";
import PhoneActivityBusinessesTable, {
  PhoneActivityBusinessesSkeleton,
} from "@/components/pages/businesses/phone-activity/PhoneActivityBusinessesTable";
import PhoneActivityContactChart, {
  PhoneActivityContactChartSkeleton,
} from "@/components/pages/businesses/phone-activity/PhoneActivityContactChart";
import PhoneActivityEventsTable, {
  PhoneActivityEventsSkeleton,
} from "@/components/pages/businesses/phone-activity/PhoneActivityEventsTable";
import PhoneActivityTrendChart, {
  PhoneActivityTrendChartSkeleton,
} from "@/components/pages/businesses/phone-activity/PhoneActivityTrendChart";
import Pagination from "@/components/pages/dashboard/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const BUSINESS_PAGE_LIMIT = 20;
const EVENTS_PAGE_LIMIT = 25;
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
  "phone_clicks_desc",
  "phone_clicks_asc",
  "impressions_desc",
  "impressions_asc",
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
  return SORT_VALUES.has(value) ? value : "phone_clicks_desc";
}

function apiDays(value) {
  return value === "all" ? "all" : Number(value);
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

export default function PhoneActivityPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const [refreshLocked, setRefreshLocked] = useState(false);
  const refreshLockedRef = useRef(false);
  const refreshUnlockTimeoutRef = useRef(null);

  const {
    q,
    page,
    eventsPage,
    days: daysOption,
    segment: segmentOption,
    sort: sortRaw,
    setField,
    setFields,
  } = useUrlQueryState(
    {
      q: { type: "string", param: "q" },
      page: { type: "page" },
      eventsPage: {
        type: "page",
        param: "ep",
        resetPageOnChange: false,
      },
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
      sort: {
        type: "string",
        param: "sort",
        defaultValue: "phone_clicks_desc",
      },
    },
    { pathname: "/businesses/phone-activity" },
  );

  const daysParam = resolveDaysParam(daysOption?.id || "7");
  const days = apiDays(daysParam);
  const segment = resolveSegment(segmentOption?.id || "all");
  const sort = resolveSort(sortRaw);
  const searchQuery = (q || "").trim();
  const claimedFilter = TAB_FILTERS[segment]?.claimed ?? null;
  const featuredFilter = TAB_FILTERS[segment]?.featured ?? null;
  const [searchInput, setSearchInput] = useState(() => q || "");
  const setFieldsRef = useRef(setFields);
  setFieldsRef.current = setFields;

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
        setFieldsRef.current(
          { q: value, page: 1, eventsPage: 1 },
          { resetPage: false },
        );
      }, SEARCH_DEBOUNCE_MS),
    [],
  );

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const resetFilters = (partial) => {
    setFields({ ...partial, page: 1, eventsPage: 1 }, { resetPage: false });
  };

  const listQuery = useQuery({
    queryKey: [
      "admin-phone-activity-businesses",
      page,
      daysParam,
      segment,
      searchQuery,
      sort,
    ],
    queryFn: async () => {
      const result = await fetchAdminBusinessStatsList(
        {
          page,
          limit: BUSINESS_PAGE_LIMIT,
          days,
          q: searchQuery,
          claimed: claimedFilter === true,
          featured: featuredFilter === true,
          activity: "has_phone",
          sort,
        },
        accessToken,
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to load phone click businesses.",
        );
      }
      return result.data;
    },
    enabled: Boolean(isReady && accessToken),
    staleTime: STATS_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const eventsQuery = useQuery({
    queryKey: [
      "admin-phone-activity-events",
      eventsPage,
      daysParam,
      segment,
      searchQuery,
    ],
    queryFn: async () => {
      const result = await fetchAdminPhoneClickEvents(
        {
          page: eventsPage,
          limit: EVENTS_PAGE_LIMIT,
          days,
          q: searchQuery,
          claimed: claimedFilter === true,
          featured: featuredFilter === true,
        },
        accessToken,
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to load phone click activity.",
        );
      }
      return result.data;
    },
    enabled: Boolean(isReady && accessToken),
    staleTime: STATS_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const summaryQuery = useQuery({
    queryKey: ["admin-phone-activity-summary", daysParam, segment],
    queryFn: async () => {
      const result = await fetchAdminBusinessStatsSummary(
        {
          days,
          claimed: claimedFilter === true,
          featured: featuredFilter === true,
        },
        accessToken,
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to load phone click summary.",
        );
      }
      return result.data;
    },
    enabled: Boolean(isReady && accessToken),
    staleTime: STATS_STALE_MS,
    placeholderData: keepPreviousData,
  });

  const isFetching =
    listQuery.isFetching || eventsQuery.isFetching || summaryQuery.isFetching;
  const refreshPending = isFetching || refreshLocked;
  const businessRows = listQuery.data?.rows ?? [];
  const businessTotal = listQuery.data?.count ?? 0;
  const businessTotalPages = listQuery.data?.totalPages ?? 0;
  const eventRows = eventsQuery.data?.rows ?? [];
  const eventTotal = eventsQuery.data?.count ?? 0;
  const eventTotalPages = eventsQuery.data?.totalPages ?? 0;
  const phoneClicksTotal = Number(summaryQuery.data?.totals?.phone_clicks || 0);
  const listError = listQuery.error?.message || null;
  const eventsError = eventsQuery.error?.message || null;
  const summaryError = summaryQuery.error?.message || null;
  const showListSkeleton = listQuery.isLoading && !listQuery.data;
  const showEventsSkeleton = eventsQuery.isLoading && !eventsQuery.data;
  const showChartsSkeleton = summaryQuery.isLoading && !summaryQuery.data;

  const handleRefresh = () => {
    if (refreshPending || refreshLockedRef.current) return;
    refreshLockedRef.current = true;
    setRefreshLocked(true);
    queryClient.invalidateQueries({
      queryKey: ["admin-phone-activity-businesses"],
    });
    queryClient.invalidateQueries({
      queryKey: ["admin-phone-activity-events"],
    });
    queryClient.invalidateQueries({
      queryKey: ["admin-phone-activity-summary"],
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
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-tight">
            Phone activity
          </h1>
          <p className="text-sm text-muted-foreground">
            Phone click events and businesses ranked by call interest.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex max-w-full flex-wrap rounded-full border border-border bg-muted p-1">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.days}
                type="button"
                onClick={() =>
                  resetFilters({
                    days: DAYS_OPTIONS.find((item) => item.id === option.days),
                  })
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
            aria-label="Refresh phone activity"
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
          resetFilters({
            segment: next === "all" ? null : { id: next, label: next },
          })
        }
      />

      <div className="relative min-w-0 md:max-w-sm">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchInput}
          onChange={(event) => {
            const value = event.target.value;
            setSearchInput(value);
            debouncedSetSearch(value);
          }}
          placeholder="Search businesses…"
          aria-label="Search businesses"
          className="rounded-full pl-9"
        />
      </div>

      {showChartsSkeleton ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card px-4 py-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-8 w-16" />
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-4">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-2 h-8 w-16" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card px-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PhoneIcon className="size-4" aria-hidden="true" />
              Phone clicks
            </div>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
              {formatNumber(phoneClicksTotal)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-4">
            <p className="text-sm text-muted-foreground">
              Businesses with phone clicks
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
              {formatNumber(businessTotal)}
            </p>
          </div>
        </div>
      )}

      {summaryError && !summaryQuery.data ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {summaryError}
        </div>
      ) : showChartsSkeleton ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <PhoneActivityTrendChartSkeleton />
          <PhoneActivityContactChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <PhoneActivityTrendChart stats={summaryQuery.data} days={days} />
          <PhoneActivityContactChart chart={summaryQuery.data?.phone_contact} />
        </div>
      )}

      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight">
            Recent phone clicks
          </h2>
          <p className="text-sm text-muted-foreground">
            Individual call-button taps across non-test listings.
          </p>
        </div>
        {eventsError && !eventsQuery.data ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {eventsError}
          </div>
        ) : showEventsSkeleton ? (
          <PhoneActivityEventsSkeleton />
        ) : (
          <PhoneActivityEventsTable rows={eventRows} />
        )}
        <Pagination
          page={eventsPage}
          totalPages={eventTotalPages}
          displayPage={eventsPage}
          total={eventTotal}
          isFetching={eventsQuery.isFetching}
          onPrevious={() => setField("eventsPage", eventsPage - 1, { resetPage: false })}
          onNext={() => setField("eventsPage", eventsPage + 1, { resetPage: false })}
        />
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight">
            Businesses by phone clicks
          </h2>
          <p className="text-sm text-muted-foreground">
            Listings with at least one phone click in the selected period.
          </p>
        </div>
        {listError && !listQuery.data ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {listError}
          </div>
        ) : showListSkeleton ? (
          <PhoneActivityBusinessesSkeleton />
        ) : (
          <PhoneActivityBusinessesTable
            rows={businessRows}
            sort={sort}
            onSortChange={(nextSort) => setField("sort", nextSort)}
          />
        )}
        <Pagination
          page={page}
          totalPages={businessTotalPages}
          displayPage={page}
          total={businessTotal}
          isFetching={listQuery.isFetching}
          onPrevious={() => setField("page", page - 1)}
          onNext={() => setField("page", page + 1)}
        />
      </section>
    </div>
  );
}
