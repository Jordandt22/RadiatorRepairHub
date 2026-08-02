import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BreadcrumbList from "@/components/seo/BreadcrumbList";
import BlogsList from "@/components/pages/blogs/BlogsList";
import { getAllBlogPosts } from "@/lib/blogs";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Blogs | Radiator Repair Tips & Guides - RadiatorRepairHub",
  description:
    "Read practical guides on radiator repair, cooling system maintenance, and how to find trusted shops near you.",
  keywords:
    "radiator repair tips, cooling system guides, radiator leak, car overheating, radiator flush, radiator repair cost, radiator maintenance",
  path: "/blogs",
});

function BlogsPage() {
  const allPosts = getAllBlogPosts();
  const posts = allPosts.map(({ slug, metadata }) => ({ slug, metadata }));

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "RadiatorRepairHub Blogs",
    description:
      "Practical guides on radiator repair, cooling system maintenance, and how to find trusted shops near you.",
    url: "https://radiatorrepairhub.com/blogs",
    publisher: {
      "@type": "Organization",
      name: "RadiatorRepairHub",
      url: "https://radiatorrepairhub.com",
    },
    blogPost: allPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.metadata.title,
      description: post.metadata.description,
      url: `https://radiatorrepairhub.com/blogs/${post.slug}`,
      ...(post.metadata.date && {
        datePublished: new Date(post.metadata.date).toISOString(),
      }),
      author: {
        "@type": "Organization",
        name: post.metadata.author || "RadiatorRepairHub",
      },
    })),
  };

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Blogs", url: "/blogs" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
        <BreadcrumbList items={breadcrumbItems} variant="light" />

        <header className="mb-10">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Blogs
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600">
            Practical guides on radiator repair, cooling system care, and finding
            the right shop.
          </p>
        </header>

        <BlogsList posts={posts} />

        <section className="mt-14 space-y-8 border-t border-gray-200 pt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-gray-900">
                Need Tools Or Supplies?
              </h2>
              <p className="mt-1 text-gray-600">
                Browse coolant, caps, funnels, and diagnostic tools we recommend.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Visit shop
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-gray-900">
                Have A Quick Question?
              </h2>
              <p className="mt-1 text-gray-600">
                Check our FAQ for common radiator repair answers.
              </p>
            </div>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              View FAQ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default BlogsPage;
