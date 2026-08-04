import { Suspense } from "react";
import EmailCleanerPageContent from "@/components/pages/email-cleaner/EmailCleanerPageContent";
import EmailCleanerTableSkeleton from "@/components/pages/email-cleaner/EmailCleanerTableSkeleton";

function EmailCleanerPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <EmailCleanerTableSkeleton />
    </div>
  );
}

export default function EmailCleanerPage() {
  return (
    <Suspense fallback={<EmailCleanerPageFallback />}>
      <EmailCleanerPageContent />
    </Suspense>
  );
}
