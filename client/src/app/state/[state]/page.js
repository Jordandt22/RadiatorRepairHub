import React from "react";

// Components
import BusinessesContainer from "@/components/businesses/BusinessesContainer";

export async function generateStaticParams() {
  const topStates = ["CA", "TX", "FL", "NY", "PA", "IL"];
  return topStates.map((state) => ({ state }));
}

async function Page({ params, searchParams }) {
  const { state } = await params;
  const searchParamsData = await searchParams;

  return <BusinessesContainer state={state} searchParams={searchParamsData} />;
}

export default Page;
