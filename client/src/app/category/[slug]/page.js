import React from "react";
import CategoryBusinessesPage from "@/components/pages/category/CategoryBusinessesPage";
import PRIMARY_CATEGORIES from "@/lib/data/primary_categories";
import { notFound } from "next/navigation";

// Generate metadata for category pages
export async function generateMetadata({ params }) {
  const { slug } = await params;

  const primaryCategory = PRIMARY_CATEGORIES.find(
    (c) => c.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!primaryCategory) {
    return {
      title: "Category Not Found - RadiatorRepairHub",
      description: "The requested category could not be found.",
    };
  }

  const title = `${primaryCategory.name} Services | Find ${primaryCategory.name} Near You - RadiatorRepairHub`;
  const description = `Find trusted ${primaryCategory.name.toLowerCase()} services near you. Browse our directory of verified ${primaryCategory.name.toLowerCase()} businesses across the U.S. Compare services, read reviews, and connect with certified professionals.`;

  return {
    title,
    description,
    keywords: `${
      primaryCategory.name
    }, ${primaryCategory.name.toLowerCase()} services, auto repair, automotive services, radiator repair, cooling system repair, car maintenance`,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      siteName: "RadiatorRepairHub",
    },
    alternates: {
      canonical: `https://radiatorrepairhub.com/category/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

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
