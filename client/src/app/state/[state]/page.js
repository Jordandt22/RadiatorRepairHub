import React from "react";
import STATES from "@/lib/data/states";

// Components
import BusinessesContainer from "@/components/businesses/BusinessesContainer";

export async function generateStaticParams() {
  const topStates = ["CA", "TX", "FL", "NY", "PA", "IL"];
  return topStates.map((state) => ({ state }));
}

// Generate metadata for state pages
export async function generateMetadata({ params }) {
  const { state } = await params;

  const stateData = STATES.find((s) => s.code === state.toUpperCase());

  if (!stateData) {
    return {
      title: "State Not Found - RadiatorRepairHub",
      description: "The requested state could not be found.",
    };
  }

  const title = `Radiator Repair Services in ${stateData.name} | Find Auto Repair Shops - RadiatorRepairHub`;
  const description = `Find trusted radiator repair services in ${stateData.name}. Browse our directory of verified auto repair shops, mechanics, and radiator specialists across ${stateData.name}. Compare services, read reviews, and connect with certified professionals.`;

  return {
    title,
    description,
    keywords: `radiator repair ${stateData.name}, auto repair ${stateData.name}, ${stateData.name} mechanics, cooling system repair ${stateData.name}, automotive services ${stateData.name}`,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      siteName: "RadiatorRepairHub",
    },
    alternates: {
      canonical: `https://radiatorrepairhub.com/state/${state}`,
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
}

async function Page({ params, searchParams }) {
  const { state } = await params;
  const searchParamsData = await searchParams;

  return <BusinessesContainer state={state} searchParams={searchParamsData} />;
}

export default Page;
