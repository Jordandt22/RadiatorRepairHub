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
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Business</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Listed city</TableHead>
            <TableHead>Postal code</TableHead>
            <TableHead>Postal city</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col gap-0.5">
                  <span>{row.title ?? "—"}</span>
                  {row.slug ? (
                    <span className="text-xs font-normal text-muted-foreground">
                      /business/{row.slug}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                {formatState(row.business_state_name, row.business_state_code)}
              </TableCell>
              <TableCell>
                {formatPlace(row.business_city_name, row.business_state_code)}
              </TableCell>
              <TableCell className="font-medium">
                {row.postal_code ?? "—"}
              </TableCell>
              <TableCell>
                {formatPlace(row.postal_city_name, row.postal_state_code)}
              </TableCell>
              <TableCell>
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
                /business/{row.slug}
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
