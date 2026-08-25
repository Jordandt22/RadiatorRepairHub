import React from "react";
import FeaturedPage from "./FeaturedPage";
import AffiliateProductsSection from "@/components/blogs/AffiliateProductsSection";
import ErrorDisplay from "@/components/status/Errors/ErrorDisplay";
import { fetchFeaturedBusinesses } from "@/lib/api/businesses";
import { fetchActiveAffiliateProductsByAliases } from "@/lib/api/affiliate-products";

async function FeaturedBusinessesPage() {
  try {
    const [{ data: businesses, error, status }, { data: affiliateData }] =
      await Promise.all([
        fetchFeaturedBusinesses(),
        fetchActiveAffiliateProductsByAliases([
          "valvoline",
          "radiator-cap",
          "coolant-funnel",
        ]),
      ]);

    if (error) {
      return (
        <ErrorDisplay
          status={status || 500}
          code={error?.code}
          message={error?.message || "Unable to load featured businesses."}
        />
      );
    }

    const featuredProducts = affiliateData?.products ?? [];

    return (
      <>
        <FeaturedPage businesses={businesses || []} />
        {featuredProducts.length > 0 ? (
          <section className="border-t border-border bg-card py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <AffiliateProductsSection
                products={featuredProducts}
                title="Tools & Supplies"
                description="Coolant, radiator caps, and spill-proof funnels for common cooling system maintenance."
                variant="showcase"
              />
            </div>
          </section>
        ) : null}
      </>
    );
  } catch {
    return (
      <ErrorDisplay
        status={500}
        message="Unable to load featured businesses. Please try again later."
      />
    );
  }
}

export default FeaturedBusinessesPage;
