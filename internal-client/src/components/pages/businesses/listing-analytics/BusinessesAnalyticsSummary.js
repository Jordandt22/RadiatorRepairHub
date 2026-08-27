"use client";

import StatInfo from "@/components/pages/businesses/analytics/StatInfo";
import { Skeleton } from "@/components/ui/skeleton";

function formatNumber(value, { digits = 0 } = {}) {
  const number = Number(value || 0);
  return number.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatCtr(value) {
  if (value == null) return "—";
  return `${Number(value).toFixed(1)}%`;
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

function StatCard({ label, value, valueClassName = "text-foreground", description }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <StatInfo label={label} description={description} />
      </div>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

export function BusinessesAnalyticsSummarySkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-72 max-w-full rounded-md" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
    </div>
  );
}

export default function BusinessesAnalyticsSummary({ summary }) {
  const eligible = Number(summary?.eligibleCount || 0);
  const tracked = Number(summary?.trackedCount || 0);
  const totals = summary?.totals || {};
  const averages = summary?.averages || {};
  const coverage =
    eligible > 0 ? Math.round((tracked / eligible) * 1000) / 10 : 0;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {formatNumber(tracked)} of {formatNumber(eligible)} listings have stats
        this period
        {eligible > 0 ? ` (${formatNumber(coverage, { digits: 1 })}% coverage)` : ""}.
        Averages are per tracked listing. CTR is pooled.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tracked listings"
          value={formatNumber(tracked)}
          description="Non-test listings with at least one stats row in this period, after Claimed/Featured filters."
        />
        <StatCard
          label="Avg impressions"
          value={formatNumber(averages.impressions, { digits: 1 })}
          description="Mean impressions per tracked listing. Directory total is shown in the trend chart."
        />
        <StatCard
          label="Avg listing clicks"
          value={formatNumber(averages.listing_clicks, { digits: 1 })}
          description="Mean listing-card clicks per tracked listing."
        />
        <StatCard
          label="Pooled CTR"
          value={formatCtr(summary?.ctr)}
          valueClassName={ctrColorClass(summary?.ctr)}
          description="Total listing clicks divided by total impressions across tracked listings. Listings with no impressions are not averaged in."
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total impressions"
          value={formatNumber(totals.impressions)}
          description="Sum of impressions across tracked listings."
        />
        <StatCard
          label="Total listing clicks"
          value={formatNumber(totals.listing_clicks)}
          description="Sum of listing-card clicks across tracked listings."
        />
        <StatCard
          label="Total page views"
          value={formatNumber(totals.page_views)}
          description="Sum of business-page views across tracked listings."
        />
      </div>
    </div>
  );
}
