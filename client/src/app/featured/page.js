import React from "react";
import FeaturedBusinessesPage from "@/components/pages/featured/FeaturedBusinessesPage";

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
  twitter: {
    card: "summary_large_image",
    title:
      "Featured Radiator Repair Shops | Top-Rated Auto Repair Services - RadiatorRepairHub",
    description:
      "Discover featured radiator repair shops with top ratings and reviews. Find the best auto repair services in your area with verified customer feedback and quality guarantees.",
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
  return <FeaturedBusinessesPage />;
}

export default Page;
