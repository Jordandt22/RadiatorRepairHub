import React from "react";
import Link from "next/link";

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
      <section className="py-16 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-3 font-heading">
              Featured Businesses
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
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
              className="inline-flex items-center border border-border text-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-muted transition-colors duration-200"
            >
              View All Featured Businesses
            </Link>
          </div>
        </div>
      </section>
    );
  } catch {
    return (
      <section className="py-16 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-3 font-heading">
              Featured Businesses
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Top-rated radiator repair shops recommended by our community
            </p>
          </div>
          <div className="text-center mt-12">
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
