import { Suspense } from "react";
import SearchStatsPageContent from "@/components/pages/businesses/search-stats/SearchStatsPageContent";
import { SearchStatsTableSkeleton } from "@/components/pages/businesses/search-stats/SearchStatsTable";

function SearchStatsPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <SearchStatsTableSkeleton />
    </div>
  );
}

export default function SearchStatsPage() {
  return (
    <Suspense fallback={<SearchStatsPageFallback />}>
      <SearchStatsPageContent />
    </Suspense>
  );
}
