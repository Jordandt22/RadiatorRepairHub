"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { ArrowLeftIcon, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/Auth.context";
import { fetchApi } from "@/lib/api/fetchApi";
import { debounce } from "@/lib/debounce";
import useUrlQueryState from "@/hooks/useUrlQueryState";
import PageFadeIn from "@/components/PageFadeIn";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import BusinessActions from "@/components/pages/businesses/BusinessActions";
import BusinessesTable from "@/components/pages/businesses/BusinessesTable";
import BusinessesTableSkeleton from "@/components/pages/businesses/BusinessesTableSkeleton";
import { VALID_TABS as ANALYTICS_SEGMENTS } from "@/components/pages/businesses/BusinessFilterTabs";
import { ACTIVITY_OPTIONS } from "@/components/pages/businesses/listing-analytics/BusinessesAnalyticsActions";
import Pagination from "@/components/pages/dashboard/Pagination";
import LocationDetailTabs, {
  LOCATION_DETAIL_TABS,
} from "@/components/pages/locations/LocationDetailTabs";
import LocationSearchDemandPanel from "@/components/pages/locations/LocationSearchDemandPanel";
import LocationAnalyticsPanel from "@/components/pages/locations/LocationAnalyticsPanel";

const PAGE_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 300;
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

function buildTitle(location, kind) {
  if (!location) {
    if (kind === "state") return "State businesses";
    if (kind === "city") return "City businesses";
    return "Postal code businesses";
  }
  if (kind === "state") {
    return `${location.name} (${location.code})`;
  }
  if (kind === "city") {
    return location.state_code
      ? `${location.name}, ${location.state_code}`
      : location.name;
  }
  const place = [location.city_name, location.state_code]
    .filter(Boolean)
    .join(", ");
  return place ? `${location.code} · ${place}` : String(location.code);
}

function backHrefForKind(kind) {
  if (kind === "state") return "/locations?tab=states";
  if (kind === "city") return "/locations?tab=cities";
  return "/locations?tab=postal-codes";
}

function backLabelForKind(kind) {
  if (kind === "state") return "Back to states";
  if (kind === "city") return "Back to cities";
  return "Back to postal codes";
}

function locationPathname(kind, param) {
  if (kind === "state") return `/states/${encodeURIComponent(param)}`;
  if (kind === "city") return `/cities/${encodeURIComponent(param)}`;
  return `/postal-codes/${encodeURIComponent(param)}`;
}

function resolveTab(value, kind) {
  if (kind === "postal-code") return "listings";
  if (value === "search-demand" || value === "analytics") return value;
  return "listings";
}

function resolveDaysParam(value) {
  if (value === "1" || value === "7" || value === "30" || value === "all") {
    return value;
  }
  return "7";
}

function apiDays(value) {
  return value === "all" ? "all" : Number(value);
}

function defaultSortForTab(tab) {
  if (tab === "search-demand") return "searches_desc";
  if (tab === "analytics") return "impressions_desc";
  return "";
}

/**
 * @param {{ kind: "state" | "city" | "postal-code", param: string }} props
 */
export default function LocationBusinessesPageContent({ kind, param }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, isReady, logout } = useAuth();
  const showDetailTabs = kind === "state" || kind === "city";
  const {
    q,
    page,
    tab: tabOption,
    days: daysOption,
    sort: sortRaw,
    segment: segmentOption,
    activity: activityOption,
    setField,
    setFields,
  } = useUrlQueryState(
    {
      q: { type: "string", param: "q" },
      page: { type: "page" },
      tab: {
        type: "option",
        param: "tab",
        options: LOCATION_DETAIL_TABS,
        defaultValue: LOCATION_DETAIL_TABS[0],
      },
      days: {
        type: "option",
        param: "days",
        options: DAYS_OPTIONS,
        defaultValue: DAYS_OPTIONS[1],
      },
      sort: {
        type: "string",
        param: "sort",
        defaultValue: "",
      },
      segment: {
        type: "option",
        param: "segment",
        options: ANALYTICS_SEGMENTS.map((id) => ({ id, label: id })),
      },
      activity: {
        type: "option",
        param: "activity",
        options: ACTIVITY_OPTIONS,
      },
    },
    { pathname: locationPathname(kind, param) },
  );

  const tab = resolveTab(tabOption?.id || "listings", kind);
  const daysParam = resolveDaysParam(daysOption?.id || "7");
  const days = apiDays(daysParam);
  const sort = sortRaw || defaultSortForTab(tab);
  const segment = segmentOption?.id || "all";
  const activity = activityOption?.id || "all";
  const [searchInput, setSearchInput] = useState(() => q || "");
  const [refreshError, setRefreshError] = useState(null);
  const [refreshLocked, setRefreshLocked] = useState(false);
  const refreshLockedRef = useRef(false);
  const refreshUnlockTimeoutRef = useRef(null);
  const setFieldRef = useRef(setField);
  setFieldRef.current = setField;

  const searchQuery = (q || "").trim();

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

  const handleSearchChange = (value) => {
    setSearchInput(value);
    debouncedSetSearch(value);
  };

  const locationQuery = useQuery({
    queryKey: ["admin-location", kind, param],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: "1",
      });
      if (kind === "state") params.set("state_code", param);
      if (kind === "city") params.set("city_slug", param);
      if (kind === "postal-code") params.set("postal_code", param);

      const result = await fetchApi(`/admin/businesses?${params.toString()}`, {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.status === 404) {
        throw new Error(result.error?.message || "Location not found");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to fetch location",
        );
      }
      return result.data;
    },
    enabled: isReady && !!accessToken && Boolean(param),
    staleTime: 30_000,
  });

  const { data, error, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["admin-location-businesses", kind, param, page, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
      });
      if (searchQuery) params.set("q", searchQuery);
      if (kind === "state") params.set("state_code", param);
      if (kind === "city") params.set("city_slug", param);
      if (kind === "postal-code") params.set("postal_code", param);

      const result = await fetchApi(`/admin/businesses?${params.toString()}`, {
        accessToken,
      });
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.status === 404) {
        throw new Error(result.error?.message || "Location not found");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to fetch businesses",
        );
      }
      return result.data;
    },
    enabled: isReady && !!accessToken && Boolean(param) && tab === "listings",
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const result = await fetchApi("/admin/cache/invalidate", {
        method: "POST",
        accessToken,
        body: JSON.stringify({ resource: "businesses" }),
      });

      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }

      if (result.error) {
        const message =
          typeof result.error.message === "string"
            ? result.error.message
            : "Failed to refresh cache";
        throw new Error(message);
      }

      return result.data;
    },
    onMutate: () => {
      setRefreshError(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-location-businesses", kind, param],
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin-location", kind, param],
      });
    },
    onError: (err) => {
      setRefreshError(err.message || "Failed to refresh");
    },
  });

  const handleStatsRefresh = () => {
    if (refreshLocked || refreshLockedRef.current) return;
    refreshLockedRef.current = true;
    setRefreshLocked(true);
    queryClient.invalidateQueries({ queryKey: ["admin-search-stats-list"] });
    queryClient.invalidateQueries({
      queryKey: ["admin-search-stats-summary"],
    });
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

  const handleTabChange = (nextTab) => {
    const resolved = resolveTab(nextTab, kind);
    setFields({
      tab:
        resolved === "listings"
          ? null
          : LOCATION_DETAIL_TABS.find((item) => item.id === resolved) ??
            LOCATION_DETAIL_TABS[0],
      page: 1,
      sort: defaultSortForTab(resolved),
    });
  };

  const businesses = useMemo(
    () => data?.businesses ?? [],
    [data?.businesses],
  );

  if (!isReady || !accessToken) {
    return null;
  }

  const location = locationQuery.data?.location ?? data?.location ?? null;
  const locationTotal = locationQuery.data?.total ?? data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const showInitialSkeleton =
    tab === "listings" && isLoading && !isPlaceholderData && !data;
  const hasSearch = Boolean(searchQuery);
  const title = buildTitle(location, kind);
  const total = data?.total ?? locationTotal;
  const showStatsControls = showDetailTabs && tab !== "listings";
  const locationError = locationQuery.error?.message || null;

  let subtitle = "Businesses in this location";
  if (tab === "search-demand") {
    subtitle = "Directory search demand for this location";
  } else if (tab === "analytics") {
    subtitle = `Listing analytics for shops located in ${title}`;
  } else if (location) {
    subtitle = `${locationTotal.toLocaleString()} business${locationTotal === 1 ? "" : "es"}`;
  }

  return (
    <TooltipProvider delay={200}>
      <PageFadeIn className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-fit cursor-pointer rounded-full px-2"
              nativeButton={false}
              render={<Link href={backHrefForKind(kind)} />}
            >
              <ArrowLeftIcon />
              {backLabelForKind(kind)}
            </Button>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          {showStatsControls ? (
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
                onClick={handleStatsRefresh}
                disabled={refreshLocked}
                aria-label="Refresh stats"
                className="shrink-0 cursor-pointer rounded-full"
              >
                <RefreshCw aria-hidden="true" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          ) : null}
        </div>

        {showDetailTabs ? (
          <LocationDetailTabs value={tab} onValueChange={handleTabChange} />
        ) : null}

        {locationError && !location ? (
          <p className="text-sm text-destructive">{locationError}</p>
        ) : null}

        {showDetailTabs &&
        locationQuery.isLoading &&
        !location &&
        tab !== "listings" ? (
          <BusinessesTableSkeleton />
        ) : null}

        {tab === "listings" ? (
          <>
            <BusinessActions
              searchValue={searchInput}
              onSearchChange={handleSearchChange}
              onRefresh={() => refreshMutation.mutate()}
              refreshPending={refreshMutation.isPending || isFetching}
              refreshError={refreshError}
            />

            {error && !isFetching ? (
              <p className="text-sm text-destructive">{error.message}</p>
            ) : null}

            {showInitialSkeleton ? (
              <BusinessesTableSkeleton />
            ) : !error || isPlaceholderData ? (
              <BusinessesTable
                businesses={businesses}
                activeTab="all"
                hasSearch={hasSearch}
              />
            ) : null}

            <Pagination
              page={page}
              totalPages={totalPages}
              displayPage={data?.page ?? page}
              total={total}
              isFetching={isFetching}
              onPrevious={() => setField("page", Math.max(1, page - 1))}
              onNext={() => setField("page", page + 1)}
            />
          </>
        ) : null}

        {tab === "search-demand" && location ? (
          <LocationSearchDemandPanel
            location={location}
            kind={kind}
            days={days}
            daysParam={daysParam}
            page={page}
            searchQuery={searchQuery}
            searchInput={searchInput}
            onSearchChange={handleSearchChange}
            sort={sort}
            onSortChange={(nextSort) => setField("sort", nextSort)}
            onPageChange={(nextPage) =>
              setField("page", nextPage, { resetPage: false })
            }
            accessToken={accessToken}
            logout={logout}
          />
        ) : null}

        {tab === "analytics" && location ? (
          <LocationAnalyticsPanel
            location={location}
            kind={kind}
            placeLabel={title}
            days={days}
            daysParam={daysParam}
            page={page}
            searchQuery={searchQuery}
            searchInput={searchInput}
            onSearchChange={handleSearchChange}
            sort={sort}
            onSortChange={(nextSort) => setField("sort", nextSort)}
            segment={segment}
            onSegmentChange={(next) =>
              setField(
                "segment",
                next === "all" ? null : { id: next, label: next },
              )
            }
            activity={activity}
            onActivityChange={(value) =>
              setField(
                "activity",
                value === "all"
                  ? null
                  : ACTIVITY_OPTIONS.find((option) => option.id === value),
              )
            }
            onPageChange={(nextPage) =>
              setField("page", nextPage, { resetPage: false })
            }
            accessToken={accessToken}
            logout={logout}
          />
        ) : null}
      </PageFadeIn>
    </TooltipProvider>
  );
}
