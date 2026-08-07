import { Suspense } from "react";
import EmailScrapePageContent from "@/components/pages/email-scrape/EmailScrapePageContent";
import EmailScrapeTableSkeleton from "@/components/pages/email-scrape/EmailScrapeTableSkeleton";

function EmailScrapeFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <EmailScrapeTableSkeleton />
    </div>
  );
}

export default function EmailScrapePage() {
  return (
    <Suspense fallback={<EmailScrapeFallback />}>
      <EmailScrapePageContent />
    </Suspense>
  );
}
