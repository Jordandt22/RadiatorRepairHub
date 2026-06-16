import React from "react";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import PageHeader from "@/components/layout/Header/PageHeader";
import { mdxComponents } from "@/components/blogs/mdxComponents";
import { getBlogPostBySlug, getBlogSlugs } from "@/lib/blogs";

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metadata.title,
    description: post.metadata.description,
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
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle={post.metadata.title}
        pageDescription={
          formattedDate
            ? `${formattedDate}${post.metadata.author ? ` · ${post.metadata.author}` : ""}`
            : post.metadata.description
        }
        headerLink={{
          label: "View Blogs",
          href: "/blogs",
        }}
      />

      <article className="max-w-3xl mx-auto px-6 py-12">
        <MDXRemote source={post.content} components={mdxComponents} />
      </article>
    </div>
  );
}

export default BlogPostPage;
