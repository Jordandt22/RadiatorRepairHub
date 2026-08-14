import React from "react";
import FeaturedPage from "./FeaturedPage";
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

    return <FeaturedPage businesses={businesses || []} />;
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
