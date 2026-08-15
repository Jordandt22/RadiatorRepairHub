import Link from "next/link";
import BusinessDetailCard from "@/components/pages/businesses/BusinessDetailCard";

function formatCoord(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return String(value);
}

function LocationLink({ href, children }) {
  if (!href) return children;
  return (
    <Link href={href} className="underline underline-offset-2">
      {children}
    </Link>
  );
}

export default function BusinessDetailLocationTab({ data }) {
  const cityName = data.city?.name || null;
  const cityHref = data.city?.slug
    ? `/cities/${encodeURIComponent(data.city.slug)}`
    : null;
  const stateName = data.state?.name || null;
  const stateCode = data.state?.code || null;
  const stateHref = stateCode
    ? `/states/${encodeURIComponent(String(stateCode).toLowerCase())}`
    : null;
  const postalCode = data.postal_code?.code || null;
  const postalHref = postalCode
    ? `/postal-codes/${encodeURIComponent(postalCode)}`
    : null;
  const mapsQuery =
    data.latitude != null && data.longitude != null
      ? `${data.latitude},${data.longitude}`
      : data.address || null;
  const mapsHref = mapsQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`
    : null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight">Location</h2>
        {mapsHref ? (
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline underline-offset-2"
          >
            Open in Maps
          </a>
        ) : null}
      </div>
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <BusinessDetailCard label="Address">
          {data.address || "—"}
        </BusinessDetailCard>
        <BusinessDetailCard label="City">
          {cityName ? (
            <LocationLink href={cityHref}>{cityName}</LocationLink>
          ) : (
            "—"
          )}
        </BusinessDetailCard>
        <BusinessDetailCard label="State">
          {stateName || stateCode ? (
            <LocationLink href={stateHref}>
              {stateName}
              {stateCode ? ` (${stateCode})` : ""}
            </LocationLink>
          ) : (
            "—"
          )}
        </BusinessDetailCard>
        <BusinessDetailCard label="Postal code">
          {postalCode ? (
            <LocationLink href={postalHref}>{postalCode}</LocationLink>
          ) : (
            "—"
          )}
        </BusinessDetailCard>
        <BusinessDetailCard label="Timezone">
          {data.timezone || "—"}
        </BusinessDetailCard>
        <BusinessDetailCard label="Latitude">
          {formatCoord(data.latitude)}
        </BusinessDetailCard>
        <BusinessDetailCard label="Longitude">
          {formatCoord(data.longitude)}
        </BusinessDetailCard>
      </dl>
    </section>
  );
}
