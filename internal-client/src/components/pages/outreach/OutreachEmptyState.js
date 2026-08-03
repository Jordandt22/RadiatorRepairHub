import { HistoryIcon, MegaphoneIcon, SearchIcon, SendIcon } from "lucide-react";

const CONTENT = {
  browse: {
    icon: MegaphoneIcon,
    title: "No businesses found",
    description: "Businesses will appear here once listings are available.",
    filteredTitle: "No matches",
    filteredDescription:
      "Try adjusting filters or search to find businesses.",
  },
  sender: {
    icon: SendIcon,
    title: "No matched businesses",
    description:
      "Choose an email type and limit, then click Select matching to build a send list.",
    filteredTitle: "No eligible matches",
    filteredDescription:
      "No eligible businesses matched. Try a different email type or raise the limit.",
  },
  history: {
    icon: HistoryIcon,
    title: "No outreach history",
    description: "Sent outreach emails will show up here.",
    filteredTitle: "No matching history",
    filteredDescription:
      "Try adjusting the campaign type or search, or clear filters.",
  },
};

export default function OutreachEmptyState({
  hasFilters = false,
  variant = "browse",
}) {
  const config = CONTENT[variant] ?? CONTENT.browse;
  const Icon = hasFilters ? SearchIcon : config.icon;
  const title = hasFilters ? config.filteredTitle : config.title;
  const description = hasFilters
    ? config.filteredDescription
    : config.description;

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm ring-1 ring-border">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
