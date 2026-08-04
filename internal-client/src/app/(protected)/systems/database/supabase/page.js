import { Suspense } from "react";
import SupabaseHealthPageContent from "@/components/pages/systems/SupabaseHealthPageContent";

function SupabaseHealthPageFallback() {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-4 md:gap-4 md:px-8 md:py-6">
      <div className="h-7 w-32 animate-pulse rounded bg-muted" />
      <div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
      <div className="mt-4 h-36 animate-pulse rounded-lg border border-border bg-muted/40" />
    </div>
  );
}

export default function SupabaseHealthPage() {
  return (
    <Suspense fallback={<SupabaseHealthPageFallback />}>
      <SupabaseHealthPageContent />
    </Suspense>
  );
}
