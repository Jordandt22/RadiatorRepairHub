import React from "react";
import CategoryBusinessesPage from "@/components/pages/category/CategoryBusinessesPage";
import BranchBoundBanner from "@/components/promo/BranchBoundBanner";
import ErrorDisplay from "@/components/status/Errors/ErrorDisplay";
import { notFound } from "next/navigation";
import { fetchPrimaryCategoryBySlug } from "@/lib/api/categories";
import { fetchBusinessesByCategory } from "@/lib/api/businesses";
import { CATEGORY_KEYWORDS } from "@/lib/seo/keywords";
import { NOINDEX_ROBOTS, INDEX_ROBOTS, SITE_URL } from "@/lib/seo/metadata";

function parsePageParam(pageParam) {
  if (!pageParam || isNaN(pageParam)) return 1;
  const page = parseInt(pageParam, 10);
  if (page < 1 || page > 20) return 1;
  return page;
}

function buildCategoryUrl(slug, page) {
  const base = `${SITE_URL}/category/${slug}`;
  return page <= 1 ? base : `${base}?page=${page}`;
}

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const formattedPage = parsePageParam(pageParam);
  const { data: primaryCategory } = await fetchPrimaryCategoryBySlug(slug);

  if (!primaryCategory) {
    return {
      title: "Category Not Found - RadiatorRepairHub",
      description: "The requested category could not be found.",
      robots: NOINDEX_ROBOTS,
    };
  }

  const title =
    formattedPage > 1
      ? `${primaryCategory.name} Services (Page ${formattedPage}) | RadiatorRepairHub`
      : `${primaryCategory.name} Services | Find ${primaryCategory.name} Near You - RadiatorRepairHub`;
  const description = `Find trusted ${primaryCategory.name.toLowerCase()} services near you. Browse our directory of verified ${primaryCategory.name.toLowerCase()} businesses across the U.S. Compare services, read reviews, and connect with certified professionals.`;

  const defaultKeywords = `${primaryCategory.name}, ${primaryCategory.name.toLowerCase()} services, auto repair, automotive services, radiator repair, cooling system repair, car maintenance`;
  const keywords =
    CATEGORY_KEYWORDS[slug.toLowerCase()] ?? defaultKeywords;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      siteName: "RadiatorRepairHub",
      url: buildCategoryUrl(slug, formattedPage),
    },
    alternates: {
      canonical: buildCategoryUrl(slug, formattedPage),
    },
    robots: INDEX_ROBOTS,
  };
}

async function Page({ params, searchParams }) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const formattedPage = parsePageParam(pageParam);

  const { data: primaryCategory } = await fetchPrimaryCategoryBySlug(slug);
  if (!slug || !primaryCategory) {
    return notFound();
  }

  let businessesData = null;

  try {
    const result = await fetchBusinessesByCategory(
      primaryCategory.id,
      formattedPage
    );

    if (result.error) {
      return (
        <ErrorDisplay
          status={result.status || 500}
          code={result.error?.code}
          message={result.error?.message || "Unable to load businesses."}
        />
      );
    }

    businessesData = result.data;
  } catch {
    return (
      <ErrorDisplay
        status={500}
        message="Unable to load businesses. Please try again later."
      />
    );
  }

  const totalPages = businessesData?.totalPages ?? 0;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${primaryCategory.name} Services`,
    description: `Browse ${primaryCategory.name.toLowerCase()} businesses and services`,
    url: buildCategoryUrl(slug, formattedPage),
    isPartOf: {
      "@id": "https://radiatorrepairhub.com/#website",
    },
    about: {
      "@type": "Service",
      serviceType: primaryCategory.name,
      provider: {
        "@type": "Organization",
        name: "RadiatorRepairHub",
      },
    },
  };

  return (
    <>
      {formattedPage > 1 && (
        <link
          rel="prev"
          href={buildCategoryUrl(slug, formattedPage - 1)}
        />
      )}
      {formattedPage < totalPages && (
        <link
          rel="next"
          href={buildCategoryUrl(slug, formattedPage + 1)}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema),
        }}
      />
      <CategoryBusinessesPage
        primaryCategory={primaryCategory}
        page={formattedPage}
        businessesData={businessesData}
      />
      <BranchBoundBanner />
    </>
  );
}

export default Page;
