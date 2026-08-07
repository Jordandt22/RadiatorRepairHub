import { Skeleton } from "@/components/ui/skeleton";

export default function EmailScrapeTableSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="space-y-2 rounded-lg border p-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
