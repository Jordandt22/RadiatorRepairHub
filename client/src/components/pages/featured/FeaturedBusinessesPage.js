import React from "react";

// Components
import Header from "./Header";
import FeaturedGrid from "./FeaturedGrid";
import ErrorDisplay from "@/components/status/Errors/ErrorDisplay";

async function FeaturedBusinessesPage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URI}/businesses/featured`
  );
  const data = await res.json();

  if (!res.ok || data.error) {
    return (
      <ErrorDisplay
        status={res.status}
        code={data?.error?.code}
        message={data?.error?.message}
      />
    );
  }

  const businesses = data.data;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header />
      <FeaturedGrid businesses={businesses} />
    </div>
  );
}

export default FeaturedBusinessesPage;
