"use client";

import StatInfo from "@/components/pages/businesses/analytics/StatInfo";
import { Skeleton } from "@/components/ui/skeleton";

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function StatCard({ label, value, description }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <StatInfo label={label} description={description} />
      </div>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

export function SearchStatsSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-border bg-card px-4 py-4"
        >
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="mt-2 h-8 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default function SearchStatsSummary({
  summary,
  dimensionLabel,
  showTracked = true,
}) {
  const tracked = Number(summary?.trackedCount || 0);
  const totals = summary?.totals || {};

  return (
    <div
      className={
        showTracked
          ? "grid grid-cols-1 gap-3 sm:grid-cols-3"
          : "grid grid-cols-1 gap-3 sm:grid-cols-2"
      }
    >
      {showTracked ? (
        <StatCard
          label={`Tracked ${dimensionLabel.toLowerCase()}`}
          value={formatNumber(tracked)}
          description={`${dimensionLabel} with at least one search in this period.`}
        />
      ) : null}
      <StatCard
        label="Searches"
        value={formatNumber(totals.searches)}
        description="Page-1 directory searches and landing views for this dimension."
      />
      <StatCard
        label="Zero-result searches"
        value={formatNumber(totals.zero_result_searches)}
        description="Searches that returned no businesses. High counts are outreach opportunities."
      />
    </div>
  );
}
