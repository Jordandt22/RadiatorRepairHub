import React from "react";
import CategoriesPage from "@/components/pages/categories/CategoriesPage";

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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

async function Page() {
  // ItemList Schema for Categories
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Auto Repair Service Categories",
    description: "Browse all auto repair and radiator service categories",
    url: "https://radiatorrepairhub.com/categories",
    numberOfItems: PRIMARY_CATEGORIES.length,
    itemListElement: PRIMARY_CATEGORIES.slice(0, 10).map((category, index) => ({
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
      <CategoriesPage />
    </>
  );
}

export default Page;
