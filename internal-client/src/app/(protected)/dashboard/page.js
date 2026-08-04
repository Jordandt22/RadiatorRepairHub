import { Suspense } from "react";
import OverviewDashboardPageContent from "@/components/pages/overview/OverviewDashboardPageContent";
import { OverviewDashboardChartsSkeleton } from "@/components/pages/overview/OverviewDashboardCharts";

function DashboardPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <div className="h-11 w-full max-w-md animate-pulse rounded-full bg-muted" />
      <div className="mt-4">
        <OverviewDashboardChartsSkeleton />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <OverviewDashboardPageContent />
    </Suspense>
  );
}
