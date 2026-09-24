"use client";

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  buildPhoneTrendSeries,
  formatTrendLabel,
  formatTrendTick,
} from "@/lib/businessStats/buildTrendSeries";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  phone_clicks: {
    label: "Phone clicks",
    theme: {
      light: "#2563eb",
      dark: "#60a5fa",
    },
  },
};

function periodCaption(days) {
  if (days === 1) return "Today";
  if (days === 30) return "Each day for the last 30 days";
  if (days === "all") return "Every recorded day";
  return "Each day for the last 7 days";
}

export function PhoneActivityTrendChartSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-2 h-4 w-56" />
      <Skeleton className="mt-4 h-56 w-full rounded-md" />
    </div>
  );
}

export default function PhoneActivityTrendChart({ stats, days }) {
  const rawId = useId().replace(/:/g, "");
  const fillId = `fill-phone-clicks-${rawId}`;

  const series = buildPhoneTrendSeries(
    stats?.daily,
    days,
    stats?.startDate,
    stats?.endDate
  );
  const showDots = series.length <= 1;
  const hasData = series.some((row) => Number(row.phone_clicks || 0) > 0);

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <p className="text-sm font-medium text-foreground">Daily phone clicks</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Call-button taps across listings. {periodCaption(days)}.
      </p>
      {!hasData ? (
        <div className="mt-4 flex h-56 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No phone clicks in this period yet.
          </p>
        </div>
      ) : (
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
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-phone_clicks)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-phone_clicks)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="phone_clicks"
              type="linear"
              fill={`url(#${fillId})`}
              fillOpacity={0.4}
              stroke="var(--color-phone_clicks)"
              strokeWidth={2.5}
              dot={showDots ? { r: 3, strokeWidth: 2 } : false}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
}
