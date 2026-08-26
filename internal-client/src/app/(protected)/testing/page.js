import { Suspense } from "react";
import TestingPageContent from "@/components/pages/testing/TestingPageContent";
import TestingTableSkeleton from "@/components/pages/testing/TestingTableSkeleton";

function TestingPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <TestingTableSkeleton />
    </div>
  );
}

export default function TestingPage() {
  return (
    <Suspense fallback={<TestingPageFallback />}>
      <TestingPageContent />
    </Suspense>
  );
}
