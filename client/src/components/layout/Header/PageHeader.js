import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BreadcrumbList from "@/components/seo/BreadcrumbList";
// Components
function PageHeader({ breadcrumbItems, pageTitle, pageDescription, headerLink }) {
  return (
    <div className="bg-slate-900 border-b border-gray-200 pb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        {breadcrumbItems && <BreadcrumbList items={breadcrumbItems} />}

        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading capitalize">
          {pageTitle}
        </h1>
        <p className="text-lg text-gray-300 font-body">{pageDescription}</p>
        {headerLink && (
          <Link
            href={headerLink.href}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {headerLink.label}
            <ArrowRight className="w-4 h-4" />
          </Link>        )}
      </div>
    </div>
  );
}

export default PageHeader;
