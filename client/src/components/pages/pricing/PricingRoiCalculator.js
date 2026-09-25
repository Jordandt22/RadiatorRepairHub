"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui/button";
import FeaturedUpgradeCtaLabel from "@/components/pages/pricing/FeaturedUpgradeCtaLabel";
import { featuredUpgradeButtonClass } from "@/components/pages/pricing/featuredUpgradeStyles";
import { FEATURED_YEARLY_PRICE } from "@/lib/featuredPricing";
import { cn } from "@/lib/utils";

export const DEFAULT_JOB_VALUE = 650;
export const MIN_EXTRA_JOBS = 1;
export const MAX_EXTRA_JOBS = 24;

const AUTOZONE_COST_URL =
  "https://www.autozone.com/diy/radiator/what-does-it-cost-to-replace-a-radiator";

function formatUsd(value, { cents = false } = {}) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  if (cents) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function clampJobs(value) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return MIN_EXTRA_JOBS;
  return Math.min(MAX_EXTRA_JOBS, Math.max(MIN_EXTRA_JOBS, n));
}

function parseJobValue(raw) {
  const cleaned = String(raw).replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_JOB_VALUE;
  return Math.min(50000, Math.round(n));
}

export default function PricingRoiCalculator({
  onUpgradeClick,
  upgradeBusy = false,
  upgradeLoading = false,
  isSubmitting = false,
}) {
  const jobsId = useId();
  const jobValueId = useId();
  const posthog = usePostHog();
  const skipRoiTrack = useRef(true);
  const [extraJobs, setExtraJobs] = useState(MIN_EXTRA_JOBS);
  const [jobValueInput, setJobValueInput] = useState(String(DEFAULT_JOB_VALUE));
  const jobValue = parseJobValue(jobValueInput);

  const revenue = extraJobs * jobValue;
  const roiMultiple =
    jobValue > 0 ? revenue / FEATURED_YEARLY_PRICE : Number.NaN;
  const costPerMonth = FEATURED_YEARLY_PRICE / 12;
  const salesToBreakEven =
    jobValue > 0 ? Math.ceil(FEATURED_YEARLY_PRICE / jobValue) : null;

  useEffect(() => {
    if (skipRoiTrack.current) {
      skipRoiTrack.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      posthog?.capture("pricing_roi_adjusted", {
        source: "pricing",
        extra_sales: extraJobs,
        sale_value: jobValue,
        projected_revenue: revenue,
        roi_multiple: Number.isFinite(roiMultiple)
          ? Number(roiMultiple.toFixed(2))
          : undefined,
        featured_yearly_price: FEATURED_YEARLY_PRICE,
      });
    }, 600);

    return () => window.clearTimeout(timer);
  }, [extraJobs, jobValue, posthog, revenue, roiMultiple]);

  return (
    <section
      className="bg-primary py-16"
      aria-labelledby="pricing-roi-heading"
    >
      <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="pricing-roi-heading"
            className="font-heading text-3xl font-semibold tracking-tight text-white"
          >
            One Sale Can Pay for the Entire Year
          </h2>
          <p className="mt-3 text-base text-white/80 md:text-lg">
            Use the slider to see how many extra sales Featured might bring.
            Even two extra sales a year can make Featured pay for itself.
          </p>
        </div>

        <div className="mx-auto max-w-2xl space-y-8 rounded-lg border border-border bg-card p-6 md:p-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <label
                htmlFor={jobsId}
                className="text-sm font-medium text-foreground"
              >
                If Featured brought you just…
              </label>
              <p className="font-heading text-2xl font-bold tabular-nums text-foreground">
                {extraJobs}{" "}
                <span className="text-base font-medium text-muted-foreground">
                  {extraJobs === 1 ? "Extra Sale a Year" : "Extra Sales a Year"}
                </span>
              </p>
            </div>
            <input
              id={jobsId}
              type="range"
              min={MIN_EXTRA_JOBS}
              max={MAX_EXTRA_JOBS}
              step={1}
              value={extraJobs}
              onChange={(e) => setExtraJobs(clampJobs(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
              aria-valuemin={MIN_EXTRA_JOBS}
              aria-valuemax={MAX_EXTRA_JOBS}
              aria-valuenow={extraJobs}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 - One sale, all year</span>
              <span>24 - Two sales per month</span>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={jobValueId}
              className="text-sm font-medium text-foreground"
            >
              Average sale value
            </label>
            <div className="relative max-w-xs">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                aria-hidden="true"
              >
                $
              </span>
              <input
                id={jobValueId}
                type="text"
                inputMode="numeric"
                value={jobValueInput}
                onChange={(e) => setJobValueInput(e.target.value)}
                onBlur={() => setJobValueInput(String(jobValue))}
                className="w-full rounded-lg border border-border bg-background py-2 pl-7 pr-3 text-sm text-foreground"
              />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Default ${DEFAULT_JOB_VALUE} is the midpoint of AutoZone&apos;s{" "}
              <a
                href={AUTOZONE_COST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-interactive underline hover:text-primary"
              >
                $400–$900 radiator replacement range
              </a>
              . Edit to match your shop.
            </p>
          </div>

          <div className="grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Featured for a year
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-foreground">
                {formatUsd(FEATURED_YEARLY_PRICE)}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatUsd(costPerMonth, { cents: true })}/month
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {extraJobs === 1
                  ? "1 extra sale brings in"
                  : `${extraJobs} extra sales bring in`}
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-foreground">
                {formatUsd(revenue)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Return on the year
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-primary">
                {Number.isFinite(roiMultiple)
                  ? `${roiMultiple.toFixed(roiMultiple >= 10 ? 0 : 1)}×`
                  : "—"}
              </p>
            </div>
          </div>

          <p className="text-sm font-medium leading-relaxed text-primary">
            {jobValue >= FEATURED_YEARLY_PRICE
              ? "Paid back by the first sale. Everything after that is profit."
              : salesToBreakEven != null
                ? `At ${formatUsd(jobValue)} per sale, about ${salesToBreakEven} ${salesToBreakEven === 1 ? "sale" : "sales"
                } would cover Featured for the year.`
                : "Enter an average sale value to estimate your return."}
          </p>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Estimates only. Demand stats and this calculator are illustrative.
            Featured improves placement and listing tools, it does not guarantee
            calls or sales.
          </p>

          <div className="pt-2">
            <Button
              type="button"
              className={cn(featuredUpgradeButtonClass)}
              disabled={upgradeBusy}
              aria-busy={upgradeBusy}
              onClick={onUpgradeClick}
            >
              <FeaturedUpgradeCtaLabel
                isSubmitting={isSubmitting}
                isLoading={upgradeLoading}
              />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
