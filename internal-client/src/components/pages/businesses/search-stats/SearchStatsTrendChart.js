"use client";

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  buildSearchTrendSeries,
  formatTrendLabel,
  formatTrendTick,
} from "@/lib/businessStats/buildTrendSeries";

const chartConfig = {
  searches: {
    label: "Searches",
    theme: {
      light: "#2563eb",
      dark: "#60a5fa",
    },
  },
  zero_result_searches: {
    label: "Zero results",
    theme: {
      light: "#dc2626",
      dark: "#f87171",
    },
  },
};

function periodCaption(days) {
  if (days === 1) return "Today";
  if (days === 30) return "Each day for the last 30 days";
  if (days === "all") return "Every recorded day";
  return "Each day for the last 7 days";
}

export default function SearchStatsTrendChart({
  stats,
  days,
  title = "Search demand",
  description,
}) {
  const rawId = useId().replace(/:/g, "");
  const fillSearches = `fill-searches-${rawId}`;
  const fillZeroResults = `fill-zero-results-${rawId}`;

  const series = buildSearchTrendSeries(
    stats?.daily,
    days,
    stats?.startDate,
    stats?.endDate,
  );
  const showDots = series.length <= 1;
  const caption =
    description ||
    `Searches and zero-result searches. ${periodCaption(days)}.`;

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{caption}</p>
      <ChartContainer
        config={chartConfig}
        className="mt-4 aspect-auto h-56 w-full"
      >
        <AreaChart
          accessibilityLayer
          data={series}
          margin={{ left: 8, right: 8, top: 8 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={days === 30 || days === "all" ? 18 : 8}
            tickFormatter={(value) => formatTrendTick(value, days)}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(_value, tooltipPayload) =>
                  formatTrendLabel(tooltipPayload?.[0]?.payload?.date)
                }
                indicator="dot"
              />
            }
          />
          <defs>
            <linearGradient id={fillSearches} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-searches)"
                stopOpacity={0.9}
              />
              <stop
                offset="95%"
                stopColor="var(--color-searches)"
                stopOpacity={0.05}
              />
            </linearGradient>
            <linearGradient id={fillZeroResults} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-zero_result_searches)"
                stopOpacity={0.9}
              />
              <stop
                offset="95%"
                stopColor="var(--color-zero_result_searches)"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <Area
            dataKey="searches"
            type="linear"
            fill={`url(#${fillSearches})`}
            fillOpacity={0.35}
            stroke="var(--color-searches)"
            strokeWidth={2.5}
            dot={showDots ? { r: 3, strokeWidth: 2 } : false}
            activeDot={{ r: 5, strokeWidth: 2 }}
          />
          <Area
            dataKey="zero_result_searches"
            type="linear"
            fill={`url(#${fillZeroResults})`}
            fillOpacity={0.4}
            stroke="var(--color-zero_result_searches)"
            strokeWidth={2.5}
            dot={showDots ? { r: 3, strokeWidth: 2 } : false}
            activeDot={{ r: 5, strokeWidth: 2 }}
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
