import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BreadcrumbList from "@/components/seo/BreadcrumbList";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import {
  BLOG_AUTHOR_AVATAR,
  BLOG_COVER_IMAGE,
} from "@/components/blogs/blogConstants";

/** Display unit above related products on blog articles */
const BLOG_ARTICLE_DISPLAY_SLOT = "4106968175";

function BlogArticleLayout({
  title,
  author,
  dateLabel,
  breadcrumbItems,
  children,
  relatedProductsSlot = null,
}) {
  return (
    <div className="min-h-screen bg-background">
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        {breadcrumbItems?.length ? (
          <BreadcrumbList items={breadcrumbItems} variant="light" />
        ) : null}

        <header className="mb-8 text-center md:mb-10">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            {title}
          </h1>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <div className="flex items-center gap-3">
              <Image
                src={BLOG_AUTHOR_AVATAR}
                alt={author || "RadiatorRepairHub"}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full border border-border bg-card object-contain p-1"
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">
                  {author || "RadiatorRepairHub"}
                </p>
                {dateLabel ? (
                  <p className="text-sm text-muted-foreground">{dateLabel}</p>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-lg border border-border bg-muted">
          <Image
            src={BLOG_COVER_IMAGE}
            alt={title || "Blog cover"}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        {children}

        <AdSenseUnit
          slot={BLOG_ARTICLE_DISPLAY_SLOT}
          className="mt-10 min-h-[90px] overflow-hidden rounded-lg"
        />

        {relatedProductsSlot}

        <footer className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 text-sm font-medium text-interactive transition-colors hover:text-primary"
              >
                View all blogs
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm font-medium text-interactive transition-colors hover:text-primary"
              >
                Shop tools & supplies
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <Link
              href="/search?page=1&sort=featured"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
            >
              Find a shop
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}

export default BlogArticleLayout;
