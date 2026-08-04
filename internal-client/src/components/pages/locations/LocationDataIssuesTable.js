import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LocationsEmptyState from "@/components/pages/locations/LocationsEmptyState";

function formatPlace(city, stateCode) {
  if (!city && !stateCode) return "—";
  if (!stateCode) return city;
  if (!city) return stateCode;
  return `${city}, ${stateCode}`;
}

function formatState(name, code) {
  if (!name && !code) return "—";
  if (!code) return name;
  if (!name) return code;
  return (
    <span className="text-sm">
      {name}
      <span className="text-muted-foreground"> ({code})</span>
    </span>
  );
}

function DataIssuesTableView({ issues }) {
  return (
    <div className="hidden min-w-0 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[24%]">Business</TableHead>
            <TableHead className="w-[16%]">State</TableHead>
            <TableHead className="w-[14%]">Listed city</TableHead>
            <TableHead className="w-[12%]">Postal code</TableHead>
            <TableHead className="w-[14%]">Postal city</TableHead>
            <TableHead className="w-[20%]">Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="max-w-0 font-medium">
                <div className="min-w-0">
                  <span className="block truncate">{row.title ?? "—"}</span>
                  {row.slug ? (
                    <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                      {row.slug}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="max-w-0">
                <span className="block truncate">
                  {formatState(row.business_state_name, row.business_state_code)}
                </span>
              </TableCell>
              <TableCell className="max-w-0">
                <span className="block truncate">
                  {formatPlace(row.business_city_name, row.business_state_code)}
                </span>
              </TableCell>
              <TableCell className="max-w-0 font-medium">
                <span className="block truncate">{row.postal_code ?? "—"}</span>
              </TableCell>
              <TableCell className="max-w-0">
                <span className="block truncate">
                  {formatPlace(row.postal_city_name, row.postal_state_code)}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {row.same_city_name ? (
                  <Badge
                    variant="outline"
                    className="border-transparent bg-amber-100 text-amber-800"
                  >
                    Duplicate city name
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-transparent bg-red-100 text-red-800"
                  >
                    City mismatch
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DataIssuesCardList({ issues }) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {issues.map((row) => (
        <div
          key={row.id}
          className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">{row.title ?? "—"}</p>
            {row.slug ? (
              <p className="text-xs text-muted-foreground">
                {row.slug}
              </p>
            ) : null}
            <div className="mt-1.5">
              {row.same_city_name ? (
                <Badge
                  variant="outline"
                  className="border-transparent bg-amber-100 text-amber-800"
                >
                  Duplicate city name
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-transparent bg-red-100 text-red-800"
                >
                  City mismatch
                </Badge>
              )}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
            <dt className="text-muted-foreground">State</dt>
            <dd>
              {formatState(row.business_state_name, row.business_state_code)}
            </dd>
            <dt className="text-muted-foreground">Listed city</dt>
            <dd>
              {formatPlace(row.business_city_name, row.business_state_code)}
            </dd>
            <dt className="text-muted-foreground">Postal code</dt>
            <dd>{row.postal_code ?? "—"}</dd>
            <dt className="text-muted-foreground">Postal city</dt>
            <dd>
              {formatPlace(row.postal_city_name, row.postal_state_code)}
            </dd>
          </dl>
        </div>
      ))}
    </div>
  );
}

export default function LocationDataIssuesTable({
  issues = [],
  hasSearch = false,
}) {
  if (!issues.length) {
    return (
      <LocationsEmptyState activeTab="data-issues" hasSearch={hasSearch} />
    );
  }

  return (
    <>
      <DataIssuesCardList issues={issues} />
      <DataIssuesTableView issues={issues} />
    </>
  );
}
