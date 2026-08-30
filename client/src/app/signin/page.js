import React from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/Header/PageHeader";
import LoginForm from "@/components/auth/LoginForm";
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
    <div className="min-h-screen bg-background">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle="Business owner sign in"
        pageDescription="Sign in with the email and password from your claim to open your dashboard."
        headerLink={{
          href: "/how-to-claim",
          label: "How to claim a business",
        }}
      />

      <div className="mx-auto mt-4 max-w-xl px-4 py-8 pb-12 sm:px-6 lg:px-8">
        <LoginForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need help?{" "}
          <Link
            href="/contact"
            className="text-interactive transition-colors hover:underline"
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
