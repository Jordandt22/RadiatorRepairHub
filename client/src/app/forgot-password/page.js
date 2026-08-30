import React from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/Header/PageHeader";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata = {
  title: "Forgot Password | RadiatorRepairHub",
  description:
    "Reset the password for your claimed radiator repair business listing on RadiatorRepairHub.",
  robots: NOINDEX_ROBOTS,
};

export default function ForgotPasswordPage() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Sign In", url: "/signin" },
    { name: "Forgot password", url: "/forgot-password" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle="Forgot password"
        pageDescription="Enter your owner email to receive a password reset link."
        headerLink={{
          href: "/signin",
          label: "Back to sign in",
        }}
      />

      <div className="mx-auto mt-4 max-w-xl px-4 py-8 pb-12 sm:px-6 lg:px-8">
        <ForgotPasswordForm />

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
