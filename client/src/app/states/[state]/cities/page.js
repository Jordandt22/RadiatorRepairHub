import React from "react";
import { notFound } from "next/navigation";
import CitiesPage from "@/components/pages/cities/CitiesPage";
import AffiliateProductsSection from "@/components/blogs/AffiliateProductsSection";

// Data
import STATES from "@/lib/data/states";
import { fetchCitiesByStateId, fetchCityBusinessCounts } from "@/lib/api/location";
import { fetchActiveAffiliateProductsByAliases } from "@/lib/api/affiliate-products";
import {
  composeDescription,
  composeTitle,
  NOINDEX_ROBOTS,
  INDEX_ROBOTS,
} from "@/lib/seo/metadata";

export const revalidate = 120;

// Generate metadata for cities page
export async function generateMetadata({ params }) {
  const { state } = await params;
  const stateCode = state.toUpperCase();

  const stateData = STATES.find((s) => s.code === stateCode);

  if (!stateData) {
    return {
      title: "Cities Not Found | RadiatorRepairHub",
      description: "The requested state cities could not be found.",
      robots: NOINDEX_ROBOTS,
    };
  }

  const title = composeTitle(`Radiator Repair in ${stateData.name} by City`);
  const description = composeDescription(
    `Browse every ${stateData.name} city with radiator repair shops near you.`,
    "Pick your city to compare cooling system specialists, reviews, and hours."
  );

  return {
    title,
    description,
    keywords: `radiator repair ${stateData.name} cities, radiator repair near me, radiator repair by city, auto repair ${stateData.name}`,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      siteName: "RadiatorRepairHub",
    },
    alternates: {
      canonical: `https://radiatorrepairhub.com/states/${stateCode}/cities`,
    },
    robots: INDEX_ROBOTS,
  };
}

async function Page({ params }) {
  const { state } = await params;
  const stateCode = state.toUpperCase();

  const stateData = STATES.find((s) => s.code === stateCode);
  if (!stateData) {
    return notFound();
  }

  const [{ data: stateCities }, { data: countsData }, { data: affiliateData }] =
    await Promise.all([
      fetchCitiesByStateId(stateData.id),
      fetchCityBusinessCounts(stateData.id),
      fetchActiveAffiliateProductsByAliases([
        "valvoline",
        "radiator-cap",
        "coolant-funnel",
      ]),
    ]);
  const countById = new Map(
    (countsData?.cities ?? []).map((city) => [city.id, city.business_count ?? 0])
  );
  const sortedCities = [...(stateCities || [])]
    .map((city) => ({
      ...city,
      business_count: countById.get(city.id) ?? city.business_count ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const featuredProducts = affiliateData?.products ?? [];

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Cities in ${stateData.name}`,
    description: `Browse all cities in ${stateData.name} with radiator repair services`,
    url: `https://radiatorrepairhub.com/states/${stateCode}/cities`,
    isPartOf: {
      "@id": "https://radiatorrepairhub.com/#website",
    },
    about: {
      "@type": "Service",
      serviceType: "Radiator Repair",
      areaServed: {
        "@type": "State",
        name: stateData.name,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema),
        }}
      />
      <CitiesPage stateData={stateData} stateCities={sortedCities} />

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
