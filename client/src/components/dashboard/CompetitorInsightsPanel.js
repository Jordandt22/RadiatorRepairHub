"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Lock, Star, Store } from "lucide-react";
import { fetchOwnedCompetitorInsights } from "@/lib/api/businessStats";
import StatInfo from "@/components/dashboard/StatInfo";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ctrColorClass,
  formatCtr,
  formatNumber,
  formatPercent,
  formatPosition,
  formatRank,
  positionColorClass,
} from "@/lib/businessStats/formatStats";

const INSIGHTS_CACHE_TTL_MS = 5 * 60 * 1000;
const insightsCache = Object.create(null);

function getCachedInsights(key) {
  const entry = insightsCache[key];
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > INSIGHTS_CACHE_TTL_MS) {
    delete insightsCache[key];
    return null;
  }
  return entry.data;
}

function setCachedInsights(key, data) {
  insightsCache[key] = { data, cachedAt: Date.now() };
}

export function clearCachedInsightsForBusiness(businessId) {
  if (!businessId) return;
  const prefix = `${businessId}:`;
  for (const key of Object.keys(insightsCache)) {
    if (key.startsWith(prefix)) {
      delete insightsCache[key];
    }
  }
}

const GATED_PREVIEW_ROWS = [
  { title: "Northside Radiator Co.", impressions: "412", clicks: "31", ctr: "7.5%", position: "2.4" },
  { title: "Valley Cooling Systems", impressions: "358", clicks: "24", ctr: "6.7%", position: "3.1" },
  { title: "Precision Auto Radiator", impressions: "290", clicks: "17", ctr: "5.9%", position: "4.8" },
  { title: "Riverside Heat Exchange", impressions: "236", clicks: "12", ctr: "5.1%", position: "5.6" },
  { title: "Cross Town Radiator Shop", impressions: "184", clicks: "8", ctr: "4.3%", position: "7.2" },
];

function periodLabel(days) {
  if (days === 1) return "today";
  if (days === 30) return "in the last 30 days";
  if (days === "all") return "all time";
  return "in the last 7 days";
}

function marketName(city) {
  if (!city?.name) return "your area";
  return city.stateCode ? `${city.name}, ${city.stateCode}` : city.name;
}

function Blurred({ children, className = "" }) {
  return (
    <>
      <span
        className={cn(
          "inline-block select-none blur-[4px] text-muted-foreground/80",
          className
        )}
        aria-hidden="true"
      >
        {children}
      </span>
      <span className="sr-only">Featured Only</span>
    </>
  );
}

function UpgradeLink({ businessId, children = "Upgrade to unlock", className = "" }) {
  if (!businessId) return null;
  return (
    <Link
      href={`/pricing?business=${encodeURIComponent(businessId)}`}
      className={cn(
        "inline-flex items-center gap-1 font-medium text-interactive hover:text-primary",
        className
      )}
      prefetch={false}
    >
      {children}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}

function InsightCard({ label, value, valueClassName = "text-foreground", note = null, description = null }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <StatInfo label={label} description={description} />
      </div>
      <p className={`mt-1 font-heading text-2xl font-semibold ${valueClassName}`}>
        {value}
      </p>
      {note ? (
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      ) : null}
    </div>
  );
}

function GatedInsightCard({ label, description, businessId }) {
  return (
    <div className="rounded-lg border border-dashed border-amber-400/50 bg-amber-50/60 px-4 py-4 dark:border-amber-500/25 dark:bg-amber-500/10">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <StatInfo label={label} description={description} />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Lock
          className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
        <span className="font-heading text-lg font-semibold text-foreground">
          Featured Only
        </span>
      </div>
      <UpgradeLink businessId={businessId} className="mt-2 text-xs" />
    </div>
  );
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

function CompetitorRows({ rows }) {
  return (
    <div className="min-w-0 w-full space-y-3">
      <div className="space-y-3 sm:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className={cn(
              "rounded-lg border bg-card p-4",
              row.isSelf ? "border-primary/50 bg-tint" : "border-border"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {row.title}
                  {row.isSelf ? (
                    <span className="ml-2 text-xs font-semibold text-primary">
                      You
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatRank(row.impressionsRank)} by impressions
                </p>
              </div>
              <ListingBadges
                isFeatured={row.isFeatured}
                isClaimed={row.isClaimed}
              />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Impressions</dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {formatNumber(row.impressions)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Clicks</dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {formatNumber(row.listingClicks)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">CTR</dt>
                <dd className={`mt-0.5 font-medium ${ctrColorClass(row.ctr)}`}>
                  {formatCtr(row.ctr)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Avg. position</dt>
                <dd
                  className={`mt-0.5 font-medium ${positionColorClass(row.avgPosition)}`}
                >
                  {formatPosition(row.avgPosition)}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <div className="hidden max-w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-lg border border-border bg-card sm:block [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[42rem] text-left text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Listing</th>
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
                  row.isSelf ? "bg-tint" : "bg-card"
                )}
              >
                <td className="px-4 py-3 text-muted-foreground tabular-nums">
                  {row.impressionsRank ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "truncate",
                        row.isSelf
                          ? "font-semibold text-primary"
                          : "text-foreground"
                      )}
                    >
                      {row.title}
                    </span>
                    <ListingBadges
                      isFeatured={row.isFeatured}
                      isClaimed={row.isClaimed}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground">
                  {formatNumber(row.impressions)}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {formatNumber(row.listingClicks)}
                </td>
                <td className={`px-4 py-3 font-medium ${ctrColorClass(row.ctr)}`}>
                  {formatCtr(row.ctr)}
                </td>
                <td
                  className={`px-4 py-3 font-medium ${positionColorClass(row.avgPosition)}`}
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

function GatedCompetitorRows({ businessId, competitorCount }) {
  const previewCount = Math.max(
    3,
    Math.min(GATED_PREVIEW_ROWS.length, competitorCount || GATED_PREVIEW_ROWS.length)
  );
  const previews = GATED_PREVIEW_ROWS.slice(0, previewCount);

  return (
    <div className="min-w-0 w-full space-y-3">
      <div className="relative">
        <div className="space-y-3 sm:hidden">
          {previews.map((row, index) => (
            <div
              key={row.title}
              className="rounded-lg border border-dashed border-amber-400/40 bg-amber-50/40 p-4 dark:border-amber-500/25 dark:bg-amber-500/5"
            >
              <div className="flex items-start justify-between gap-3">
                <Blurred className="font-medium">{row.title}</Blurred>
                <Lock
                  className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400"
                  aria-hidden="true"
                />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Impressions</dt>
                  <dd className="mt-0.5">
                    <Blurred className="font-medium">{row.impressions}</Blurred>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Clicks</dt>
                  <dd className="mt-0.5">
                    <Blurred className="font-medium">{row.clicks}</Blurred>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">CTR</dt>
                  <dd className="mt-0.5">
                    <Blurred className="font-medium">{row.ctr}</Blurred>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Avg. position</dt>
                  <dd className="mt-0.5">
                    <Blurred className="font-medium">{row.position}</Blurred>
                  </dd>
                </div>
              </dl>
              <span className="sr-only">Row {index + 1} hidden</span>
            </div>
          ))}
        </div>

        <div className="hidden max-w-full min-w-0 overflow-hidden rounded-lg border border-dashed border-amber-400/40 bg-card sm:block dark:border-amber-500/25">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    Listing
                    <Lock className="size-3 shrink-0" aria-hidden="true" />
                  </span>
                </th>
                <th className="px-4 py-3 font-medium">Impressions</th>
                <th className="px-4 py-3 font-medium">Clicks</th>
                <th className="px-4 py-3 font-medium">CTR</th>
                <th className="px-4 py-3 font-medium">Avg. position</th>
              </tr>
            </thead>
            <tbody>
              {previews.map((row, index) => (
                <tr key={row.title} className="border-t border-border bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <Blurred>{row.title}</Blurred>
                  </td>
                  <td className="px-4 py-3">
                    <Blurred>{row.impressions}</Blurred>
                  </td>
                  <td className="px-4 py-3">
                    <Blurred>{row.clicks}</Blurred>
                  </td>
                  <td className="px-4 py-3">
                    <Blurred>{row.ctr}</Blurred>
                  </td>
                  <td className="px-4 py-3">
                    <Blurred>{row.position}</Blurred>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Competitor performance is{" "}
        <span className="font-medium text-foreground">Featured Only</span>.{" "}
        <UpgradeLink businessId={businessId} className="text-sm" />
      </p>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div
      className="min-w-0 w-full space-y-4"
      aria-busy="true"
      aria-label="Loading competitor insights"
    >
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
      <div className="min-w-0 w-full overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border bg-muted/60 px-4 py-3">
          <Skeleton className="h-4 w-40 rounded-md" />
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex min-w-0 items-center gap-4 border-t border-border px-4 py-3"
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

export default function CompetitorInsightsPanel({
  business,
  days = 7,
  refreshKey = 0,
}) {
  const businessId = business?.id || "";
  const isFeatured = Boolean(business?.is_featured);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!businessId) {
      setInsights(null);
      setError(null);
      setLoading(false);
      return undefined;
    }

    const cacheKey = `${businessId}:${days}:${isFeatured}`;
    const cached = getCachedInsights(cacheKey);
    let mounted = true;

    if (cached) {
      setInsights(cached);
      setError(null);
      setLoading(false);
      return undefined;
    }

    setError(null);
    setLoading(true);

    async function load() {
      const { data, error: fetchError } =
        await fetchOwnedCompetitorInsights(businessId, days);
      if (!mounted) return;
      if (fetchError) {
        setError(fetchError.message || "Failed to load competitor insights.");
        setInsights(null);
      } else {
        setCachedInsights(cacheKey, data);
        setInsights(data);
        setError(null);
      }
      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [businessId, days, isFeatured, refreshKey]);

  const rows = useMemo(() => {
    if (!insights?.available || !isFeatured) return [];
    const competitors = Array.isArray(insights.competitors)
      ? insights.competitors
      : [];
    const self = insights.self;
    const merged = self
      ? [...competitors, { ...self, isSelf: true }]
      : competitors;
    return [...merged].sort((a, b) => {
      const diff = Number(b.impressions || 0) - Number(a.impressions || 0);
      if (diff !== 0) return diff;
      return Number(b.listingClicks || 0) - Number(a.listingClicks || 0);
    });
  }, [insights, isFeatured]);

  if (!businessId) return null;

  const header = (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Store className="size-5" aria-hidden="true" />
      </span>
      <div>
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Competitor insights
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {insights?.city?.name
            ? `How your listing compares to other radiator shops in ${marketName(insights.city)} ${periodLabel(days)}.`
            : `How your listing compares to other radiator shops in your area ${periodLabel(days)}.`}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="min-w-0 w-full space-y-4">
        {header}
        <InsightsSkeleton />
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-w-0 w-full space-y-4">
        {header}
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      </section>
    );
  }

  if (!insights) return null;

  if (!insights.available) {
    if (insights.reason === "no_city") return null;
    return (
      <section className="min-w-0 w-full space-y-4">
        {header}
        <div className="rounded-lg border border-dashed border-border bg-card px-6 py-8 text-center">
          <p className="font-medium text-foreground">Not enough listings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Competitor insights need at least {insights.minMarketSize || 3}{" "}
            listings in {marketName(insights.city)}. We&apos;ll turn this on as
            the area fills out.
          </p>
        </div>
      </section>
    );
  }

  const market = insights.market || {};
  const self = insights.self || null;
  const totalListings = Number(market.totalListings || 0);

  const ctrGap =
    self?.ctr != null && market.medianCtr != null
      ? Math.round((Number(self.ctr) - Number(market.medianCtr)) * 10) / 10
      : null;

  return (
    <section className="min-w-0 w-full space-y-4">
      {header}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InsightCard
          label="Listings in your city"
          value={formatNumber(totalListings)}
          note={
            market.featuredListings != null
              ? `${formatNumber(market.claimedListings)} claimed · ${formatNumber(market.featuredListings)} Featured`
              : null
          }
          description={`Every radiator shop we list in ${marketName(insights.city)}, including unclaimed listings.`}
        />

        <InsightCard
          label="Your impressions rank"
          value={formatRank(self?.impressionsRank, totalListings)}
          valueClassName={
            self?.impressionsRank && self.impressionsRank <= 3
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-foreground"
          }
          description="Where your listing sits when every listing in your city is ordered by impressions for this period."
        />

        {isFeatured ? (
          <InsightCard
            label="Your impression share"
            value={formatPercent(self?.impressionShare)}
            description={`Your share of all listing impressions in ${marketName(insights.city)} for this period.`}
          />
        ) : (
          <GatedInsightCard
            label="Your impression share"
            description="Your share of all listing impressions in your city. Available with a Featured listing."
            businessId={businessId}
          />
        )}

        {isFeatured ? (
          <InsightCard
            label="CTR vs city median"
            value={formatCtr(self?.ctr)}
            valueClassName={ctrColorClass(self?.ctr)}
            note={
              market.medianCtr != null
                ? `City median ${formatCtr(market.medianCtr)}${
                    ctrGap == null
                      ? ""
                      : ` · you're ${ctrGap >= 0 ? "+" : "−"}${Math.abs(ctrGap).toFixed(1)} pts`
                  }`
                : "Not enough city activity yet"
            }
            description="Your click-through rate next to the median click-through rate of every listing in your city."
          />
        ) : (
          <GatedInsightCard
            label="CTR vs city median"
            description="Your click-through rate compared to the median for your city. Available with a Featured listing."
            businessId={businessId}
          />
        )}
      </div>

      {isFeatured ? (
        rows.length ? (
          <CompetitorRows rows={rows} />
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-card px-6 py-8 text-center">
            <p className="font-medium text-foreground">No competitor activity</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No listings in {marketName(insights.city)} recorded activity{" "}
              {periodLabel(days)}.
            </p>
          </div>
        )
      ) : (
        <GatedCompetitorRows
          businessId={businessId}
          competitorCount={insights.competitorCount}
        />
      )}
    </section>
  );
}
