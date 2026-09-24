"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

const SLICE_COLORS = {
  email: "var(--chart-1)",
  website: "var(--chart-2)",
  both: "var(--chart-3)",
  none: "var(--chart-5)",
};

function buildChartModel(chart) {
  const slices = Array.isArray(chart?.slices) ? chart.slices : [];
  const chartData = slices
    .filter((slice) => Number(slice?.count || 0) > 0)
    .map((slice) => {
      const key = String(slice.key || "");
      const color = SLICE_COLORS[key] ?? "var(--chart-4)";
      return {
        key,
        label: slice.label || key,
        value: Number(slice.count || 0),
        fill: color,
        color,
      };
    });

  const chartConfig = {
    value: { label: "Businesses" },
  };
  for (const slice of chartData) {
    chartConfig[slice.key] = {
      label: slice.label,
      color: slice.color,
    };
  }

  return { chartData, chartConfig };
}

export function PhoneActivityContactChartSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <Skeleton className="h-4 w-44" />
      <Skeleton className="mt-2 h-4 w-64" />
      <Skeleton className="mx-auto mt-6 size-48 rounded-full" />
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export default function PhoneActivityContactChart({ chart }) {
  const total = Number(chart?.total || 0);
  const { chartData, chartConfig } = React.useMemo(
    () => buildChartModel(chart),
    [chart],
  );

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4">
      <p className="text-sm font-medium text-foreground">
        Contact info on phone-click listings
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Businesses with at least one phone click, by email and website on file.
      </p>
      {total <= 0 || chartData.length === 0 ? (
        <div className="mt-4 flex h-56 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No phone-click businesses in this period yet.
          </p>
        </div>
      ) : (
        <>
          <ChartContainer
            config={chartConfig}
            className="mx-auto mt-2 aspect-square max-h-56"
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
                innerRadius={58}
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
                            y={(viewBox.cy || 0) + 22}
                            className="fill-muted-foreground"
                          >
                            Businesses
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {chartData.map((slice) => (
              <div key={slice.key} className="flex items-center gap-1.5">
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
        </>
      )}
    </div>
  );
}
