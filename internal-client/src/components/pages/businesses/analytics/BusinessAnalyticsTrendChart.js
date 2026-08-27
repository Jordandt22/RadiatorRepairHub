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
  buildTrendSeries,
  formatTrendLabel,
  formatTrendTick,
} from "@/lib/businessStats/buildTrendSeries";

const chartConfig = {
  impressions: {
    label: "Impressions",
    theme: {
      light: "#2563eb",
      dark: "#60a5fa",
    },
  },
  listing_clicks: {
    label: "Listing clicks",
    theme: {
      light: "#0d9488",
      dark: "#2dd4bf",
    },
  },
  page_views: {
    label: "Page views",
    theme: {
      light: "#d97706",
      dark: "#fbbf24",
    },
  },
};

function periodCaption(days) {
  if (days === 1) return "Today";
  if (days === 30) return "Each day for the last 30 days";
  if (days === "all") return "Every recorded day";
  return "Each day for the last 7 days";
}

export default function BusinessAnalyticsTrendChart({
  stats,
  days,
  title = "Listing activity",
  description,
}) {
  const rawId = useId().replace(/:/g, "");
  const fillImpressions = `fill-impressions-${rawId}`;
  const fillClicks = `fill-listing-clicks-${rawId}`;
  const fillViews = `fill-page-views-${rawId}`;

  const series = buildTrendSeries(
    stats?.daily,
    days,
    stats?.startDate,
    stats?.endDate
  );
  const showDots = series.length <= 1;
  const caption =
    description ||
    `Page views, listing clicks, and impressions. ${periodCaption(days)}.`;

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {caption}
      </p>
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
            <linearGradient id={fillImpressions} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-impressions)"
                stopOpacity={0.9}
              />
              <stop
                offset="95%"
                stopColor="var(--color-impressions)"
                stopOpacity={0.05}
              />
            </linearGradient>
            <linearGradient id={fillClicks} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-listing_clicks)"
                stopOpacity={0.9}
              />
              <stop
                offset="95%"
                stopColor="var(--color-listing_clicks)"
                stopOpacity={0.05}
              />
            </linearGradient>
            <linearGradient id={fillViews} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-page_views)"
                stopOpacity={0.9}
              />
              <stop
                offset="95%"
                stopColor="var(--color-page_views)"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <Area
            dataKey="impressions"
            type="linear"
            fill={`url(#${fillImpressions})`}
            fillOpacity={0.35}
            stroke="var(--color-impressions)"
            strokeWidth={2.5}
            dot={showDots ? { r: 3, strokeWidth: 2 } : false}
            activeDot={{ r: 5, strokeWidth: 2 }}
          />
          <Area
            dataKey="listing_clicks"
            type="linear"
            fill={`url(#${fillClicks})`}
            fillOpacity={0.4}
            stroke="var(--color-listing_clicks)"
            strokeWidth={2.5}
            dot={showDots ? { r: 3, strokeWidth: 2 } : false}
            activeDot={{ r: 5, strokeWidth: 2 }}
          />
          <Area
            dataKey="page_views"
            type="linear"
            fill={`url(#${fillViews})`}
            fillOpacity={0.45}
            stroke="var(--color-page_views)"
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
