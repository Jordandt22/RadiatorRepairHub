import React from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/Header/PageHeader";
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
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle="Blogs"
        pageDescription="Tips, guides, and advice for radiator repair and cooling system care."
      />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <BlogsList posts={posts} />
      </div>

      <section className="max-w-3xl mx-auto px-6 pb-12">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 font-heading">
            Have a quick question?
          </h2>
          <p className="text-gray-600 mb-4">
            Check our FAQ for answers to common radiator repair questions.
          </p>
          <Link
            href="/faq"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            View FAQ
          </Link>
        </div>
      </section>
    </div>
  );
}

export default BlogsPage;
