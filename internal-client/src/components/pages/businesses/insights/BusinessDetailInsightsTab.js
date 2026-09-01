"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  RefreshCw,
  Star,
} from "lucide-react";
import { fetchAdminCompetitorInsights } from "@/lib/api/businessStats";
import BusinessTitleLink from "@/components/pages/businesses/BusinessTitleLink";
import StatInfo from "@/components/pages/businesses/analytics/StatInfo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const PERIOD_OPTIONS = [
  { days: 1, label: "Today" },
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: "all", label: "All" },
];

const INSIGHTS_REFRESH_DEBOUNCE_MS = 1000;

function periodLabel(days) {
  if (days === 1) return "today";
  if (days === 30) return "in the last 30 days";
  if (days === "all") return "all time";
  return "in the last 7 days";
}

function marketName(city) {
  if (!city?.name) return "this city";
  return city.stateCode ? `${city.name}, ${city.stateCode}` : city.name;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatPosition(value) {
  if (value == null) return "—";
  return Number(value).toFixed(1);
}

function formatCtr(value) {
  if (value == null) return "—";
  return `${Number(value).toFixed(1)}%`;
}

function formatPercent(value) {
  if (value == null) return "—";
  return `${Number(value).toFixed(1)}%`;
}

function formatRank(rank, total) {
  if (rank == null) return "—";
  if (!total) return `#${rank}`;
  return `#${rank} of ${total}`;
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

function ListingBadges({ isFeatured, isClaimed }) {
  if (isFeatured) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
        <Star className="size-3 shrink-0 fill-current" aria-hidden="true" />
        Featured
      </span>
    );
  }
  if (isClaimed) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-500/15 dark:text-green-400">
        <BadgeCheck className="size-3 shrink-0" aria-hidden="true" />
        Claimed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      Unclaimed
    </span>
  );
}

function InsightCard({
  label,
  value,
  valueClassName = "text-foreground",
  note = null,
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
      {note ? (
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      ) : null}
    </div>
  );
}

function CompetitorRows({ rows, focusBusinessId }) {
  return (
    <div className="min-w-0 w-full space-y-3">
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className={cn(
              "rounded-lg border bg-card p-4",
              row.id === focusBusinessId
                ? "border-primary/50 bg-tint"
                : "border-border"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <BusinessTitleLink
                  id={row.id}
                  title={row.title}
                  slug={row.slug}
                  href={`/businesses/${row.id}?tab=insights`}
                  showSlug={false}
                />
                {row.id === focusBusinessId ? (
                  <p className="mt-1 text-xs font-semibold text-primary">
                    This listing
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatRank(row.impressionsRank)} by impressions
                  </p>
                )}
              </div>
              <ListingBadges
                isFeatured={row.isFeatured}
                isClaimed={row.isClaimed}
              />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Impressions</dt>
                <dd className="mt-0.5 font-medium tabular-nums">
                  {formatNumber(row.impressions)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Clicks</dt>
                <dd className="mt-0.5 font-medium tabular-nums">
                  {formatNumber(row.listingClicks)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">CTR</dt>
                <dd className={`mt-0.5 font-medium tabular-nums ${ctrColorClass(row.ctr)}`}>
                  {formatCtr(row.ctr)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Avg. position</dt>
                <dd
                  className={`mt-0.5 font-medium tabular-nums ${positionColorClass(row.avgPosition)}`}
                >
                  {formatPosition(row.avgPosition)}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <div className="hidden max-w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-lg border border-border bg-card md:block">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Listing</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Impressions</th>
              <th className="px-4 py-3 font-medium">Clicks</th>
              <th className="px-4 py-3 font-medium">CTR</th>
              <th className="px-4 py-3 font-medium">Avg. position</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-t border-border",
                  row.id === focusBusinessId ? "bg-tint" : "bg-card"
                )}
              >
                <td className="px-4 py-3 text-muted-foreground tabular-nums">
                  {row.impressionsRank ?? "—"}
                </td>
                <td className="max-w-0 px-4 py-3">
                  <BusinessTitleLink
                    id={row.id}
                    title={row.title}
                    slug={row.slug}
                    href={`/businesses/${row.id}?tab=insights`}
                  />
                </td>
                <td className="px-4 py-3">
                  <ListingBadges
                    isFeatured={row.isFeatured}
                    isClaimed={row.isClaimed}
                  />
                </td>
                <td className="px-4 py-3 tabular-nums text-foreground">
                  {formatNumber(row.impressions)}
                </td>
                <td className="px-4 py-3 tabular-nums text-foreground">
                  {formatNumber(row.listingClicks)}
                </td>
                <td
                  className={`px-4 py-3 font-medium tabular-nums ${ctrColorClass(row.ctr)}`}
                >
                  {formatCtr(row.ctr)}
                </td>
                <td
                  className={`px-4 py-3 font-medium tabular-nums ${positionColorClass(row.avgPosition)}`}
                >
                  {formatPosition(row.avgPosition)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading competitor insights">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-card px-4 py-4"
          >
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="mt-2 h-8 w-16 rounded-md" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-muted/60 px-4 py-3">
          <Skeleton className="h-4 w-40 rounded-md" />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-t border-border px-4 py-3"
          >
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="ml-auto h-4 w-10 rounded-md" />
            <Skeleton className="h-4 w-10 rounded-md" />
            <Skeleton className="h-4 w-10 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BusinessDetailInsightsTab({
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

  const { data: insights, error, isLoading, isFetching } = useQuery({
    queryKey: ["admin-competitor-insights", businessId, days],
    enabled: Boolean(accessToken && businessId),
    staleTime: 5 * 60_000,
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      const result = await fetchAdminCompetitorInsights(
        businessId,
        days,
        accessToken
      );
      if (result.status === 401) {
        logout();
        throw new Error("Session expired");
      }
      if (result.error) {
        throw new Error(
          result.error.message || "Failed to load competitor insights."
        );
      }
      return result.data;
    },
  });

  const rows = useMemo(() => {
    if (!insights?.available) return [];
    const competitors = Array.isArray(insights.competitors)
      ? insights.competitors
      : [];
    const self = insights.self;
    const merged = self ? [...competitors, self] : competitors;
    return [...merged].sort((a, b) => {
      const diff = Number(b.impressions || 0) - Number(a.impressions || 0);
      if (diff !== 0) return diff;
      return Number(b.listingClicks || 0) - Number(a.listingClicks || 0);
    });
  }, [insights]);

  const showSkeleton = isLoading && !insights;
  const errorMessage = error?.message || null;
  const refreshPending = isFetching || refreshLocked;

  const handleRefresh = () => {
    if (!businessId || refreshPending || refreshLockedRef.current) return;
    refreshLockedRef.current = true;
    setRefreshLocked(true);
    queryClient.invalidateQueries({
      queryKey: ["admin-competitor-insights", businessId],
    });
    refreshUnlockTimeoutRef.current = setTimeout(() => {
      refreshLockedRef.current = false;
      setRefreshLocked(false);
      refreshUnlockTimeoutRef.current = null;
    }, INSIGHTS_REFRESH_DEBOUNCE_MS);
  };

  const market = insights?.market || {};
  const self = insights?.self || null;
  const totalListings = Number(market.totalListings || 0);
  const ctrGap =
    self?.ctr != null && market.medianCtr != null
      ? Math.round((Number(self.ctr) - Number(market.medianCtr)) * 10) / 10
      : null;

  return (
    <TooltipProvider delay={200}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-tight">Insights</h2>
            <p className="text-sm text-muted-foreground">
              {insights?.city?.name
                ? `How this listing compares to other radiator shops in ${marketName(insights.city)} ${periodLabel(days)}.`
                : `City-level competitor performance for this listing ${periodLabel(days)}.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex max-w-full flex-wrap rounded-full border border-border bg-muted p-1">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() => setDays(option.days)}
                  className={cn(
                    "cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    days === option.days
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
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
              aria-label="Refresh competitor insights"
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
            Test listings are not incremented, so competitor activity may not
            reflect live traffic.
          </p>
        ) : null}

        {showSkeleton && <InsightsSkeleton />}

        {errorMessage && !insights && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        {!showSkeleton && !errorMessage && insights && !insights.available && (
          <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
            <p className="font-medium text-foreground">Not enough listings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Competitor insights need at least {insights.minMarketSize || 3}{" "}
              listings in {marketName(insights.city)}.
            </p>
          </div>
        )}

        {!showSkeleton && !errorMessage && insights?.available && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InsightCard
                label="Listings in city"
                value={formatNumber(totalListings)}
                note={`${formatNumber(market.claimedListings)} claimed · ${formatNumber(market.featuredListings)} Featured`}
                description={`Every radiator shop listed in ${marketName(insights.city)}.`}
              />
              <InsightCard
                label="Impressions rank"
                value={formatRank(self?.impressionsRank, totalListings)}
                valueClassName={
                  self?.impressionsRank && self.impressionsRank <= 3
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-foreground"
                }
                description="Where this listing ranks by impressions among all listings in the city for this period."
              />
              <InsightCard
                label="Impression share"
                value={formatPercent(self?.impressionShare)}
                note={
                  market.totalImpressions
                    ? `${formatNumber(market.totalImpressions)} city impressions`
                    : null
                }
                description="This listing's share of all listing impressions in the city for this period."
              />
              <InsightCard
                label="CTR vs city median"
                value={formatCtr(self?.ctr)}
                valueClassName={ctrColorClass(self?.ctr)}
                note={
                  market.medianCtr != null
                    ? `City median ${formatCtr(market.medianCtr)}${
                        ctrGap == null
                          ? ""
                          : ` · ${ctrGap >= 0 ? "+" : "−"}${Math.abs(ctrGap).toFixed(1)} pts`
                      }`
                    : "Not enough city activity yet"
                }
                description="This listing's click-through rate compared to the city median."
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InsightCard
                label="City median impressions"
                value={formatNumber(market.medianImpressions)}
                description="Median impressions across every listing in the city for this period."
              />
              <InsightCard
                label="City median CTR"
                value={formatCtr(market.medianCtr)}
                valueClassName={ctrColorClass(market.medianCtr)}
                description="Median click-through rate across listings with impressions in the city."
              />
              <InsightCard
                label="City median avg. position"
                value={formatPosition(market.medianAvgPosition)}
                valueClassName={positionColorClass(market.medianAvgPosition)}
                description="Median average listing position across listings with impressions in the city."
              />
            </div>

            {rows.length ? (
              <CompetitorRows rows={rows} focusBusinessId={businessId} />
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-card px-6 py-8 text-center">
                <p className="font-medium text-foreground">No competitor activity</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  No listings in {marketName(insights.city)} recorded activity{" "}
                  {periodLabel(days)}.
                </p>
              </div>
            )}
          </>
        )}

        <p className="text-xs text-muted-foreground">
          Competitor insights are not live. New activity can take a few minutes
          to appear.
        </p>
      </div>
    </TooltipProvider>
  );
}
