import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import NearbyBusinessCard from "@/components/businesses/NearbyBusinessCard";

/**
 * Alternative shops shown on unclaimed listings.
 *
 * Unclaimed pages cannot offer Quick Contact, so visitors who bounce here have
 * no next step. Rendering server-side also gives crawlers direct links between
 * listings in the same city rather than only through filtered search URLs.
 */
export default function NearbyBusinesses({
  businesses = [],
  cityName,
  cityHref,
}) {
  if (!Array.isArray(businesses) || businesses.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-10">
      <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
        Other Radiator Repair Shops in {cityName}
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
        Comparing options? These {cityName} shops are also listed in our
        directory, with ratings, hours, and contact details.
      </p>

      <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {businesses.map((business, index) => (
          <li key={business.id}>
            <NearbyBusinessCard business={business} position={index + 1} />
          </li>
        ))}
      </ul>

      {cityHref ? (
        <Link
          href={cityHref}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          View all Radiator Repair in {cityName}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </section>
  );
}
