import React from "react";
import StatesPage from "@/components/pages/states/StatesPage";

export const metadata = {
  title:
    "Radiator Repair by State | Find Auto Repair Services Across the US - RadiatorRepairHub",
  description:
    "Browse radiator repair services by state. Find trusted auto repair shops, mechanics, and cooling system specialists in all 50 states. Compare services and read reviews.",
  keywords:
    "radiator repair by state, auto repair by state, radiator repair USA, cooling system repair by state, automotive services by state",
  openGraph: {
    title:
      "Radiator Repair by State | Find Auto Repair Services Across the US - RadiatorRepairHub",
    description:
      "Browse radiator repair services by state. Find trusted auto repair shops, mechanics, and cooling system specialists in all 50 states. Compare services and read reviews.",
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
  },
  alternates: {
    canonical: "https://radiatorrepairhub.com/states",
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
  // ItemList Schema for States
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Radiator Repair Services by State",
    description: "Browse radiator repair services in all 50 US states",
    url: "https://radiatorrepairhub.com/states",
    numberOfItems: 50,
    itemListElement: ["CA", "TX", "NY", "FL", "WA", "IA"].map(
      (stateCode, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `Radiator Repair in ${stateCode}`,
        url: `https://radiatorrepairhub.com/state/${stateCode}`,
      })
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />
      <StatesPage />
    </>
  );
}

export default Page;
