import React from "react";

import ErrorDisplay from "@/components/status/Errors/ErrorDisplay";
import FeaturedBusinessesContent from "@/components/pages/home/FeaturedBusinessesContent";
import { fetchFeaturedBusinesses } from "@/lib/api/businesses";

async function FeaturedBusinesses() {
  try {
    const { data: businesses, error, status } = await fetchFeaturedBusinesses();

    if (error) {
      return (
        <ErrorDisplay
          status={status || 500}
          code={error?.code}
          message={error?.message}
          link={{
            path: "/featured",
            text: "Go to featured businesses page",
          }}
        />
      );
    }

    return <FeaturedBusinessesContent businesses={businesses || []} />;
  } catch {
    return <FeaturedBusinessesContent businesses={[]} />;
  }
}

export default FeaturedBusinesses;
