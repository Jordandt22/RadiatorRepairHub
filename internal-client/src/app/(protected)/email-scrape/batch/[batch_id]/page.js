import { Suspense } from "react";
import EmailScrapeBatchDetailPageContent from "@/components/pages/email-scrape/EmailScrapeBatchDetailPageContent";
import EmailScrapeTableSkeleton from "@/components/pages/email-scrape/EmailScrapeTableSkeleton";

function EmailScrapeBatchDetailFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <EmailScrapeTableSkeleton />
    </div>
  );
}

export default function EmailScrapeBatchDetailPage() {
  return (
    <Suspense fallback={<EmailScrapeBatchDetailFallback />}>
      <EmailScrapeBatchDetailPageContent />
    </Suspense>
  );
}
