import { Suspense } from "react";
import RedisCachePageContent from "@/components/pages/systems/RedisCachePageContent";

function RedisCachePageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <div className="h-7 w-28 animate-pulse rounded bg-muted" />
      <div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-lg border border-border bg-muted/40"
          />
        ))}
      </div>
    </div>
  );
}

export default function RedisCachePage() {
  return (
    <Suspense fallback={<RedisCachePageFallback />}>
      <RedisCachePageContent />
    </Suspense>
  );
}
