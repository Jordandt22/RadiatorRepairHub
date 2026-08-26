import { Building2Icon, FlaskConicalIcon, SearchIcon, UsersIcon } from "lucide-react";

const EMPTY = {
  businesses: {
    icon: Building2Icon,
    title: "No test businesses",
    description: "Create a test listing to exercise claims, search, and Featured.",
  },
  users: {
    icon: UsersIcon,
    title: "No test users",
    description: "Create a disposable owner account to sign in on the public site.",
  },
};

const SEARCH_EMPTY = {
  icon: SearchIcon,
  title: "No matches",
  description: "Nothing matched your search. Try a different term.",
};

export default function TestingEmptyState({ tab = "businesses", hasSearch = false }) {
  const content = hasSearch ? SEARCH_EMPTY : (EMPTY[tab] ?? EMPTY.businesses);
  const Icon = content.icon ?? FlaskConicalIcon;

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
