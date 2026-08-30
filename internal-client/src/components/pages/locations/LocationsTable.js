"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import LocationsEmptyState from "@/components/pages/locations/LocationsEmptyState";

function formatCount(value) {
  return Number(value ?? 0).toLocaleString();
}

function getPercentagePillClass(value) {
  const num = Number(value ?? 0);
  if (num < 1) return "border-transparent bg-red-100 text-red-800";
  if (num < 3) return "border-transparent bg-orange-100 text-orange-800";
  if (num < 5) return "border-transparent bg-yellow-100 text-yellow-800";
  if (num <= 10) return "border-transparent bg-sky-100 text-sky-800";
  return "border-transparent bg-emerald-100 text-emerald-800";
}

function PercentagePill({ value, className }) {
  const num = Number(value ?? 0);
  return (
    <Badge
      variant="outline"
      className={cn(
        "tabular-nums",
        getPercentagePillClass(num),
        className,
      )}
    >
      {`${num.toFixed(2)}%`}
    </Badge>
  );
}

export function locationHref(activeTab, row) {
  if (activeTab === "cities") {
    if (!row.slug) return null;
    return `/cities/${encodeURIComponent(row.slug)}`;
  }
  if (activeTab === "postal-codes") {
    if (!row.code) return null;
    return `/postal-codes/${encodeURIComponent(row.code)}`;
  }
  const slug = row.slug || String(row.code ?? "").toLowerCase();
  if (!slug) return null;
  return `/states/${encodeURIComponent(slug)}`;
}

export function searchDemandLocationHref(dimension, row) {
  const href =
    dimension === "city"
      ? locationHref("cities", row)
      : dimension === "state"
        ? locationHref("states", row)
        : null;
  if (!href) return null;
  return `${href}?tab=search-demand`;
}

const clickableRowClass =
  "cursor-pointer transition-colors hover:bg-muted/50";

export function useRowNavigate(href) {
  const router = useRouter();
  if (!href) return {};
  return {
    className: clickableRowClass,
    role: "link",
    tabIndex: 0,
    onClick: () => router.push(href),
    onKeyDown: (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        router.push(href);
      }
    },
  };
}

function StatesTableView({ locations }) {
  return (
    <div className="hidden min-w-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[36%]">State</TableHead>
            <TableHead className="w-[16%] text-right">Businesses</TableHead>
            <TableHead className="w-[16%] text-right">Percentage</TableHead>
            <TableHead className="w-[16%] text-right">Cities</TableHead>
            <TableHead className="w-[16%] text-right">Postal Codes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((row) => (
            <StateTableRow key={row.id} row={row} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StateTableRow({ row }) {
  const href = locationHref("states", row);
  const nav = useRowNavigate(href);
  return (
    <TableRow {...nav}>
      <TableCell className="max-w-0 font-medium">
        <div className="min-w-0">
          <span className="block truncate">{row.name ?? "—"}</span>
          {row.code ? (
            <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
              {row.code}
            </span>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {formatCount(row.business_count)}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        <div className="flex justify-end">
          <PercentagePill value={row.percentage} />
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {formatCount(row.city_count)}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {formatCount(row.postal_code_count)}
      </TableCell>
    </TableRow>
  );
}

function CitiesTableView({ locations }) {
  return (
    <div className="hidden min-w-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[28%]">City</TableHead>
            <TableHead className="w-[28%]">State</TableHead>
            <TableHead className="w-[14%] text-right">Businesses</TableHead>
            <TableHead className="w-[16%] text-right">% in State</TableHead>
            <TableHead className="w-[14%] text-right">Postal Codes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((row) => (
            <CityTableRow key={row.id} row={row} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CityTableRow({ row }) {
  const href = locationHref("cities", row);
  const nav = useRowNavigate(href);
  return (
    <TableRow {...nav}>
      <TableCell className="max-w-0 font-medium">
        <span className="block truncate">{row.name ?? "—"}</span>
      </TableCell>
      <TableCell className="max-w-0">
        <span className="block truncate text-sm">
          {row.state_name ?? "—"}
          {row.state_code ? (
            <span className="text-muted-foreground">
              {" "}
              ({row.state_code})
            </span>
          ) : null}
        </span>
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {formatCount(row.business_count)}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        <div className="flex justify-end">
          <PercentagePill value={row.percentage} />
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {formatCount(row.postal_code_count)}
      </TableCell>
    </TableRow>
  );
}

function PostalCodesTableView({ locations }) {
  return (
    <div className="hidden min-w-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[16%]">Postal Code</TableHead>
            <TableHead className="w-[28%]">City</TableHead>
            <TableHead className="w-[28%]">State</TableHead>
            <TableHead className="w-[14%] text-right">Businesses</TableHead>
            <TableHead className="w-[14%] text-right">% in City</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((row) => (
            <PostalTableRow key={row.id} row={row} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PostalTableRow({ row }) {
  const href = locationHref("postal-codes", row);
  const nav = useRowNavigate(href);
  return (
    <TableRow {...nav}>
      <TableCell className="max-w-0 font-medium">
        <span className="block truncate">{row.code ?? "—"}</span>
      </TableCell>
      <TableCell className="max-w-0">
        <span className="block truncate">{row.city_name ?? "—"}</span>
      </TableCell>
      <TableCell className="max-w-0">
        <span className="block truncate text-sm">
          {row.state_name ?? "—"}
          {row.state_code ? (
            <span className="text-muted-foreground">
              {" "}
              ({row.state_code})
            </span>
          ) : null}
        </span>
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {formatCount(row.business_count)}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        <div className="flex justify-end">
          <PercentagePill value={row.percentage} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function StatesCardList({ locations }) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {locations.map((row) => {
        const href = locationHref("states", row);
        const content = (
          <>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.name ?? "—"}</p>
              {row.code ? (
                <p className="text-xs text-muted-foreground">{row.code}</p>
              ) : null}
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Businesses</dt>
              <dd>{formatCount(row.business_count)}</dd>
              <dt className="text-muted-foreground">Percentage</dt>
              <dd>
                <PercentagePill value={row.percentage} />
              </dd>
              <dt className="text-muted-foreground">Cities</dt>
              <dd>{formatCount(row.city_count)}</dd>
              <dt className="text-muted-foreground">Postal Codes</dt>
              <dd>{formatCount(row.postal_code_count)}</dd>
            </dl>
          </>
        );

        if (!href) {
          return (
            <div
              key={row.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
            >
              {content}
            </div>
          );
        }

        return (
          <Link
            key={row.id}
            href={href}
            className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/50"
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}

function CitiesCardList({ locations }) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {locations.map((row) => {
        const href = locationHref("cities", row);
        const content = (
          <>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground">
                {row.state_name ?? "—"}
                {row.state_code ? ` (${row.state_code})` : ""}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Businesses</dt>
              <dd>{formatCount(row.business_count)}</dd>
              <dt className="text-muted-foreground">% in State</dt>
              <dd>
                <PercentagePill value={row.percentage} />
              </dd>
              <dt className="text-muted-foreground">Postal Codes</dt>
              <dd>{formatCount(row.postal_code_count)}</dd>
            </dl>
          </>
        );

        if (!href) {
          return (
            <div
              key={row.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
            >
              {content}
            </div>
          );
        }

        return (
          <Link
            key={row.id}
            href={href}
            className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/50"
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}

function PostalCodesCardList({ locations }) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {locations.map((row) => {
        const href = locationHref("postal-codes", row);
        const content = (
          <>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.code ?? "—"}</p>
              <p className="text-xs text-muted-foreground">
                {row.city_name ?? "—"}
                {row.state_code ? `, ${row.state_code}` : ""}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Businesses</dt>
              <dd>{formatCount(row.business_count)}</dd>
              <dt className="text-muted-foreground">% in City</dt>
              <dd>
                <PercentagePill value={row.percentage} />
              </dd>
            </dl>
          </>
        );

        if (!href) {
          return (
            <div
              key={row.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
            >
              {content}
            </div>
          );
        }

        return (
          <Link
            key={row.id}
            href={href}
            className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/50"
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}

export default function LocationsTable({
  locations = [],
  activeTab = "states",
  hasSearch = false,
}) {
  if (!locations.length) {
    return (
      <LocationsEmptyState activeTab={activeTab} hasSearch={hasSearch} />
    );
  }

  if (activeTab === "cities") {
    return (
      <>
        <CitiesCardList locations={locations} />
        <CitiesTableView locations={locations} />
      </>
    );
  }

  if (activeTab === "postal-codes") {
    return (
      <>
        <PostalCodesCardList locations={locations} />
        <PostalCodesTableView locations={locations} />
      </>
    );
  }

  return (
    <>
      <StatesCardList locations={locations} />
      <StatesTableView locations={locations} />
    </>
  );
}
