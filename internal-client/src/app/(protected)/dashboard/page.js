import { Suspense } from "react";
import DashboardPageContent from "@/components/pages/dashboard/DashboardPageContent";
import ContactMessagesTableSkeleton from "@/components/pages/dashboard/ContactMessagesTableSkeleton";

function DashboardPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <ContactMessagesTableSkeleton />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <DashboardPageContent />
    </Suspense>
  );
}
