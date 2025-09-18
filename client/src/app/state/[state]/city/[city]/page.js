import React from "react";

// Components
import BusinessesContainer from "@/components/businesses/BusinessesContainer";

export async function generateStaticParams() {
  const topCities = [
    { state: "CA", city: "los-angeles" },
    { state: "TX", city: "houston" },
    { state: "FL", city: "miami" },
    { state: "NY", city: "new-york-city" },
    { state: "PA", city: "philadelphia" },
    { state: "IL", city: "chicago" },
  ];
  return topCities.map((item) => ({ ...item }));
}

async function Page({ params, searchParams }) {
  const { state, city } = await params;
  const { page: pageParam, sort: sortParam } = await searchParams;

  return (
    <BusinessesContainer
      state={state}
      city={city}
      sortParam={sortParam}
      pageParam={pageParam}
    />
  );
}

export default Page;
