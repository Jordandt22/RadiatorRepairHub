import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BreadcrumbList from "@/components/seo/BreadcrumbList";

function PageHeader({ breadcrumbItems, pageTitle, pageDescription, headerLink }) {
  return (
    <div className="section-signature">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {breadcrumbItems && <BreadcrumbList items={breadcrumbItems} />}

        <h1 className="mb-3 font-heading text-3xl font-bold tracking-tight text-white capitalize md:text-4xl">
          {pageTitle}
        </h1>
        <p className="max-w-3xl text-base text-white/70 md:text-lg">
          {pageDescription}
        </p>
        {headerLink && (
          <Link
            href={headerLink.href}
            target={headerLink.target}
            rel={headerLink.rel}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/35 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            {headerLink.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
