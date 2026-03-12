import React from "react";
import FeaturedBusinessesPage from "@/components/pages/featured/FeaturedBusinessesPage";
import BranchBoundBanner from "@/components/promo/BranchBoundBanner";

export const metadata = {
  title:
    "Featured Radiator Repair Shops | Top-Rated Auto Repair Services - RadiatorRepairHub",
  description:
    "Discover featured radiator repair shops with top ratings and reviews. Find the best auto repair services in your area with verified customer feedback and quality guarantees.",
  keywords:
    "featured radiator repair, top rated auto repair, best radiator shops, highly rated mechanics, quality radiator service",
  openGraph: {
    title:
      "Featured Radiator Repair Shops | Top-Rated Auto Repair Services - RadiatorRepairHub",
    description:
      "Discover featured radiator repair shops with top ratings and reviews. Find the best auto repair services in your area with verified customer feedback and quality guarantees.",
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
  },
  alternates: {
    canonical: "https://radiatorrepairhub.com/featured",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

async function Page() {
  // ItemList Schema for Featured Businesses
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Featured Radiator Repair Shops",
    description:
      "Top-rated radiator repair businesses and auto repair services",
    url: "https://radiatorrepairhub.com/featured",
    numberOfItems: 12,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: "Featured businesses based on ratings and reviews",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />
      <FeaturedBusinessesPage />
      <BranchBoundBanner />
    </>
  );
}

export default Page;
