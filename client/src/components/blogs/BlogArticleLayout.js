import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BreadcrumbList from "@/components/seo/BreadcrumbList";
import {
  BLOG_AUTHOR_AVATAR,
  BLOG_COVER_IMAGE,
} from "@/components/blogs/blogConstants";

function BlogArticleLayout({
  title,
  author,
  dateLabel,
  breadcrumbItems,
  children,
  relatedProductsSlot = null,
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <article className="mx-auto max-w-3xl px-6 py-10 md:py-14">
        {breadcrumbItems?.length ? (
          <BreadcrumbList items={breadcrumbItems} variant="light" />
        ) : null}

        <header className="mb-8 text-center md:mb-10">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {title}
          </h1>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <div className="flex items-center gap-3">
              <Image
                src={BLOG_AUTHOR_AVATAR}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-full border border-gray-200 bg-white object-contain p-1"
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {author || "RadiatorRepairHub"}
                </p>
                {dateLabel ? (
                  <p className="text-sm text-gray-500">{dateLabel}</p>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl border border-gray-200 bg-slate-900 shadow-sm">
          <Image
            src={BLOG_COVER_IMAGE}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        {children}

        {relatedProductsSlot}

        <footer className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View all blogs
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Find a shop
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}

export default BlogArticleLayout;
