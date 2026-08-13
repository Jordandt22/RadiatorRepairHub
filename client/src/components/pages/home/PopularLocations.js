import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

function BusinessCount({ count }) {
  const n = Number(count) || 0;
  return (
    <>
      <span className="font-semibold text-green-700">{n.toLocaleString()}</span>{" "}
      {n === 1 ? "Business" : "Businesses"}
    </>
  );
}

function PopularLocations({ states = [] }) {
  if (!states.length) return null;

  return (
    <section className="section-atmosphere border-y border-border bg-card py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
            Popular States
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
            Search by{" "}
            <Link
              href="/states"
              className="text-interactive underline hover:text-primary"
            >
              state and city
            </Link>{" "}
            to locate verified radiator repair shops in the most active areas
            across the U.S.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {states.map((state) => (
            <Link
              key={state.code}
              href={`/state/${state.code}`}
              className="group flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors duration-200 hover:border-interactive"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tint">
                <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-heading text-base font-semibold text-foreground">
                  {state.name}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {state.code} · <BusinessCount count={state.business_count} />
                </span>
              </div>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-interactive"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/states"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
          >
            View All States
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PopularLocations;
