import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Components
import DetailedBusinessCard from "@/components/businesses/cards/DetailedBusinessCard";
import ErrorDisplay from "@/components/status/Errors/ErrorDisplay";
import { fetchFeaturedBusinesses } from "@/lib/api/businesses";

async function FeaturedBusinesses() {
  try {
    const { data: businesses, error, status } = await fetchFeaturedBusinesses();

    if (error) {
      return (
        <ErrorDisplay
          status={status || 500}
          code={error?.code}
          message={error?.message}
          link={{
            path: "/featured",
            text: "Go to featured businesses page",
          }}
        />
      );
    }

    const list = businesses || [];

    return (
      <section className="section-atmosphere border-b border-border bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
              Featured Businesses
            </h2>
            <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
              Top-rated radiator repair shops recommended by our community
            </p>
          </div>

          {Array.isArray(list) && list.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.slice(0, 3).map((business) => (
                <DetailedBusinessCard key={business.id} business={business} />
              ))}
            </div>
          ) : (
            <div className="text-center mt-12">
              <p className="text-muted-foreground">
                No Featured Businesses Found
              </p>
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/featured"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 font-medium text-foreground transition-colors duration-200 hover:bg-muted"
            >
              View All Featured Businesses
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    );
  } catch {
    return (
      <section className="section-atmosphere border-b border-border bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
              Featured Businesses
            </h2>
            <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
              Top-rated radiator repair shops recommended by our community
            </p>
          </div>
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Unable to load featured businesses at this time
            </p>
          </div>
        </div>
      </section>
    );
  }
}

export default FeaturedBusinesses;
