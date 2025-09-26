import React from "react";
import CategoryBusinessesPage from "@/components/pages/category/CategoryBusinessesPage";
import PRIMARY_CATEGORIES from "@/lib/data/primary_categories";
import { notFound } from "next/navigation";

async function Page({ params, searchParams }) {
  const { slug } = await params;
  const { page } = await searchParams;

  // Validate slug
  const primaryCategory = PRIMARY_CATEGORIES.find(
    (c) => c.slug.toLowerCase() === slug.toLowerCase()
  );
  if (!slug || !primaryCategory) {
    return notFound();
  }

  // Validate page
  let formattedPage = 1;
  if (page && !isNaN(page) && page >= 1 && page <= 20) {
    formattedPage = parseInt(page);
  }

  return (
    <CategoryBusinessesPage
      primaryCategory={primaryCategory}
      page={formattedPage}
    />
  );
}

export default Page;
