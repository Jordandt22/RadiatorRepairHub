import { MailSearchIcon } from "lucide-react";

export default function EmailScrapeEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
        <MailSearchIcon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-medium text-foreground">No scrape jobs</p>
        <p className="text-sm text-muted-foreground">
          Start a scrape to find contact emails on business websites that do not
          already have an email on file.
        </p>
      </div>
    </div>
  );
}
