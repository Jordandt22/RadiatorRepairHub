import React from "react";
import StatesPage from "@/components/pages/states/StatesPage";
import AffiliateProductsSection from "@/components/blogs/AffiliateProductsSection";
import STATES from "@/lib/data/states";
import { fetchStateBusinessCounts } from "@/lib/api/location";
import { fetchActiveAffiliateProductsByAliases } from "@/lib/api/affiliate-products";
import {
  buildPageMetadata,
  composeDescription,
  composeTitle,
  SITE_URL,
} from "@/lib/seo/metadata";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: composeTitle("Radiator Repair by State"),
  description: composeDescription(
    "Browse radiator repair shops in all 50 states.",
    "Compare verified specialists by city, reviews, and opening hours near you."
  ),
  keywords:
    "radiator repair by state, radiator repair near me, auto repair by state, radiator repair USA, cooling system repair by state",
  path: "/states",
});

async function Page() {
  const [{ data: countsData }, { data: affiliateData }] = await Promise.all([
    fetchStateBusinessCounts({
      codes: STATES.map((state) => state.code),
    }),
    fetchActiveAffiliateProductsByAliases([
      "valvoline",
      "radiator-cap",
      "coolant-funnel",
    ]),
  ]);
  const countByCode = new Map(
    (countsData?.states ?? []).map((state) => [
      String(state.code).toUpperCase(),
      state.business_count ?? 0,
    ])
  );
  const statesWithCounts = STATES.map((state) => ({
    ...state,
    business_count: countByCode.get(String(state.code).toUpperCase()) ?? 0,
  }));
  const featuredProducts = affiliateData?.products ?? [];

  // ItemList Schema for States
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Radiator Repair Services by State",
    description: "Browse radiator repair services in all 50 US states",
    url: `${SITE_URL}/states`,
    numberOfItems: STATES.length,
    itemListElement: STATES.map((state, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `Radiator Repair in ${state.name}`,
      url: `https://radiatorrepairhub.com/state/${state.code}`,
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
      <StatesPage statesWithCounts={statesWithCounts} />

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
