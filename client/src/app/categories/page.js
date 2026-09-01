import React from "react";
import CategoriesPage from "@/components/pages/categories/CategoriesPage";
import AffiliateProductsSection from "@/components/blogs/AffiliateProductsSection";
import { fetchPrimaryCategoryBusinessCounts } from "@/lib/api/categories";
import { fetchActiveAffiliateProductsByAliases } from "@/lib/api/affiliate-products";
import {
  buildPageMetadata,
  composeDescription,
  composeTitle,
} from "@/lib/seo/metadata";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: composeTitle("Auto Repair Categories Near You"),
  description: composeDescription(
    "Browse radiator repair and auto service categories.",
    "Find specialists by service type, then compare shops near you by city and rating."
  ),
  keywords:
    "auto repair categories, radiator repair, brake service, transmission repair, auto body shop, mechanic services, automotive repair, car maintenance",
  path: "/categories",
});

async function Page() {
  const [{ data: countsData }, { data: affiliateData }] = await Promise.all([
    fetchPrimaryCategoryBusinessCounts(),
    fetchActiveAffiliateProductsByAliases([
      "valvoline",
      "radiator-cap",
      "coolant-funnel",
    ]),
  ]);

  const categoriesWithCounts = countsData?.categories ?? [];
  const featuredProducts = affiliateData?.products ?? [];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Auto Repair Service Categories",
    description: "Browse all auto repair and radiator service categories",
    url: "https://radiatorrepairhub.com/categories",
    numberOfItems: categoriesWithCounts.length,
    itemListElement: categoriesWithCounts.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: category.name,
      url: `https://radiatorrepairhub.com/category/${category.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />
      <CategoriesPage categoriesWithCounts={categoriesWithCounts} />

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
}

export default Page;
