import { SearchIcon, UsersIcon } from "lucide-react";

const EMPTY = {
  icon: UsersIcon,
  title: "No users found",
  description:
    "Business owner accounts will appear here after listings are claimed.",
};

const SEARCH_EMPTY = {
  icon: SearchIcon,
  title: "No matches",
  description: "No users matched your search. Try a different email or uid.",
};

export default function UsersEmptyState({ hasSearch = false }) {
  const content = hasSearch ? SEARCH_EMPTY : EMPTY;
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
