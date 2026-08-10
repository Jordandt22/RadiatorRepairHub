import { Suspense } from "react";
import FeedbackSurveysPageContent from "@/components/pages/feedback-surveys/FeedbackSurveysPageContent";
import FeedbackSurveysTableSkeleton from "@/components/pages/feedback-surveys/FeedbackSurveysTableSkeleton";

function FeedbackSurveysPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <FeedbackSurveysTableSkeleton />
    </div>
  );
}

export default function FeedbackSurveysPage() {
  return (
    <Suspense fallback={<FeedbackSurveysPageFallback />}>
      <FeedbackSurveysPageContent />
    </Suspense>
  );
}
