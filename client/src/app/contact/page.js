import React from "react";
import Link from "next/link";
import {
  Clock,
  Mail,
  Phone,
  Search,
  Store,
} from "lucide-react";
import ContactForm from "@/components/pages/contact/ContactForm";
import ContactHeader from "@/components/pages/contact/ContactHeader";
import DirectoryDisclaimer from "@/components/content/DirectoryDisclaimer";
import SitePhoneLinks from "@/components/contact/SitePhoneLinks";
import {
  getBusinessEmail,
  getBusinessPhoneDigits,
} from "@/lib/businessContactInfo";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";

const pageTitle = "Contact RadiatorRepairHub | Directory Support & Feedback";
const pageDescription =
  "Contact the RadiatorRepairHub team about the directory, listings, partnerships, or website feedback. To reach a repair shop, use Quick Contact on that business's page.";

export const metadata = buildPageMetadata({
  title: pageTitle,
  description: pageDescription,
  keywords:
    "contact radiator repair hub, directory support, listing help, website feedback, radiator repair hub contact",
  path: "/contact",
});

const Page = () => {
  const businessEmail = getBusinessEmail();
  const hasPhone = Boolean(getBusinessPhoneDigits());

  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact RadiatorRepairHub",
    description:
      "Contact the RadiatorRepairHub team for directory support, listing help, and partnerships. Use Quick Contact on a business page to reach a repair shop.",
    url: `${SITE_URL}/contact`,
    mainEntity: {
      "@id": `${SITE_URL}/#organization`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactPageSchema),
        }}
      />
      <div className="min-h-screen bg-background pb-24">
        <ContactHeader />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 rounded-lg border border-primary/20 bg-tint p-5 md:p-6">
            <h2 className="mb-2 font-heading text-lg font-semibold text-foreground">
              Looking to contact a repair shop?
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              This form reaches the RadiatorRepairHub team only. We cannot
              forward repair requests or schedule appointments. To message a
              shop, open their listing and use{" "}
              <strong className="text-foreground">Quick Contact</strong>, or
              call the number listed there.
            </p>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/search?page=1&sort=most_reviews"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Find a shop
              </Link>
              <Link
                href="/featured"
                className="inline-flex items-center gap-2 text-sm font-medium text-interactive transition-colors hover:text-primary"
              >
                <Store className="h-4 w-4" aria-hidden="true" />
                Featured businesses
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-stretch">
            <div className="flex lg:col-span-2">
              <ContactForm
                className="h-full w-full"
                formTitle="Message RadiatorRepairHub"
                messagePlaceholder="Tell us about your directory question, listing issue, partnership idea, or website feedback..."
                analyticsPage="contact"
                submissionKind="contact"
              />
            </div>

            <div className="flex lg:col-span-1">
              <aside className="flex h-full w-full flex-col rounded-lg border border-border bg-card p-8">
                <h2 className="mb-6 font-heading text-2xl font-semibold tracking-tight text-foreground">
                  Reach the Team
                </h2>

                <div className="flex-1 space-y-6">
                  {businessEmail ? (
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tint">
                        <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-foreground">
                          Email
                        </h3>
                        <p className="mb-2 text-sm text-muted-foreground">
                          Submit the form or email us directly.
                        </p>
                        <a
                          href={`mailto:${businessEmail}`}
                          className="break-all text-sm font-medium text-interactive transition-colors hover:text-primary"
                        >
                          {businessEmail}
                        </a>
                      </div>
                    </div>
                  ) : null}

                  {hasPhone ? (
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tint">
                        <Phone className="h-6 w-6 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-semibold text-foreground">
                          Call or text
                        </h3>
                        <p className="mb-2 text-sm text-muted-foreground">
                          Directory support only, not a repair shop line.
                        </p>
                        <SitePhoneLinks
                          showLabel={false}
                          linkClassName="text-sm font-medium text-interactive transition-colors hover:text-primary"
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tint">
                      <Clock className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-foreground">
                        Response time
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        We typically respond within 24 hours on business days.
                        We can help with directory questions, listing details,
                        website bugs, advertising, and partnerships.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3 border-t border-border pt-6">
                  <p className="text-sm text-muted-foreground">
                    Own a shop? Get listed for free, or claim an existing
                    listing.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/get-listed"
                      className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Get listed
                    </Link>
                    <Link
                      href="/how-to-claim"
                      className="inline-flex w-full items-center justify-center rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      How to claim
                    </Link>
                  </div>
                  <p className="pt-2 text-xs text-muted-foreground">
                    See our{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-interactive underline hover:text-primary"
                    >
                      Privacy Policy
                    </Link>{" "}
                    for how we handle form submissions.
                  </p>
                </div>
              </aside>
            </div>
          </div>

          <DirectoryDisclaimer className="mt-12" />
        </div>
      </div>
    </>
  );
};

export default Page;
