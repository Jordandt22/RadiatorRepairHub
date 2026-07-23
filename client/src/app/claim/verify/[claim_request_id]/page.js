import React from "react";
import Link from "next/link";
import { fetchClaimRequest } from "@/lib/api/businesses";
import ClaimVerifyForm from "@/components/claim/ClaimVerifyForm";
import PageHeader from "@/components/layout/Header/PageHeader";
import ErrorDisplay from "@/components/status/Errors/ErrorDisplay";
import DirectoryDisclaimer from "@/components/content/DirectoryDisclaimer";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata = {
  title: "Verify Business Claim | RadiatorRepairHub",
  description:
    "Enter your verification code and create an account to claim your business on RadiatorRepairHub.",
  robots: NOINDEX_ROBOTS,
};

export default async function ClaimVerifyPage({ params }) {
  const { claim_request_id } = await params;
  const { data, error, status } = await fetchClaimRequest(claim_request_id);

  if (error || !data?.business) {
    const slug = error?.slug || data?.slug || null;
    const businessPath = slug ? `/business/${slug}` : "/";

    return (
      <ErrorDisplay
        status={String(status || 404)}
        code={error?.code || "route-not-found"}
        message={
          typeof error?.message === "string"
            ? error.message
            : "This claim request could not be found or is no longer available."
        }
        link={{
          path: businessPath,
          text: slug ? "Back to business page" : "Go Back to Home Page",
        }}
      />
    );
  }

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Claim Business", url: `/claim/verify/${claim_request_id}` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle="Claim your business"
        pageDescription={`Finish verifying ownership of ${data.business.title} and create your account.`}
        headerLink={{
          href: `/business/${data.business.slug}`,
          label: "View business page",
        }}
      />

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4">
        <ClaimVerifyForm
          claimRequestId={data.claimRequestId}
          business={data.business}
        />

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
