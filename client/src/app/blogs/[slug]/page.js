import React from "react";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import BlogArticleLayout from "@/components/blogs/BlogArticleLayout";
import { BLOG_COVER_IMAGE } from "@/components/blogs/blogConstants";
import { mdxComponents } from "@/components/blogs/mdxComponents";
import { getBlogPostBySlug, getBlogSlugs } from "@/lib/blogs";

const COVER_ABSOLUTE_URL = `https://radiatorrepairhub.com${BLOG_COVER_IMAGE}`;

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
      >
        <MDXRemote source={post.content} components={mdxComponents} />
      </BlogArticleLayout>
    </>
  );
}

export default BlogPostPage;
