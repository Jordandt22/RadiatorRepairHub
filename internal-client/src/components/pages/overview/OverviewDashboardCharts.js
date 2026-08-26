"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
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

function buildChartModel(chart, valueLabel = "Count") {
  const slices = chart?.slices ?? [];
  const chartData = slices.map((slice, index) => {
    const color = CHART_COLORS[index % CHART_COLORS.length];
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

export default function OverviewDashboardCharts({ stats = null }) {
  return (
    <div className="flex flex-col gap-8">
      <ChartSection
        title="Outreach"
        description="Email review status, claim eligibility, and sent outreach emails"
      >
        <OverviewStatPieCard
          title="Email statuses"
          description="Checked and not checked require an email; unable to find includes listings without one"
          centerLabel="Businesses"
          valueLabel="Businesses"
          chart={stats?.email_status}
        />
        <OverviewStatPieCard
          title="Claim eligibility"
          description="Able, no email, email review, duplicate email, and claimed"
          centerLabel="Businesses"
          valueLabel="Businesses"
          chart={stats?.claim_eligibility}
        />
        <OverviewStatPieCard
          title="Emails sent"
          description="Outreach emails by type"
          centerLabel="Emails"
          valueLabel="Emails"
          chart={stats?.emails_sent}
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
        <OverviewStatPieCard
          title="Rating tiers"
          description="Listings grouped by Google rating (total score)"
          centerLabel="Businesses"
          valueLabel="Businesses"
          chart={stats?.score_tier}
        />
        <OverviewStatPieCard
          title="Review count tiers"
          description="Listings grouped by number of Google reviews"
          centerLabel="Businesses"
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
      {[3, 3, 2].map((count, sectionIndex) => (
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
