import React from "react";
import BusinessesContainer from "@/components/businesses/BusinessesContainer";
import { notFound } from "next/navigation";
import { fetchPrimaryCategoryBySlug } from "@/lib/api/cachedReads";
import { CATEGORY_KEYWORDS } from "@/lib/seo/keywords";
import { NOINDEX_ROBOTS, INDEX_ROBOTS, SITE_URL } from "@/lib/seo/metadata";
import { getListingsPage } from "@/lib/businesses/listingsSearch";
import { SHORT_REVALIDATE_SECONDS } from "@/lib/cachePolicy";

export const revalidate = SHORT_REVALIDATE_SECONDS;

function buildCategoryUrl(slug, page) {
  const base = `${SITE_URL}/category/${slug}`;
  return page <= 1 ? base : `${base}?page=${page}`;
}

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const formattedPage = getListingsPage(resolvedSearchParams);
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
  const resolvedSearchParams = await searchParams;
  const formattedPage = getListingsPage(resolvedSearchParams);

  const { data: primaryCategory } = await fetchPrimaryCategoryBySlug(slug);
  if (!slug || !primaryCategory) {
    return notFound();
  }

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema),
        }}
      />
      <BusinessesContainer
        categoryData={primaryCategory}
        searchParams={resolvedSearchParams}
      />
    </>
  );
}

export default Page;
