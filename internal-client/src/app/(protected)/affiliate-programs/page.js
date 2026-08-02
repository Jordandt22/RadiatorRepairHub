import { Suspense } from "react";
import AffiliateProgramsPageContent from "@/components/pages/affiliate-programs/AffiliateProgramsPageContent";
import AffiliateProductsTableSkeleton from "@/components/pages/affiliate-programs/AffiliateProductsTableSkeleton";

function AffiliateProgramsPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <AffiliateProductsTableSkeleton />
    </div>
  );
}

export default function AffiliateProgramsPage() {
  return (
    <Suspense fallback={<AffiliateProgramsPageFallback />}>
      <AffiliateProgramsPageContent />
    </Suspense>
  );
}
