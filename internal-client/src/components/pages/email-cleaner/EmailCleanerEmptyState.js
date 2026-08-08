import { MailIcon, SearchIcon } from "lucide-react";

const EMPTY = {
  icon: MailIcon,
  title: "No businesses with emails",
  description:
    "Listings that have an email on file will appear here for review.",
};

const REVIEW_EMPTY = {
  icon: MailIcon,
  title: "No businesses",
  description: "Business listings will appear here for status review.",
};

const SEARCH_EMPTY = {
  icon: SearchIcon,
  title: "No matches",
  description: "No businesses matched your search. Try different keywords.",
};

const FILTER_EMPTY = {
  icon: SearchIcon,
  title: "No matches",
  description: "No businesses matched your filters. Try adjusting them.",
};

export default function EmailCleanerEmptyState({
  hasSearch = false,
  hasFilters = false,
  variant = "cleaner",
}) {
  const empty = variant === "review" ? REVIEW_EMPTY : EMPTY;
  const content =
    hasSearch || hasFilters ? (hasSearch ? SEARCH_EMPTY : FILTER_EMPTY) : empty;
  const Icon = content.icon;

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{content.title}</p>
        <p className="text-sm text-muted-foreground">{content.description}</p>
      </div>
    </div>
  );
}
