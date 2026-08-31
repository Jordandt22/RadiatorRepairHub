"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Map as MapIcon,
  MapPin,
  RefreshCw,
  Search,
  Star,
  Tag,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { fetchOwnedBusinessStats } from "@/lib/api/businessStats";
import BusinessAnalyticsTrendChart from "@/components/dashboard/BusinessAnalyticsTrendChart";
import StatInfo from "@/components/dashboard/StatInfo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  dismissFeaturedCta,
  isFeaturedCtaDismissed,
} from "@/lib/featuredListingCtaStorage";

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

const PERIOD_OPTIONS = [
  { days: 1, label: "Today" },
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: "all", label: "All" },
];

const STATS_CACHE_TTL_MS = 5 * 60 * 1000;
const STATS_REFRESH_DEBOUNCE_MS = 1000;
const statsCache = Object.create(null);

function getCachedStats(key) {
  const entry = statsCache[key];
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > STATS_CACHE_TTL_MS) {
    delete statsCache[key];
    return null;
  }
  return entry.data;
}

function setCachedStats(key, data) {
  statsCache[key] = { data, cachedAt: Date.now() };
}

function clearCachedStatsForBusiness(businessId) {
  if (!businessId) return;
  const prefix = `${businessId}:`;
  for (const key of Object.keys(statsCache)) {
    if (key.startsWith(prefix)) {
      delete statsCache[key];
    }
  }
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
      <p
        className={`mt-1 font-heading text-2xl font-semibold ${valueClassName}`}
      >
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

function AnalyticsFeaturedCta({ business }) {
  const posthog = usePostHog();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!business?.id || business.is_featured) {
      setVisible(false);
      return;
    }
    setVisible(!isFeaturedCtaDismissed(business.id, "analytics"));
  }, [business?.id, business?.is_featured]);

  if (!visible || !business?.id || business.is_featured) return null;

  const handleDismiss = () => {
    dismissFeaturedCta(business.id, "analytics");
    setVisible(false);
    posthog?.capture("featured_cta_dismissed", {
      source: "dashboard_analytics",
      cta: "get_featured",
      snooze_days: 7,
      business_id: business.id,
      business_slug: business.slug || undefined,
      business_name: business.title || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-amber-400/50 bg-amber-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/25 dark:bg-amber-500/10">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <Star className="size-5 fill-current" aria-hidden="true" />
        </span>
        <div>
          <p className="font-heading font-semibold text-foreground">
            Get more visibility with Featured
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Priority in search, a Featured badge, extra shop photos, and a card
            on the Featured page. $49/month, cancel anytime.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Link
          href={`/pricing?business=${encodeURIComponent(business.id)}`}
          className={buttonVariants({
            className: "shrink-0",
          })}
          prefetch={false}
          onClick={() =>
            posthog?.capture("featured_cta_clicked", {
              source: "dashboard_analytics",
              cta: "get_featured",
              business_id: business.id,
              business_slug: business.slug || undefined,
              business_name: business.title || undefined,
            })
          }
        >
          View Featured pricing
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-amber-500/15 hover:text-foreground"
          aria-label="Hide Featured offer for one week"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
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

export default function BusinessAnalyticsPanel({
  businesses = [],
  initialBusinessId = "",
}) {
  const [selectedId, setSelectedId] = useState("");
  const [days, setDays] = useState(7);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshLocked, setRefreshLocked] = useState(false);
  const lastInitialIdRef = useRef("");
  const statsBusinessIdRef = useRef("");
  const refreshUnlockTimeoutRef = useRef(null);
  const refreshLockedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (refreshUnlockTimeoutRef.current) {
        clearTimeout(refreshUnlockTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    refreshLockedRef.current = false;
    setRefreshLocked(false);
    if (refreshUnlockTimeoutRef.current) {
      clearTimeout(refreshUnlockTimeoutRef.current);
      refreshUnlockTimeoutRef.current = null;
    }
  }, [selectedId]);

  useEffect(() => {
    if (!businesses.length) {
      setSelectedId("");
      lastInitialIdRef.current = "";
      return;
    }
    if (
      initialBusinessId &&
      initialBusinessId !== lastInitialIdRef.current &&
      businesses.some((business) => business.id === initialBusinessId)
    ) {
      lastInitialIdRef.current = initialBusinessId;
      setSelectedId(initialBusinessId);
      return;
    }
    if (!businesses.some((business) => business.id === selectedId)) {
      setSelectedId(businesses[0].id);
    }
  }, [businesses, selectedId, initialBusinessId]);

  useEffect(() => {
    if (!selectedId) {
      setStats(null);
      setError(null);
      setLoading(false);
      statsBusinessIdRef.current = "";
      return undefined;
    }

    const cacheKey = `${selectedId}:${days}`;
    const cached = getCachedStats(cacheKey);
    let mounted = true;

    if (cached) {
      setStats(cached);
      setError(null);
      setLoading(false);
      statsBusinessIdRef.current = selectedId;
      return undefined;
    }

    setError(null);
    setLoading(true);
    if (statsBusinessIdRef.current !== selectedId) {
      setStats(null);
    }

    async function load() {
      const { data, error: fetchError } = await fetchOwnedBusinessStats(
        selectedId,
        days
      );
      if (!mounted) return;
      if (fetchError) {
        setError(fetchError.message || "Failed to load listing stats.");
        setStats(null);
      } else {
        setCachedStats(cacheKey, data);
        setStats(data);
        statsBusinessIdRef.current = selectedId;
        setError(null);
      }
      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [selectedId, days, refreshKey]);

  const handleRefresh = () => {
    if (!selectedId || loading || refreshLockedRef.current) return;
    refreshLockedRef.current = true;
    setRefreshLocked(true);
    clearCachedStatsForBusiness(selectedId);
    setRefreshKey((key) => key + 1);
    refreshUnlockTimeoutRef.current = setTimeout(() => {
      refreshLockedRef.current = false;
      setRefreshLocked(false);
      refreshUnlockTimeoutRef.current = null;
    }, STATS_REFRESH_DEBOUNCE_MS);
  };

  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === selectedId) || null,
    [businesses, selectedId]
  );

  if (!businesses.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
        <p className="font-medium text-foreground">No businesses yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Claim a listing to start tracking how customers find your shop.
        </p>
      </div>
    );
  }

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
  const showSkeleton = loading && !stats;
  const refreshPending = loading || refreshLocked;

  return (
    <TooltipProvider delay={200}>
      <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <label
            htmlFor="analytics-business"
            className="text-sm font-medium text-foreground"
          >
            Business
          </label>
          <select
            id="analytics-business"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground sm:min-w-72"
          >
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex max-w-full flex-wrap rounded-full border border-border bg-muted p-1">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.days}
                type="button"
                onClick={() => setDays(option.days)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${days === option.days
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                  } hover:bg-white/50 cursor-pointer hover:scale-100! transition-all duration-300`}
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
            disabled={!selectedId || refreshPending}
            aria-label="Refresh listing stats"
            className="shrink-0"
          >
            <RefreshCw
              className={cn(loading && "animate-spin")}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <AnalyticsFeaturedCta business={selectedBusiness} />

      {showSkeleton && <AnalyticsSkeleton showChart={days !== 1} />}

      {error && !stats && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!showSkeleton && !error && stats && !hasAnyActivity && (
        <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
          <p className="font-medium text-foreground">No activity yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No stats {periodEmptyCopy(days)} for{" "}
            {selectedBusiness?.title || "this listing"}. Totals will appear
            here as customers see and visit it.
          </p>
        </div>
      )}

      {!showSkeleton && !error && hasAnyActivity && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <StatCard
              label="Page views"
              value={formatNumber(totals.page_views)}
              delta={deltaTotals.page_views}
              vsLabel={vsLabel}
              description="How many times customers opened your business page."
            />
            <StatCard
              label="Listing clicks"
              value={formatNumber(totals.listing_clicks)}
              delta={deltaTotals.listing_clicks}
              vsLabel={vsLabel}
              description="How many times customers clicked your listing card to open your page."
            />
            <StatCard
              label="Impressions"
              value={formatNumber(totals.impressions)}
              delta={deltaTotals.impressions}
              vsLabel={vsLabel}
              description="How many times your listing appeared on screen in search, Featured, Top Verified, or directory pages. An impression counts after the card stays at least half visible for about a second."
            />
            <StatCard
              label="CTR"
              value={formatCtr(stats?.ctr)}
              valueClassName={ctrColorClass(stats?.ctr)}
              delta={comparison?.ctr}
              vsLabel={vsLabel}
              deltaUnit="pts"
              description="The share of listing impressions that led to a click through to your page."
            />
            <StatCard
              label="Avg. position"
              value={formatPosition(stats?.avgPosition)}
              valueClassName={positionColorClass(stats?.avgPosition)}
              delta={comparison?.avgPosition}
              invertDelta
              vsLabel={vsLabel}
              description="How high your listing typically appears in those lists. Position 1 is first. A lower number means you showed up closer to the top."
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
              description="How many times customers tapped your phone number on your business page."
            />
            <StatCard
              label="Directions clicks"
              value={formatNumber(totals.directions_clicks)}
              delta={deltaTotals.directions_clicks}
              vsLabel={vsLabel}
              description="How many times customers tapped for directions to your shop."
            />
            <StatCard
              label="Website clicks"
              value={formatNumber(totals.website_clicks)}
              delta={deltaTotals.website_clicks}
              vsLabel={vsLabel}
              description="How many times customers tapped your website on your business page."
            />
            <StatCard
              label="Email clicks"
              value={formatNumber(totals.email_clicks)}
              delta={deltaTotals.email_clicks}
              vsLabel={vsLabel}
              description="How many times customers tapped your email on your business page."
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
        Listing stats are not live. New views and clicks can take a few minutes
        to appear.
      </p>
      </div>
    </TooltipProvider>
  );
}
