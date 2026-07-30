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

const TAB_COPY = {
  states: {
    title: "Businesses by State",
    description: "Share of listings across states",
    footer: "Top 4 States by Business Count and Other States",
  },
  cities: {
    title: "Businesses by City",
    description: "Share of listings across cities",
    footer: "Top Cities by Business Count and Other Cities",
  },
  "postal-codes": {
    title: "Businesses by Postal Code",
    description: "Share of listings across postal codes",
    footer: "Top Postal Codes by Business Count and Other Postal Codes",
  },
};

function buildChartModel(chart) {
  const slices = chart?.slices ?? [];
  const chartData = slices.map((slice, index) => ({
    key: slice.key,
    label: slice.label,
    businesses: slice.businesses,
    fill: `var(--color-${slice.key})`,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const chartConfig = {
    businesses: { label: "Businesses" },
  };

  for (const slice of chartData) {
    chartConfig[slice.key] = {
      label: slice.label,
      color: slice.color,
    };
  }

  return { chartData, chartConfig };
}

export default function LocationsBusinessesChart({
  chart = null,
  activeTab = "states",
}) {
  const copy = TAB_COPY[activeTab] ?? TAB_COPY.states;
  const totalBusinesses = chart?.total_businesses ?? 0;
  const { chartData, chartConfig } = React.useMemo(
    () => buildChartModel(chart),
    [chart],
  );

  if (!chartData.length || totalBusinesses <= 0) {
    return null;
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
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
              dataKey="businesses"
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
                          {totalBusinesses.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Businesses
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
        <div className="leading-none text-muted-foreground text-center">
          {copy.footer}
        </div>
      </CardFooter>
    </Card>
  );
}
