"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/** Stable fills for outreach campaign types (aligned with History badges). */
const OUTREACH_TYPE_COLORS = {
  claim_invite: "#0ea5e9",
  ownership_claim_invite: "#8b5cf6",
  lead_claim_invite: "#10b981",
  custom_claim_invite: "#d97706",
  claim_followup: "#6366f1",
  website_offer: "#e11d48",
  sms_claim_invite: "#06b6d4",
  sms_claim_followup: "#2563eb",
  sms_custom_claim_invite: "#ea580c",
  sms_declined: "#dc2626",
};

function colorForSlice(key, index) {
  return OUTREACH_TYPE_COLORS[key] ?? CHART_COLORS[index % CHART_COLORS.length];
}

function buildChartModel(chart, valueLabel = "Count", { sortByValue = false } = {}) {
  let slices = chart?.slices ?? [];
  if (sortByValue) {
    slices = [...slices].sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  }

  const chartData = slices.map((slice, index) => {
    const color = colorForSlice(slice.key, index);
    return {
      key: slice.key,
      label: slice.label,
      value: slice.count,
      fill: color,
      color,
    };
  });

  const chartConfig = {
    value: { label: valueLabel },
  };

  for (const slice of chartData) {
    chartConfig[slice.key] = {
      label: slice.label,
      color: slice.color,
    };
  }

  return { chartData, chartConfig };
}

function OverviewStatPieCard({
  title,
  description,
  footer,
  chart,
  centerLabel,
  valueLabel = "Count",
  className,
}) {
  const total = chart?.total ?? 0;
  const { chartData, chartConfig } = React.useMemo(
    () => buildChartModel(chart, valueLabel),
    [chart, valueLabel],
  );

  if (!chartData.length || total <= 0) {
    return (
      <Card className={className}>
        <CardHeader className="items-center pb-0">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center py-10">
          <p className="text-sm text-muted-foreground">No data yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-62.5"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="key" />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="key"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {centerLabel}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {chartData.map((slice) => (
            <div
              key={slice.key}
              className="flex items-center gap-1.5 text-muted-foreground"
            >
              <span
                className="size-2.5 shrink-0 rounded-xs"
                style={{ backgroundColor: slice.color }}
              />
              <span>
                {slice.label}: {Number(slice.value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        {footer ? (
          <div className="text-center leading-none text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </CardFooter>
    </Card>
  );
}

function OverviewStatBarCard({
  title,
  description,
  footer,
  chart,
  totalLabel,
  valueLabel = "Count",
  sortByValue = false,
  className,
}) {
  const total = chart?.total ?? 0;
  const { chartData, chartConfig } = React.useMemo(
    () => buildChartModel(chart, valueLabel, { sortByValue }),
    [chart, valueLabel, sortByValue],
  );

  const chartHeight = Math.max(200, chartData.length * 48 + 24);
  const valueByLabel = React.useMemo(() => {
    const map = new Map();
    for (const slice of chartData) {
      map.set(slice.label, slice.value);
    }
    return map;
  }, [chartData]);

  if (!chartData.length || total <= 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-0">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center py-10">
          <p className="text-sm text-muted-foreground">No data yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {total.toLocaleString()}
            </p>
            {totalLabel ? (
              <p className="text-xs text-muted-foreground">{totalLabel}</p>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto w-full justify-start [&_.recharts-responsive-container]:!w-full"
          style={{ height: chartHeight }}
          initialDimension={{ width: 480, height: chartHeight }}
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 4, right: 12, top: 4, bottom: 4 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              width={148}
              tick={(props) => (
                <BarAxisTick {...props} valueByLabel={valueByLabel} />
              )}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="key" />}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {chartData.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      {footer ? (
        <CardFooter className="pt-0 text-sm text-muted-foreground">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}

function BarAxisTick({ x, y, payload, valueByLabel }) {
  const label = payload?.value ?? "";
  const count = valueByLabel.get(label);
  const countText =
    count == null ? "" : Number(count).toLocaleString();

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-6}
        y={-4}
        textAnchor="end"
        className="fill-muted-foreground text-[11px]"
      >
        {label}
      </text>
      <text
        x={-6}
        y={10}
        textAnchor="end"
        className="fill-foreground text-[11px] font-medium tabular-nums"
      >
        {countText}
      </text>
    </g>
  );
}

export default function OverviewDashboardCharts({ stats = null }) {
  return (
    <div className="flex flex-col gap-8">
      <ChartSection
        title="Outreach"
        description="Email review, claim eligibility, and outreach volume by channel"
      >
        <OverviewStatBarCard
          title="Email statuses"
          description="Checked and not checked require an email; unable to find includes listings without one"
          totalLabel="Businesses"
          valueLabel="Businesses"
          sortByValue
          chart={stats?.email_status}
        />
        <OverviewStatBarCard
          title="Claim eligibility"
          description="Both able, email-only, phone-only, review/blocked, and claimed"
          totalLabel="Businesses"
          valueLabel="Businesses"
          sortByValue
          className="md:col-span-2"
          chart={stats?.claim_eligibility}
        />
        <OverviewStatBarCard
          title="Emails sent"
          description="Outreach emails by campaign type"
          totalLabel="Emails"
          valueLabel="Emails"
          sortByValue
          chart={stats?.emails_sent}
        />
        <OverviewStatBarCard
          title="SMS outreach"
          description="SMS invites, follow-ups, and declines"
          totalLabel="Messages"
          valueLabel="Messages"
          sortByValue
          chart={stats?.sms_sent}
        />
      </ChartSection>

      <ChartSection
        title="Featured listings"
        description="Paid Featured coverage across the directory and among claimed listings"
      >
        <OverviewStatPieCard
          title="Featured coverage"
          description="Share of all listings that are Featured"
          centerLabel="Businesses"
          valueLabel="Businesses"
          chart={stats?.featured}
        />
        <OverviewStatPieCard
          title="Featured among claimed"
          description="Claimed listings with vs without a Featured plan"
          centerLabel="Claimed"
          valueLabel="Businesses"
          chart={stats?.featured_among_claimed}
        />
      </ChartSection>

      <ChartSection
        title="Business coverage"
        description="Contact info and image storage across all listings"
      >
        <OverviewStatPieCard
          title="Businesses with email"
          description="Share of listings that have an email on file"
          centerLabel="Businesses"
          valueLabel="Businesses"
          chart={stats?.email}
        />
        <OverviewStatPieCard
          title="Businesses with website"
          description="Share of listings that have a website on file"
          centerLabel="Businesses"
          valueLabel="Businesses"
          chart={stats?.website}
        />
        <OverviewStatPieCard
          title="CDN image storage"
          description="Listings with primary images stored on CDN"
          centerLabel="Businesses"
          valueLabel="Businesses"
          chart={stats?.cdn}
        />
      </ChartSection>

      <ChartSection
        title="Listing quality"
        description="Google rating and review count distribution"
      >
        <OverviewStatBarCard
          title="Rating tiers"
          description="Listings grouped by Google rating (total score)"
          totalLabel="Businesses"
          valueLabel="Businesses"
          chart={stats?.score_tier}
        />
        <OverviewStatBarCard
          title="Review count tiers"
          description="Listings grouped by number of Google reviews"
          totalLabel="Businesses"
          valueLabel="Businesses"
          chart={stats?.reviews_tier}
        />
      </ChartSection>
    </div>
  );
}

function ChartSection({ title, description, children }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

export function OverviewDashboardChartsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {[4, 2, 3, 2].map((count, sectionIndex) => (
        <div key={sectionIndex} className="flex flex-col gap-3">
          <div className="space-y-2">
            <div className="h-5 w-40 animate-pulse rounded bg-muted/60" />
            <div className="h-4 w-72 animate-pulse rounded bg-muted/40" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: count }).map((_, cardIndex) => (
              <Card
                key={cardIndex}
                className="h-80 animate-pulse bg-muted/40"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
