import React from "react";
import FeaturedBusinessesPage from "@/components/pages/featured/FeaturedBusinessesPage";
import { buildPageMetadata, composeDescription, composeTitle, SITE_URL } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: composeTitle("Featured Radiator Repair Shops"),
  description: composeDescription(
    "Browse Featured radiator repair listings with extra visibility.",
    "Claimed shops with the Featured upgrade appear here with priority placement."
  ),
  keywords:
    "featured radiator repair, featured auto repair listing, sponsored radiator shop, radiator repair directory featured",
  path: "/featured",
});

// Must be a literal — Next.js rejects imported segment config values.
export const revalidate = 3600;

async function Page({ searchParams }) {
  const searchParamsData = await searchParams;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Featured Radiator Repair Shops",
    description:
      "Paid Featured radiator repair listings with extra visibility in the RadiatorRepairHub directory",
    url: `${SITE_URL}/featured`,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
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
      <FeaturedBusinessesPage searchParams={searchParamsData} />
    </>
  );
}

export default Page;
