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

const BATCH_SLICE_CONFIG = [
  {
    key: "result",
    label: "Result",
    color: "#34d399",
    getCount: (batch) => Number(batch.result_count) || 0,
  },
  {
    key: "enrich_failed",
    label: "Enrich failed",
    color: "#fb923c",
    getCount: (batch) => Number(batch.failed_enrichment_count) || 0,
  },
  {
    key: "insert_failed",
    label: "Insert failed",
    color: "#fb7185",
    getCount: (batch) => Number(batch.failed_insertion_count) || 0,
  },
];

const FILTERED_SLICE = {
  key: "filtered_out",
  label: "Filtered out",
  color: "#94a3b8",
};

const LEGEND_SLICES = [FILTERED_SLICE, ...BATCH_SLICE_CONFIG];

function buildChartModel(batches = [], filteredOutCount = 0) {
  const completed = batches.filter((batch) => batch.status === "completed");
  const totals = {
    filtered_out: Number(filteredOutCount) || 0,
    result: 0,
    enrich_failed: 0,
    insert_failed: 0,
  };

  for (const batch of completed) {
    for (const slice of BATCH_SLICE_CONFIG) {
      totals[slice.key] += slice.getCount(batch);
    }
  }

  const chartData = LEGEND_SLICES.map((slice) => ({
    key: slice.key,
    label: slice.label,
    count: totals[slice.key],
    fill: `var(--color-${slice.key})`,
    color: slice.color,
  })).filter((slice) => slice.count > 0);

  const chartConfig = {
    count: { label: "Businesses" },
  };
  for (const slice of LEGEND_SLICES) {
    chartConfig[slice.key] = {
      label: slice.label,
      color: slice.color,
    };
  }

  const total =
    totals.filtered_out +
    totals.result +
    totals.enrich_failed +
    totals.insert_failed;

  return {
    completedCount: completed.length,
    chartData,
    chartConfig,
    total,
    hasFilteredOut: totals.filtered_out > 0,
  };
}

export default function IngestBatchOutcomesChart({
  batches = [],
  filteredOutCount = 0,
}) {
  const { completedCount, chartData, chartConfig, total, hasFilteredOut } =
    React.useMemo(
      () => buildChartModel(batches, filteredOutCount),
      [batches, filteredOutCount],
    );

  const waitingForData = completedCount === 0 && !hasFilteredOut;

  if (waitingForData) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Batch outcomes</CardTitle>
          <CardDescription>
            Filtered-out plus completed batch results
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center py-10">
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            Waiting for data. The chart will update after filtering and as
            batches finish inserting.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (total <= 0 || chartData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Batch outcomes</CardTitle>
          <CardDescription>
            Filtered-out plus completed batch results
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center py-10">
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            No outcome counts available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const description =
    completedCount > 0
      ? `Filtered out plus ${completedCount} completed ${
          completedCount === 1 ? "batch" : "batches"
        }`
      : "Filtered-out businesses (batch results pending)";

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Batch outcomes</CardTitle>
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
              dataKey="count"
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
                          Outcomes
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
        <div className="flex flex-wrap items-center justify-center gap-3">
          {LEGEND_SLICES.map((slice) => (
            <div
              key={slice.key}
              className="flex items-center gap-1.5 text-muted-foreground"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: slice.color }}
                aria-hidden="true"
              />
              <span>{slice.label}</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
