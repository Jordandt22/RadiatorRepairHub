import React from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/Header/PageHeader";
import LoginForm from "@/components/auth/LoginForm";
import DirectoryDisclaimer from "@/components/content/DirectoryDisclaimer";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata = {
  title: "Business Owner Sign In | RadiatorRepairHub",
  description:
    "Sign in to manage your claimed radiator repair business listing on RadiatorRepairHub.",
  robots: NOINDEX_ROBOTS,
};

export default function SignInPage() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Sign In", url: "/signin" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle="Business owner sign in"
        pageDescription="Sign in with the email and password from your claim to open your business page."
        headerLink={{
          href: "/how-to-claim",
          label: "How to claim a business",
        }}
      />

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4">
        <LoginForm />

        <p className="mt-6 text-center text-sm text-gray-500">
          Need help?{" "}
          <Link href="/contact" className="text-blue-600 hover:underline">
            Contact support
          </Link>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <DirectoryDisclaimer />
      </div>
    </div>
  );
}
