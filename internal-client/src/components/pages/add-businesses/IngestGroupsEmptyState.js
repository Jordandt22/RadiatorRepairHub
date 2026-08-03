import { UploadIcon } from "lucide-react";

export default function IngestGroupsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
        <UploadIcon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-medium text-foreground">No ingest groups</p>
        <p className="text-sm text-muted-foreground">
          Upload a JSON file of businesses to start filtering, enriching, and
          inserting listings.
        </p>
      </div>
    </div>
  );
}
