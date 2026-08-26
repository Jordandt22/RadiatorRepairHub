"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Map as MapIcon,
  MapPin,
  RefreshCw,
  Search,
  Star,
  Tag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { fetchAdminBusinessStats } from "@/lib/api/businessStats";
import BusinessAnalyticsTrendChart from "@/components/pages/businesses/analytics/BusinessAnalyticsTrendChart";
import StatInfo from "@/components/pages/businesses/analytics/StatInfo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const SOURCE_META = {
  search: {
    label: "Search",
    icon: Search,
    className: "bg-primary/10 text-primary",
  },
  featured: {
    label: "Featured page",
    icon: Star,
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  },
  top_verified: {
    label: "Top Verified",
    icon: BadgeCheck,
    className:
      "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400",
  },
  state: {
    label: "State listings",
    icon: MapIcon,
    className: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-400",
  },
  city: {
    label: "City listings",
    icon: MapPin,
    className:
      "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-400",
  },
  category: {
    label: "Category listings",
    icon: Tag,
    className:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-400",
  },
};

const PERIOD_OPTIONS = [
  { days: 1, label: "Today" },
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: "all", label: "All" },
];

const STATS_REFRESH_DEBOUNCE_MS = 1000;

function SourcePill({ source }) {
  const meta = SOURCE_META[source];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}
    >
      <Icon
        className={`size-3.5 shrink-0 ${source === "featured" ? "fill-current" : ""}`}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  );
}

function periodEmptyCopy(days) {
  if (days === 1) return "today";
  if (days === 30) return "in the last 30 days";
  if (days === "all") return "yet";
  return "in the last 7 days";
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatPosition(value) {
  if (value == null) return "—";
  return Number(value).toFixed(1);
}

function positionColorClass(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "text-muted-foreground";
  }
  const position = Number(value);
  if (position <= 3) return "text-emerald-600 dark:text-emerald-400";
  if (position <= 6) return "text-teal-600 dark:text-teal-400";
  if (position <= 12) return "text-amber-600 dark:text-amber-400";
  if (position <= 24) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-500";
}

function ctrColorClass(value) {
  if (value == null || Number.isNaN(Number(value))) {
    return "text-muted-foreground";
  }
  const ctr = Number(value);
  if (ctr >= 8) return "text-emerald-600 dark:text-emerald-400";
  if (ctr >= 4) return "text-teal-600 dark:text-teal-400";
  if (ctr >= 2) return "text-amber-600 dark:text-amber-400";
  if (ctr >= 1) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-500";
}

function formatCtr(value) {
  if (value == null) return "—";
  return `${Number(value).toFixed(1)}%`;
}

function StatDelta({ delta, invert = false, vsLabel, unit = null }) {
  if (!delta || !vsLabel) return null;

  const change = Number(delta.change);
  const previous = Number(delta.previous);
  const percent = delta.percent;
  const isCurrentOnly =
    delta.currentOnly === true ||
    (delta.currentOnly !== false && previous === 0 && change > 0);
  const isEmpty = previous === 0 && change === 0;
  if (isEmpty) return null;

  const improved = invert ? change < 0 : change > 0;
  const declined = invert ? change > 0 : change < 0;
  const toneClass = improved
    ? "text-emerald-600 dark:text-emerald-400"
    : declined
      ? "text-red-600 dark:text-red-500"
      : "text-muted-foreground";
  const Icon = improved ? TrendingUp : declined ? TrendingDown : null;

  let valueLabel;
  if (isCurrentOnly) {
    valueLabel = "Current";
  } else if (unit === "pts") {
    const abs = Math.abs(change).toFixed(1);
    valueLabel = `${change > 0 ? "+" : change < 0 ? "−" : ""}${abs} pts`;
  } else if (invert) {
    const abs = Math.abs(change).toFixed(1);
    valueLabel = `${change > 0 ? "+" : change < 0 ? "−" : ""}${abs}`;
  } else if (percent == null) {
    valueLabel = `${change > 0 ? "+" : ""}${formatNumber(change)}`;
  } else {
    const absPercent = Math.abs(percent);
    const formatted =
      absPercent >= 10 ? Math.round(absPercent).toString() : absPercent.toFixed(1);
    valueLabel = `${change > 0 ? "+" : change < 0 ? "−" : ""}${formatted}%`;
  }

  return (
    <p className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${toneClass}`}>
      {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden="true" /> : null}
      <span>
        {valueLabel} vs {vsLabel}
      </span>
    </p>
  );
}

function StatCard({
  label,
  value,
  valueClassName = "text-foreground",
  delta = null,
  invertDelta = false,
  vsLabel = null,
  deltaUnit = null,
  description = null,
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <StatInfo label={label} description={description} />
      </div>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${valueClassName}`}>
        {value}
      </p>
      <StatDelta
        delta={delta}
        invert={invertDelta}
        vsLabel={vsLabel}
        unit={deltaUnit}
      />
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <Skeleton className="h-4 w-24 rounded-md" />
      <Skeleton className="mt-2 h-8 w-16 rounded-md" />
      <Skeleton className="mt-2 h-3 w-28 rounded-md" />
    </div>
  );
}

function AnalyticsSkeleton({ showChart }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading listing stats">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <StatCardSkeleton key={`top-${index}`} />
        ))}
      </div>

      {showChart ? (
        <div className="rounded-lg border border-border bg-card px-4 py-4">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="mt-2 h-4 w-64 max-w-full rounded-md" />
          <Skeleton className="mt-4 h-56 w-full rounded-lg" />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={`contact-${index}`} />
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-muted/60 px-4 py-3">
          <Skeleton className="h-4 w-40 rounded-md" />
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`row-${index}`}
            className="flex items-center gap-4 border-t border-border px-4 py-3"
          >
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="ml-auto h-4 w-10 rounded-md" />
            <Skeleton className="h-4 w-10 rounded-md" />
            <Skeleton className="h-4 w-10 rounded-md" />
            <Skeleton className="h-4 w-10 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BusinessDetailAnalyticsTab({
  business,
  accessToken,
  logout,
}) {
  const [days, setDays] = useState(7);
  const [refreshLocked, setRefreshLocked] = useState(false);
  const businessId = business?.id;
  const queryClient = useQueryClient();
  const refreshUnlockTimeoutRef = useRef(null);
  const refreshLockedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (refreshUnlockTimeoutRef.current) {
        clearTimeout(refreshUnlockTimeoutRef.current);
      }
    };
  }, []);

  const { data: stats, error, isLoading, isFetching } = useQuery({
    queryKey: ["admin-business-stats", businessId, days],
    enabled: Boolean(accessToken && businessId),
    staleTime: 5 * 60_000,
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      const result = await fetchAdminBusinessStats(
        businessId,
        days,
        accessToken
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(result.error.message || "Failed to load listing stats.");
      }
      return result.data;
    },
  });

  const totals = stats?.totals || {};
  const impressionsBySource = stats?.impressionsBySource || {};
  const clicksBySource = stats?.clicksBySource || {};
  const ctrBySource = stats?.ctrBySource || {};
  const avgPositionBySource = stats?.avgPositionBySource || {};
  const comparison = stats?.comparison || null;
  const vsLabel = comparison?.label || null;
  const deltaTotals = comparison?.totals || {};
  const sourceKeys = Object.keys(SOURCE_META);
  const hasAnyActivity =
    Number(totals.page_views || 0) +
      Number(totals.listing_clicks || 0) +
      Number(totals.impressions || 0) +
      Number(totals.phone_clicks || 0) +
      Number(totals.directions_clicks || 0) +
      Number(totals.website_clicks || 0) +
      Number(totals.email_clicks || 0) >
    0;
  const showSkeleton = isLoading && !stats;
  const errorMessage = error?.message || null;
  const refreshPending = isFetching || refreshLocked;

  const handleRefresh = () => {
    if (!businessId || refreshPending || refreshLockedRef.current) return;
    refreshLockedRef.current = true;
    setRefreshLocked(true);
    queryClient.invalidateQueries({
      queryKey: ["admin-business-stats", businessId],
    });
    refreshUnlockTimeoutRef.current = setTimeout(() => {
      refreshLockedRef.current = false;
      setRefreshLocked(false);
      refreshUnlockTimeoutRef.current = null;
    }, STATS_REFRESH_DEBOUNCE_MS);
  };

  return (
    <TooltipProvider delay={200}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight">Analytics</h2>
            <p className="text-sm text-muted-foreground">
              Listing views, clicks, and impressions for this business.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex max-w-full flex-wrap rounded-full border border-border bg-muted p-1">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() => setDays(option.days)}
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    days === option.days
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
              disabled={!businessId || refreshPending}
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

        {business?.is_test ? (
          <p className="rounded-lg border border-border bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
            Test listings are not incremented, so new views and clicks will not
            appear here.
          </p>
        ) : null}

        {showSkeleton && <AnalyticsSkeleton showChart={days !== 1} />}

        {errorMessage && !stats && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        {!showSkeleton && !errorMessage && stats && !hasAnyActivity && (
          <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
            <p className="font-medium text-foreground">No activity yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No stats {periodEmptyCopy(days)} for{" "}
              {business?.title || "this listing"}. Totals will appear here as
              customers see and visit it.
            </p>
          </div>
        )}

        {!showSkeleton && !errorMessage && hasAnyActivity && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <StatCard
                label="Page views"
                value={formatNumber(totals.page_views)}
                delta={deltaTotals.page_views}
                vsLabel={vsLabel}
                description="How many times customers opened this business page."
              />
              <StatCard
                label="Listing clicks"
                value={formatNumber(totals.listing_clicks)}
                delta={deltaTotals.listing_clicks}
                vsLabel={vsLabel}
                description="How many times customers clicked this listing card to open the page."
              />
              <StatCard
                label="Impressions"
                value={formatNumber(totals.impressions)}
                delta={deltaTotals.impressions}
                vsLabel={vsLabel}
                description="How many times this listing appeared on screen in search, Featured, Top Verified, or directory pages. An impression counts after the card stays at least half visible for about a second."
              />
              <StatCard
                label="CTR"
                value={formatCtr(stats?.ctr)}
                valueClassName={ctrColorClass(stats?.ctr)}
                delta={comparison?.ctr}
                vsLabel={vsLabel}
                deltaUnit="pts"
                description="The share of listing impressions that led to a click through to this page."
              />
              <StatCard
                label="Avg. position"
                value={formatPosition(stats?.avgPosition)}
                valueClassName={positionColorClass(stats?.avgPosition)}
                delta={comparison?.avgPosition}
                invertDelta
                vsLabel={vsLabel}
                description="How high this listing typically appears in those lists. Position 1 is first. A lower number means it showed up closer to the top."
              />
            </div>

            {days !== 1 && (
              <BusinessAnalyticsTrendChart stats={stats} days={days} />
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Phone clicks"
                value={formatNumber(totals.phone_clicks)}
                delta={deltaTotals.phone_clicks}
                vsLabel={vsLabel}
                description="How many times customers tapped the phone number on this business page."
              />
              <StatCard
                label="Directions clicks"
                value={formatNumber(totals.directions_clicks)}
                delta={deltaTotals.directions_clicks}
                vsLabel={vsLabel}
                description="How many times customers tapped for directions to this shop."
              />
              <StatCard
                label="Website clicks"
                value={formatNumber(totals.website_clicks)}
                delta={deltaTotals.website_clicks}
                vsLabel={vsLabel}
                description="How many times customers tapped the website on this business page."
              />
              <StatCard
                label="Email clicks"
                value={formatNumber(totals.email_clicks)}
                delta={deltaTotals.email_clicks}
                vsLabel={vsLabel}
                description="How many times customers tapped the email on this business page."
              />
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="bg-muted/60 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Impressions</th>
                    <th className="px-4 py-3 font-medium">Clicks</th>
                    <th className="px-4 py-3 font-medium">CTR</th>
                    <th className="px-4 py-3 font-medium">Avg. position</th>
                  </tr>
                </thead>
                <tbody className="bg-card">
                  {sourceKeys.map((source) => (
                    <tr key={source} className="border-t border-border bg-card">
                      <td className="px-4 py-3">
                        <SourcePill source={source} />
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {formatNumber(impressionsBySource[source])}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {formatNumber(clicksBySource[source])}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium ${ctrColorClass(
                          ctrBySource[source]
                        )}`}
                      >
                        {formatCtr(ctrBySource[source])}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium ${positionColorClass(
                          avgPositionBySource[source]
                        )}`}
                      >
                        {formatPosition(avgPositionBySource[source])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground">
          Listing stats are not live. New views and clicks can take a few
          minutes to appear.
        </p>
      </div>
    </TooltipProvider>
  );
}
