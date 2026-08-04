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
  const chartData = slices.map((slice, index) => ({
    key: slice.key,
    label: slice.label,
    value: slice.count,
    fill: `var(--color-${slice.key})`,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        title="Emails sent"
        description="Outreach emails by type"
        centerLabel="Emails"
        valueLabel="Emails"
        chart={stats?.emails_sent}
      />
      <OverviewStatPieCard
        title="Claim eligibility"
        description="Able, no email, duplicate email, and claimed"
        centerLabel="Businesses"
        valueLabel="Businesses"
        chart={stats?.claim_eligibility}
      />
    </div>
  );
}

export function OverviewDashboardChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card className="h-80 animate-pulse bg-muted/40" />
      <Card className="h-80 animate-pulse bg-muted/40" />
      <Card className="h-80 animate-pulse bg-muted/40" />
      <Card className="h-80 animate-pulse bg-muted/40" />
    </div>
  );
}
