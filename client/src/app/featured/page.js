import React from "react";
import FeaturedBusinessesPage from "@/components/pages/featured/FeaturedBusinessesPage";
import BranchBoundBanner from "@/components/promo/BranchBoundBanner";
import { buildPageMetadata } from "@/lib/seo/metadata";

const title =
  "Featured Radiator Repair Shops | Top-Rated Auto Repair Services - RadiatorRepairHub";
const description =
  "Discover featured radiator repair shops with top ratings and reviews. Find the best auto repair services in your area with verified customer feedback and quality guarantees.";

export const metadata = buildPageMetadata({
  title,
  description,
  keywords:
    "featured radiator repair, top rated auto repair, best radiator shops, highly rated mechanics, quality radiator service",
  path: "/featured",
});

async function Page() {
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
      <FeaturedBusinessesPage />
      <BranchBoundBanner />
    </>
  );
}

export default Page;
