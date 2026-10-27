import React from "react";
import Link from "next/link";
import PageHeader from "@/components/layout/Header/PageHeader";
import SiteSupportContactLines from "@/components/contact/SiteSupportContactLines";
import { PARTNER_AGREEMENT_VERSION } from "@/lib/partnerAgreement";
import {
  buildPageMetadata,
  composeDescription,
  composeTitle,
} from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: composeTitle("Partner Agreement"),
  description: composeDescription(
    "Partner listing agreement for RadiatorRepairHub Partner plans, including directory placement and website setup."
  ),
  keywords:
    "partner agreement, partner listing, radiatorrepairhub partner terms",
  path: "/partner-agreement",
});

function PartnerAgreementPage() {
  const lastUpdated = new Date(2026, 9, 27).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Partner Agreement", url: "/partner-agreement" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle="Partner Agreement"
        pageDescription={`Draft placeholder · Version ${PARTNER_AGREEMENT_VERSION} · Last updated ${lastUpdated}`}
      />

      <div className="mx-auto max-w-3xl p-6">
        <section className="mb-12 rounded-lg border border-amber-400/40 bg-amber-50 px-5 py-4 dark:border-amber-500/25 dark:bg-amber-500/10">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Draft placeholder
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            This page is a temporary placeholder. Final Partner Agreement terms
            will replace this draft. Completing Partner Checkout confirms you
            agree to the Partner Agreement version in effect at payment (currently{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {PARTNER_AGREEMENT_VERSION}
            </code>
            ). Directory Terms of Service still apply:{" "}
            <Link href="/terms" className="text-interactive underline">
              Terms of Service
            </Link>
            .
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mt-6 font-heading text-3xl font-bold">
            1. Partner listing plan
          </h2>
          <p className="mt-4 leading-relaxed text-foreground">
            Partner is an optional paid listing plan for a specific business on
            RadiatorRepairHub. It includes Featured-level directory placement
            benefits, a Partnered badge, and related Partner services described
            at checkout and in our Terms.
          </p>
          <p className="mt-4 leading-relaxed text-foreground">
            Placeholder: detailed commercial terms, service levels, and website
            deliverables will be added here.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mt-6 font-heading text-3xl font-bold">
            2. Website setup
          </h2>
          <p className="mt-4 leading-relaxed text-foreground">
            After payment, you may be asked to submit shop details through your
            RadiatorRepairHub dashboard Website tab so we can prepare a Partner
            website. Placeholder: ownership of site content, hosting, domain,
            and launch timelines will be specified in the final agreement.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mt-6 font-heading text-3xl font-bold">
            3. Billing and cancellation
          </h2>
          <p className="mt-4 leading-relaxed text-foreground">
            Partner subscriptions are billed through Stripe as described at
            checkout and in the Partner Listings and Billing section of our{" "}
            <Link href="/terms" className="text-interactive underline">
              Terms of Service
            </Link>
            . Fees are non-refundable except where required by law. Placeholder:
            any Partner-specific billing addenda will appear here.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mt-6 font-heading text-3xl font-bold">4. Contact</h2>
          <p className="mt-4 leading-relaxed text-foreground">
            Questions about this draft Partner Agreement:
          </p>
          <div className="mt-4">
            <SiteSupportContactLines />
          </div>
        </section>
      </div>
    </div>
  );
}

export default PartnerAgreementPage;
