import React from "react";

// Components
import BusinessesContainer from "@/components/businesses/BusinessesContainer";

export const metadata = {
  title: "Search Radiator Repair Services | Find Auto Repair Shops Near You - RadiatorRepairHub",
  description: "Search for radiator repair services near you. Find trusted auto repair shops, compare ratings, read reviews, and connect with certified professionals in your area.",
  keywords: "search radiator repair, find auto repair shop, radiator repair near me, auto repair directory, cooling system repair",
  openGraph: {
    title: "Search Radiator Repair Services | Find Auto Repair Shops Near You - RadiatorRepairHub",
    description: "Search for radiator repair services near you. Find trusted auto repair shops, compare ratings, read reviews, and connect with certified professionals in your area.",
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "Search Radiator Repair Services | Find Auto Repair Shops Near You - RadiatorRepairHub",
    description: "Search for radiator repair services near you. Find trusted auto repair shops, compare ratings, read reviews, and connect with certified professionals in your area.",
  },
  alternates: {
    canonical: "https://radiatorrepairhub.com/search",
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

async function Page({ searchParams }) {
  const searchParamsData = await searchParams;

  return <BusinessesContainer searchParams={searchParamsData} />;
}

export default Page;
