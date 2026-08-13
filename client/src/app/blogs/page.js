import React from "react";
import BlogsPage from "@/components/pages/blogs/BlogsPage";
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

function Page() {
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <BlogsPage posts={posts} />
    </>
  );
}

export default Page;
