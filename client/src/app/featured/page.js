import React from "react";
import FeaturedBusinessesPage from "@/components/pages/featured/FeaturedBusinessesPage";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";

const title = "Featured Radiator Repair Shops | RadiatorRepairHub";
const description =
  "Browse Featured radiator repair shops on RadiatorRepairHub. Featured is a paid upgrade for claimed listings with a badge, search priority, extra shop photos, and a spot on this page.";

export const metadata = buildPageMetadata({
  title,
  description,
  keywords:
    "featured radiator repair, featured auto repair listing, sponsored radiator shop, radiator repair directory featured",
  path: "/featured",
});

export const revalidate = 120;

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
