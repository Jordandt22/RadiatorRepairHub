import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BreadcrumbList from "@/components/seo/BreadcrumbList";
// Components
function PageHeader({ breadcrumbItems, pageTitle, pageDescription, headerLink }) {
  return (
    <div className="bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb Navigation */}
        {breadcrumbItems && <BreadcrumbList items={breadcrumbItems} />}

        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3 font-heading capitalize">
          {pageTitle}
        </h1>
        <p className="text-lg text-white/80 max-w-3xl">{pageDescription}</p>
        {headerLink && (
          <Link
            href={headerLink.href}
            target={headerLink.target}
            rel={headerLink.rel}
            className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-white text-primary text-sm font-medium rounded-lg hover:bg-tint transition-colors"
          >
            {headerLink.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
