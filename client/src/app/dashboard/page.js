import React from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/Header/PageHeader";
import DirectoryDisclaimer from "@/components/content/DirectoryDisclaimer";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata = {
  title: "Business Dashboard | RadiatorRepairHub",
  description:
    "Manage your claimed radiator repair business listing on RadiatorRepairHub.",
  robots: NOINDEX_ROBOTS,
};

export default function DashboardPage() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Dashboard", url: "/dashboard" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle="Dashboard"
        pageDescription="Your business owner dashboard is coming soon."
      />

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4">
        <div className="bg-white rounded-xl shadow-lg p-8 border-t-5 border-blue-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-heading">
            Dashboard
          </h2>
          <p className="text-gray-600 mb-6">
            Listing management tools will appear here. For now you can update
            account settings or contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/settings"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Settings
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <DirectoryDisclaimer />
      </div>
    </div>
  );
}
