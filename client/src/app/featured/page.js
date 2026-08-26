import React from "react";
import FeaturedBusinessesPage from "@/components/pages/featured/FeaturedBusinessesPage";
import { buildPageMetadata } from "@/lib/seo/metadata";

const title =
  "Featured Radiator Repair Shops | RadiatorRepairHub";
const description =
  "Browse Featured radiator repair shops on RadiatorRepairHub. Featured partners get extra visibility in search and on this page.";

export const metadata = buildPageMetadata({
  title,
  description,
  keywords:
    "featured radiator repair, top rated auto repair, best radiator shops, highly rated mechanics, quality radiator service",
  path: "/featured",
});

async function Page({ searchParams }) {
  const searchParamsData = await searchParams;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Featured Radiator Repair Shops",
    description:
      "Top-rated radiator repair businesses and auto repair services",
    url: "https://radiatorrepairhub.com/featured",
    isPartOf: {
      "@id": "https://radiatorrepairhub.com/#website",
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
