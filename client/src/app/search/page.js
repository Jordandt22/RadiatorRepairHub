import React from "react";

// Components
import BusinessesContainer from "@/components/businesses/BusinessesContainer";

async function Page({ searchParams }) {
  const searchParamsData = await searchParams;

  return <BusinessesContainer searchParams={searchParamsData} />;
}

export default Page;
