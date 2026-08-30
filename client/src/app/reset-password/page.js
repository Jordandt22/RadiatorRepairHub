import React from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/Header/PageHeader";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata = {
  title: "Reset Password | RadiatorRepairHub",
  description:
    "Choose a new password for your claimed radiator repair business listing on RadiatorRepairHub.",
  robots: NOINDEX_ROBOTS,
};

export default function ResetPasswordPage() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Sign In", url: "/signin" },
    { name: "Reset password", url: "/reset-password" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle="Reset password"
        pageDescription="Choose a new password for your owner account."
        headerLink={{
          href: "/signin",
          label: "Back to sign in",
        }}
      />

      <div className="mx-auto mt-4 max-w-xl px-4 py-8 pb-12 sm:px-6 lg:px-8">
        <ResetPasswordForm />

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
