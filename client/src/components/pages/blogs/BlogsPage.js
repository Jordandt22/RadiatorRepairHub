"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/layout/Header/PageHeader";
import BlogsList from "./BlogsList";

function BlogsPage({ posts = [] }) {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        breadcrumbItems={[
          { name: "Home", url: "/" },
          { name: "Blogs", url: "/blogs" },
        ]}
        pageTitle="Blogs"
        pageDescription="Practical guides on radiator repair, cooling system care, and finding the right shop."
        headerLink={{
          label: "Shop",
          href: "/shop",
        }}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <BlogsList posts={posts} />

        <section className="mt-14 space-y-8 border-t border-border pt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Need Tools Or Supplies?
              </h2>
              <p className="mt-1 text-muted-foreground">
                Browse coolant, caps, funnels, and diagnostic tools we recommend.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
            >
              Visit shop
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Have A Quick Question?
              </h2>
              <p className="mt-1 text-muted-foreground">
                Check our FAQ for common radiator repair answers.
              </p>
            </div>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted"
            >
              View FAQ
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default BlogsPage;
