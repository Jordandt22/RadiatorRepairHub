import { Suspense } from "react";
import OutreachPageContent from "@/components/pages/outreach/OutreachPageContent";
import OutreachTableSkeleton from "@/components/pages/outreach/OutreachTableSkeleton";

function OutreachPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <OutreachTableSkeleton />
    </div>
  );
}

export default function OutreachPage() {
  return (
    <Suspense fallback={<OutreachPageFallback />}>
      <OutreachPageContent />
    </Suspense>
  );
}
