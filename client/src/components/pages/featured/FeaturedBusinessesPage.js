import React from "react";

// Components
import Header from "./Header";
import FeaturedGrid from "./FeaturedGrid";
import ErrorDisplay from "@/components/status/Errors/ErrorDisplay";
import { fetchFeaturedBusinesses } from "@/lib/api/businesses";

async function FeaturedBusinessesPage() {
  try {
    const { data: businesses, error, status } = await fetchFeaturedBusinesses();

    if (error) {
      return (
        <ErrorDisplay
          status={status || 500}
          code={error?.code}
          message={error?.message || "Unable to load featured businesses."}
        />
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 pb-32">
        <Header />
        <FeaturedGrid businesses={businesses || []} />
      </div>
    );
  } catch {
    return (
      <ErrorDisplay
        status={500}
        message="Unable to load featured businesses. Please try again later."
      />
    );
  }
}

export default FeaturedBusinessesPage;
