import React from "react";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import BlogArticleLayout from "@/components/blogs/BlogArticleLayout";
import AffiliateProductsSection from "@/components/blogs/AffiliateProductsSection";
import { BLOG_COVER_IMAGE } from "@/components/blogs/blogConstants";
import { mdxComponents } from "@/components/blogs/mdxComponents";
import { getBlogPostBySlug, getBlogSlugs } from "@/lib/blogs";
import {
  resolveAffiliateProductIds,
  splitContentAfterFirstSection,
} from "@/lib/affiliateProducts";
import { fetchActiveAffiliateProductsByIds } from "@/lib/api/affiliate-products";

const COVER_ABSOLUTE_URL = `https://radiatorrepairhub.com${BLOG_COVER_IMAGE}`;

/** Refresh product availability (is_active) without a full redeploy. */
export const revalidate = 60;

export async function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found | RadiatorRepairHub" };
  }

  return {
    title: `${post.metadata.title} | RadiatorRepairHub Blogs`,
    description: post.metadata.description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `https://radiatorrepairhub.com/blogs/${slug}`,
    },
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      type: "article",
      locale: "en_US",
      siteName: "RadiatorRepairHub",
      url: `https://radiatorrepairhub.com/blogs/${slug}`,
      images: [
        {
          url: COVER_ABSOLUTE_URL,
          width: 1200,
          height: 675,
          alt: post.metadata.title,
        },
      ],
      ...(post.metadata.date && {
        publishedTime: new Date(post.metadata.date).toISOString(),
      }),
    },
  };
}

async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = post.metadata.date
    ? new Date(post.metadata.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Blogs", url: "/blogs" },
    { name: post.metadata.title, url: `/blogs/${slug}` },
  ];

  const recommendedIds = resolveAffiliateProductIds(
    post.metadata.affiliateProducts?.recommended ?? []
  ).slice(0, 2);
  const relatedIds = resolveAffiliateProductIds(
    post.metadata.affiliateProducts?.related ?? []
  ).slice(0, 3);

  const allIds = [...new Set([...recommendedIds, ...relatedIds])];
  const { data: affiliateData } = allIds.length
    ? await fetchActiveAffiliateProductsByIds(allIds)
    : { data: { products: [] } };

  const productsById = new Map(
    (affiliateData?.products ?? []).map((product) => [product.id, product])
  );
  const recommendedProducts = recommendedIds
    .map((id) => productsById.get(id))
    .filter(Boolean);
  const relatedProducts = relatedIds
    .map((id) => productsById.get(id))
    .filter(Boolean);

  const { before, after } = splitContentAfterFirstSection(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metadata.title,
    description: post.metadata.description,
    image: COVER_ABSOLUTE_URL,
    author: {
      "@type": "Organization",
      name: post.metadata.author || "RadiatorRepairHub",
    },
    publisher: {
      "@type": "Organization",
      name: "RadiatorRepairHub",
      url: "https://radiatorrepairhub.com",
    },
    url: `https://radiatorrepairhub.com/blogs/${slug}`,
    ...(post.metadata.date && {
      datePublished: new Date(post.metadata.date).toISOString(),
      dateModified: new Date(post.metadata.date).toISOString(),
    }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://radiatorrepairhub.com/blogs/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogArticleLayout
        title={post.metadata.title}
        author={post.metadata.author}
        dateLabel={formattedDate}
        breadcrumbItems={breadcrumbItems}
        relatedProductsSlot={
          <AffiliateProductsSection
            products={relatedProducts}
            title="Helpful products for this topic"
            variant="related"
            blogSlug={slug}
          />
        }
      >
        <div className="blog-prose">
          <MDXRemote source={before} components={mdxComponents} />
        </div>
        <AffiliateProductsSection
          products={recommendedProducts}
          title="Recommended for this article"
          variant="recommended"
          blogSlug={slug}
        />
        {after ? (
          <div className="blog-prose">
            <MDXRemote source={after} components={mdxComponents} />
          </div>
        ) : null}
      </BlogArticleLayout>
    </>
  );
}

export default BlogPostPage;
