import React from "react";
import { notFound } from "next/navigation";
import CitiesPage from "@/components/pages/cities/CitiesPage";

// Data
import STATES from "@/lib/data/states";
import CITIES from "@/lib/data/cities";

async function Page({ params }) {
  const { state } = await params;

  // Find the state data
  const stateData = STATES.find((s) => s.code === state);
  if (!stateData) {
    return notFound();
  }

  // Filter cities by state
  const stateCities = CITIES.filter((city) => city.state_id === stateData.id);

  // Sort cities alphabetically
  stateCities.sort((a, b) => a.name.localeCompare(b.name));

  return <CitiesPage stateData={stateData} stateCities={stateCities} />;
}

export default Page;
