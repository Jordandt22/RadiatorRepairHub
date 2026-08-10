import { Suspense } from "react";
import OutreachScheduleJobDetailPageContent from "@/components/pages/outreach/OutreachScheduleJobDetailPageContent";
import OutreachTableSkeleton from "@/components/pages/outreach/OutreachTableSkeleton";

export default function OutreachScheduleJobDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full flex-1 flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
          <OutreachTableSkeleton />
        </div>
      }
    >
      <OutreachScheduleJobDetailPageContent />
    </Suspense>
  );
}
