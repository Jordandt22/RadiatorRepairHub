"use client";

import { Eye, Phone, Store } from "lucide-react";
import CountUp from "@/components/ui/CountUp";
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

/**
 * Demand strip for the pricing page. Hides null metrics (failed sources).
 */
export default function PricingStatsStrip({
  visitorsLast30Days = null,
  phoneClicksLast30Days = null,
  pageViewsLast30Days = null,
  listedBusinesses = null,
}) {
  const { ref, inView } = useHomeSectionInView();

  const items = [
    visitorsLast30Days != null && Number.isFinite(Number(visitorsLast30Days))
      ? {
        key: "visitors",
        label: "Visitors",
        value: visitorsLast30Days,
        sublabel: "Last 30 days",
        live: true,
      }
      : null,
    phoneClicksLast30Days != null &&
      Number.isFinite(Number(phoneClicksLast30Days))
      ? {
        key: "phone",
        label: "Phone Clicks",
        value: phoneClicksLast30Days,
        sublabel: "Last 30 days",
        icon: Phone,
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

  if (items.length === 0) return null;

  return (
    <section
      ref={ref}
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
  );
}
