import React from "react";

// Components
import Header from "./Header";
import BusinessesGrid from "./BusinessesGrid";
import Pagination from "./Pagination";

async function CategoryBusinessesPage({
  primaryCategory,
  page,
  businessesData,
}) {
  const limit = 12;
  const totalPages = businessesData?.totalPages ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        categoryName={primaryCategory.name}
        categorySlug={primaryCategory.slug}
      />
      <BusinessesGrid
        businesses={businessesData?.businesses || []}
        categoryName={primaryCategory.name}
      />

      {totalPages > 0 && (
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          totalBusinesses={businessesData?.totalBusinesses}
          requestTotal={businessesData?.requestTotal}
          categorySlug={primaryCategory.slug}
          limit={limit}
        />
      )}
    </div>
  );
}

export default CategoryBusinessesPage;
