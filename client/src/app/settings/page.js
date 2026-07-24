import React from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/Header/PageHeader";
import DirectoryDisclaimer from "@/components/content/DirectoryDisclaimer";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata = {
  title: "Account Settings | RadiatorRepairHub",
  description: "Manage your RadiatorRepairHub business owner account settings.",
  robots: NOINDEX_ROBOTS,
};

export default function SettingsPage() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Settings", url: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle="Account settings"
        pageDescription="Manage your business owner account. More settings are coming soon."
      />

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4">
        <div className="bg-white rounded-xl shadow-lg p-8 border-t-5 border-blue-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-heading">
            Settings
          </h2>
          <p className="text-gray-600 mb-6">
            Account and listing management tools will appear here. For now you
            can return to your listing or review how claiming works.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/how-to-claim"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              How to claim
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
