import React from "react";
import CategoriesPage from "@/components/pages/categories/CategoriesPage";
import BranchBoundBanner from "@/components/promo/BranchBoundBanner";
import { fetchPrimaryCategories } from "@/lib/api/categories";

export const metadata = {
  title:
    "Auto Repair Categories | Find Specialized Services - RadiatorRepairHub",
  description:
    "Browse our comprehensive directory of auto repair categories. Find specialized services including radiator repair, brake service, transmission repair, and more. Connect with certified professionals in your area.",
  keywords:
    "auto repair categories, radiator repair, brake service, transmission repair, auto body shop, mechanic services, automotive repair, car maintenance",
  openGraph: {
    title:
      "Auto Repair Categories | Find Specialized Services - RadiatorRepairHub",
    description:
      "Browse our comprehensive directory of auto repair categories. Find specialized services including radiator repair, brake service, transmission repair, and more.",
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
    url: "https://radiatorrepairhub.com/categories",
    images: [
      {
        url: "https://radiatorrepairhub.com/assets/logos/logo.png",
        width: 1200,
        height: 630,
        alt: "RadiatorRepairHub - Find Trusted Auto Radiator Repair Services",
      },
    ],
  },
  alternates: {
    canonical: "https://radiatorrepairhub.com/categories",
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
  const { data: primaryCategories } = await fetchPrimaryCategories();
  const categories = primaryCategories || [];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Auto Repair Service Categories",
    description: "Browse all auto repair and radiator service categories",
    url: "https://radiatorrepairhub.com/categories",
    numberOfItems: categories.length,
    itemListElement: categories.map((category, index) => ({
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
      <CategoriesPage primaryCategories={categories} />
      <BranchBoundBanner />
    </>
  );
}

export default Page;
