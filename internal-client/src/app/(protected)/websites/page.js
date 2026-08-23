import { Suspense } from "react";
import WebsitesPageContent from "@/components/pages/websites/WebsitesPageContent";
import WebsitesTableSkeleton from "@/components/pages/websites/WebsitesTableSkeleton";

function WebsitesPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <WebsitesTableSkeleton />
    </div>
  );
}

export default function WebsitesPage() {
  return (
    <Suspense fallback={<WebsitesPageFallback />}>
      <WebsitesPageContent />
    </Suspense>
  );
}
