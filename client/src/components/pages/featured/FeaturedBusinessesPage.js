import React from "react";
import FeaturedPage from "./FeaturedPage";
import AffiliateProductsSection from "@/components/blogs/AffiliateProductsSection";
import ErrorDisplay from "@/components/status/Errors/ErrorDisplay";
import { fetchFeaturedBusinesses } from "@/lib/api/businesses";
import { fetchActiveAffiliateProductsByAliases } from "@/lib/api/affiliate-products";
import {
  FEATURED_DEFAULT_SORT,
  FEATURED_PAGE_SIZE,
  FEATURED_SORT_OPTIONS,
  parseFeaturedSearchParams,
} from "./featuredUrl";

function resolveSort(sort) {
  return FEATURED_SORT_OPTIONS.some((option) => option.value === sort)
    ? sort
    : FEATURED_DEFAULT_SORT;
}

async function FeaturedBusinessesPage({ searchParams = {} }) {
  const parsed = parseFeaturedSearchParams(searchParams);
  const sort = resolveSort(parsed.sort);

  try {
    const [{ data, error, status }, { data: affiliateData }] = await Promise.all([
      fetchFeaturedBusinesses({
        page: parsed.page,
        limit: FEATURED_PAGE_SIZE,
        sort,
        q: parsed.q,
      }),
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
    const businesses = Array.isArray(data?.businesses) ? data.businesses : [];

    return (
      <>
        <FeaturedPage
          businesses={businesses}
          total={Number(data?.total) || businesses.length}
          page={Number(data?.page) || parsed.page}
          totalPages={
            Number(data?.totalPages) ||
            Math.ceil((Number(data?.total) || businesses.length) / FEATURED_PAGE_SIZE)
          }
          sort={sort}
          q={parsed.q}
        />
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
