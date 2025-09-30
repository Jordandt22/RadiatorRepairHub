import React from "react";
import BreadcrumbList from "@/components/seo/BreadcrumbList";

// Components
function PageHeader({ breadcrumbItems, pageTitle, pageDescription }) {
  return (
    <div className="bg-slate-900 border-b border-gray-200 pb-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        {breadcrumbItems && <BreadcrumbList items={breadcrumbItems} />}

        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">
          {pageTitle}
        </h1>
        <p className="text-lg text-gray-300 font-body">{pageDescription}</p>
      </div>
    </div>
  );
}

export default PageHeader;
