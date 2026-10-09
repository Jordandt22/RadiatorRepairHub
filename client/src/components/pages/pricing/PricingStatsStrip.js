"use client";

import { Eye, Search, Store } from "lucide-react";
import CountUp from "@/components/ui/CountUp";
import { formatNumber } from "@/lib/businessStats/formatStats";
import { useHomeSectionInView } from "@/components/ui/homeSectionMotion";

function StatBox({
  label,
  value,
  sublabel,
  live = false,
  icon: Icon = null,
  delay = 0,
  inView,
}) {
  const count = Number(value) || 0;

  return (
    <div className="rounded-lg border border-primary/75 bg-tint/50 px-4 py-4 text-center">
      <p className="inline-flex items-center justify-center gap-2 font-heading text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-3xl">
        {live ? (
          <span
            className="relative flex size-2.5 shrink-0"
            title="Updated hourly"
            aria-hidden="true"
          >
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
          </span>
        ) : null}
        {Icon && !live ? (
          <Icon className="size-5 shrink-0 text-primary sm:size-6" aria-hidden="true" />
        ) : null}
        <CountUp
          to={count}
          from={0}
          duration={1.6}
          delay={delay}
          separator=","
          startWhen={inView}
          className="font-heading font-bold text-foreground"
        />
        {live ? <span className="sr-only">Live, updated hourly</span> : null}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
      {sublabel ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>
      ) : null}
    </div>
  );
}

function finiteCount(value) {
  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? count : null;
}

function LeadActionsChart({ phone, directions, website, email }) {
  const rows = [
    { key: "phone", label: "Phone", value: phone, color: "var(--lead-phone)" },
    { key: "directions", label: "Directions", value: directions, color: "var(--lead-directions)" },
    { key: "website", label: "Website", value: website, color: "var(--lead-website)" },
    { key: "email", label: "Email", value: email, color: "var(--lead-email)" },
  ];
  if (rows.some((row) => row.value == null)) return null;

  const total = rows.reduce((sum, row) => sum + row.value, 0);
  if (total <= 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4 sm:px-5">
      <p className="text-sm font-medium text-foreground">
        Lead Action Categories
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">Last 30 days</p>
      <ul className="mt-4 space-y-3" aria-label="Lead action categories in the last 30 days">
        {rows.map((row) => {
          const share = (row.value / total) * 100;
          const width = row.value > 0 ? Math.max(share, 1.5) : 0;
          return (
            <li key={row.key}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="inline-flex items-center gap-2 text-foreground">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: row.color }}
                    aria-hidden="true"
                  />
                  {row.label}
                </span>
                <span className="font-medium tabular-nums text-foreground">
                  {formatNumber(row.value)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${width}%`, backgroundColor: row.color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Demand strip for pricing and Get Listed. Hides null metrics (failed sources).
 */
export default function PricingStatsStrip({
  visitorsLast30Days = null,
  searchesLast30Days = null,
  leadActionsLast30Days = null,
  phoneClicksLast30Days = null,
  directionsClicksLast30Days = null,
  websiteClicksLast30Days = null,
  emailClicksLast30Days = null,
  pageViewsLast30Days = null,
  listedBusinesses = null,
}) {
  const { ref, inView } = useHomeSectionInView();

  const items = [
    searchesLast30Days != null && Number.isFinite(Number(searchesLast30Days))
      ? {
        key: "searches",
        label: "Searches",
        value: searchesLast30Days,
        sublabel: "Last 30 days",
        icon: Search,
      }
      : null,
    visitorsLast30Days != null && Number.isFinite(Number(visitorsLast30Days))
      ? {
        key: "visitors",
        label: "Visitors",
        value: visitorsLast30Days,
        sublabel: "Last 30 days",
        live: true,
      }
      : null,
    leadActionsLast30Days != null &&
      Number.isFinite(Number(leadActionsLast30Days))
      ? {
        key: "leads",
        label: "Lead actions",
        value: leadActionsLast30Days,
        sublabel: "Last 30 days",
      }
      : null,
    pageViewsLast30Days != null && Number.isFinite(Number(pageViewsLast30Days))
      ? {
        key: "views",
        label: "Listing Views",
        value: pageViewsLast30Days,
        sublabel: "Last 30 days",
        icon: Eye,
      }
      : null,
    listedBusinesses != null && Number.isFinite(Number(listedBusinesses))
      ? {
        key: "listed",
        label: "Listed Businesses",
        value: listedBusinesses,
        sublabel: "In the directory",
        icon: Store,
      }
      : null,
  ].filter(Boolean);

  const showChart = [phoneClicksLast30Days, directionsClicksLast30Days, websiteClicksLast30Days, emailClicksLast30Days]
    .every((value) => finiteCount(value) != null);

  if (items.length === 0 && !showChart) return null;

  return (
    <div ref={ref} className="space-y-3 sm:space-y-4">
      {items.length > 0 ? (
        <section
          aria-label="Directory demand"
          className={`grid gap-3 sm:gap-4 ${items.length >= 4
            ? "grid-cols-2 lg:grid-cols-4"
            : items.length === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : items.length === 2
                ? "grid-cols-2"
                : "grid-cols-1"
            }`}
        >
          {items.map((item, index) => (
            <StatBox
              key={item.key}
              label={item.label}
              value={item.value}
              sublabel={item.sublabel}
              live={Boolean(item.live)}
              icon={item.icon ?? null}
              delay={index * 0.12}
              inView={inView}
            />
          ))}
        </section>
      ) : null}
      {showChart ? (
        <LeadActionsChart
          phone={finiteCount(phoneClicksLast30Days)}
          directions={finiteCount(directionsClicksLast30Days)}
          website={finiteCount(websiteClicksLast30Days)}
          email={finiteCount(emailClicksLast30Days)}
        />
      ) : null}
    </div>
  );
}
