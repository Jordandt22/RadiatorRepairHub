import React from "react";

// Components
import Header from "./Header";
import BusinessesGrid from "./BusinessesGrid";
import Pagination from "./Pagination";
import ErrorDisplay from "@/components/status/Errors/ErrorDisplay";

async function CategoryBusinessesPage({ primaryCategory, page }) {
  // Get Businesses
  const limit = 12;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URI}/businesses/search?page=${page}&limit=${limit}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        primary_category_id: primaryCategory.id,
        sort_option: 1,
      }),
    }
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

  const businessesData = data.data;
  const totalPages = businessesData?.totalPages;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        categoryName={primaryCategory.name}
        categorySlug={primaryCategory.slug}
      />
      <BusinessesGrid
        businesses={businessesData.businesses}
        categoryName={primaryCategory.name}
      />

      {/* Pagination */}
      {totalPages > 0 && (
        <>
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            totalBusinesses={businessesData?.totalBusinesses}
            requestTotal={businessesData?.requestTotal}
            categorySlug={primaryCategory.slug}
            limit={limit}
          />
        </>
      )}
    </div>
  );
}

export default CategoryBusinessesPage;
