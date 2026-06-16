import React from "react";
import StatesPage from "@/components/pages/states/StatesPage";
import BranchBoundBanner from "@/components/promo/BranchBoundBanner";
import STATES from "@/lib/data/states";

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
    url: "https://radiatorrepairhub.com/states",
    images: [
      {
        url: "https://radiatorrepairhub.com/assets/logos/logo.png",
        width: 1200,
        height: 630,
        alt: "RadiatorRepairHub - Find Trusted Auto Radiator Repair Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Radiator Repair by State | Find Auto Repair Services Across the US - RadiatorRepairHub",
    description:
      "Browse radiator repair services by state across all 50 states.",
    images: ["https://radiatorrepairhub.com/assets/logos/logo.png"],
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
    numberOfItems: STATES.length,
    itemListElement: STATES.map((state, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `Radiator Repair in ${state.name}`,
      url: `https://radiatorrepairhub.com/state/${state.code}`,
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
      <StatesPage />
      <BranchBoundBanner />
    </>
  );
}

export default Page;
