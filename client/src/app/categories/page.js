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
  twitter: {
    card: "summary_large_image",
    title:
      "Auto Repair Categories | Find Specialized Services - RadiatorRepairHub",
    description:
      "Browse our comprehensive directory of auto repair categories. Find specialized services including radiator repair, brake service, transmission repair, and more.",
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
  maximumScale: 1,
};

async function Page() {
  return <CategoriesPage />;
}

export default Page;
