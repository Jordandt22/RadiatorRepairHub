import Link from "next/link";
import { EyeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import BusinessScoreBadge from "@/components/pages/businesses/BusinessScoreBadge";
import { cn } from "@/lib/utils";

function text(value) {
  if (value == null || value === "") return "—";
  return String(value);
}

export function LocationLinkPill({ href, label, className }) {
  if (!label) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (!href) {
    return (
      <Badge
        variant="outline"
        className={cn("border-transparent bg-zinc-100 text-zinc-700", className)}
      >
        {label}
      </Badge>
    );
  }

  return (
    <Link href={href} className="inline-flex max-w-full">
      <Badge
        variant="outline"
        className={cn(
          "max-w-full cursor-pointer truncate transition-all duration-200 hover:scale-95 hover:opacity-80",
          className,
        )}
      >
        {label}
      </Badge>
    </Link>
  );
}

function cityHref(row) {
  if (!row.city_slug) return null;
  return `/cities/${encodeURIComponent(row.city_slug)}`;
}

function stateHref(row) {
  const code = row.state_code ? String(row.state_code).toLowerCase() : null;
  if (!code) return null;
  return `/states/${encodeURIComponent(code)}`;
}

function postalHref(row) {
  const code = row.postal_code || row.postalCode;
  if (!code) return null;
  return `/postal-codes/${encodeURIComponent(code)}`;
}

export const INGEST_INSERTED_COLUMNS = [
  {
    key: "title",
    label: "Title",
    className: "w-[32%]",
    render: (row) => (
      <span className="block truncate font-semibold">{text(row.title)}</span>
    ),
  },
  {
    key: "city",
    label: "City",
    className: "w-[16%]",
    cellClassName: "max-w-0",
    render: (row) => (
      <LocationLinkPill
        href={cityHref(row)}
        label={row.city || null}
        className="border-transparent bg-sky-100 text-sky-800"
      />
    ),
  },
  {
    key: "state",
    label: "State",
    className: "w-[12%]",
    cellClassName: "max-w-0",
    render: (row) => (
      <LocationLinkPill
        href={stateHref(row)}
        label={row.state || row.state_code || null}
        className="border-transparent bg-indigo-100 text-indigo-800"
      />
    ),
  },
  {
    key: "postal_code",
    label: "Postal code",
    className: "w-[16%]",
    cellClassName: "max-w-0",
    render: (row) => (
      <LocationLinkPill
        href={postalHref(row)}
        label={row.postal_code || row.postalCode || null}
        className="border-transparent bg-emerald-100 text-emerald-800"
      />
    ),
  },
  {
    key: "total_score",
    label: "Total score",
    className: "w-[12%]",
    cellClassName: "whitespace-nowrap",
    render: (row) => (
      <BusinessScoreBadge score={row.total_score ?? row.totalScore} />
    ),
  },
  {
    key: "actions",
    label: "",
    className: "w-[12%] text-right",
    cellClassName: "text-right",
    render: (row) =>
      row.id ? (
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          nativeButton={false}
          render={
            <Link
              href={`/businesses/${row.id}`}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <EyeIcon />
          View
        </Button>
      ) : null,
  },
];
