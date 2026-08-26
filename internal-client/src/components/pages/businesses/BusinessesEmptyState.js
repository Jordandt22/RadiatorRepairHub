import { BadgeCheckIcon, Building2Icon, SearchIcon, StarIcon } from "lucide-react";

const EMPTY_BY_TAB = {
  all: {
    icon: Building2Icon,
    title: "No businesses found",
    description: "Try a different search, or check back after listings sync.",
  },
  claimed: {
    icon: BadgeCheckIcon,
    title: "No claimed businesses",
    description: "Claimed listings will appear here once owners verify ownership.",
  },
  featured: {
    icon: StarIcon,
    title: "No featured businesses",
    description:
      "Featured listings will appear here once an owner purchases a Featured plan.",
  },
};

const SEARCH_EMPTY = {
  icon: SearchIcon,
  title: "No matches",
  description: "No businesses matched your search. Try different keywords.",
};

export default function BusinessesEmptyState({
  activeTab = "all",
  hasSearch = false,
}) {
  const content = hasSearch
    ? SEARCH_EMPTY
    : (EMPTY_BY_TAB[activeTab] ?? EMPTY_BY_TAB.all);
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
