import {
  AlertTriangleIcon,
  Building2Icon,
  HashIcon,
  MapPinnedIcon,
  SearchIcon,
} from "lucide-react";

const EMPTY_BY_TAB = {
  states: {
    icon: MapPinnedIcon,
    title: "No states found",
    description: "State location data will appear here once listings sync.",
  },
  cities: {
    icon: Building2Icon,
    title: "No cities found",
    description: "City location data will appear here once listings sync.",
  },
  "postal-codes": {
    icon: HashIcon,
    title: "No postal codes found",
    description: "Postal code data will appear here once listings sync.",
  },
  "data-issues": {
    icon: AlertTriangleIcon,
    title: "No data issues found",
    description:
      "All businesses with a postal code match their listed city.",
  },
};

const SEARCH_EMPTY = {
  icon: SearchIcon,
  title: "No matches",
  description:
    "No locations matched your filters. Try a different search or selection.",
};

export default function LocationsEmptyState({
  activeTab = "states",
  hasSearch = false,
}) {
  const content = hasSearch
    ? SEARCH_EMPTY
    : (EMPTY_BY_TAB[activeTab] ?? EMPTY_BY_TAB.states);
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
