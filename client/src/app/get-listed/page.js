import React from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Eye,
  Search,
  Users,
} from "lucide-react";
import ContactForm from "@/components/pages/contact/ContactForm";
import GetListedHeader from "@/components/pages/get-listed/GetListedHeader";
import DirectoryDisclaimer from "@/components/content/DirectoryDisclaimer";
import SitePhoneLinks from "@/components/contact/SitePhoneLinks";
import {
  getBusinessEmail,
  getBusinessPhoneDigits,
} from "@/lib/businessContactInfo";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";

const pageTitle =
  "Get Listed | Add Your Radiator Repair Business - RadiatorRepairHub";
const pageDescription =
  "List your radiator repair business on RadiatorRepairHub for free. Show up when customers search by city or category for cooling system repair.";

export const metadata = buildPageMetadata({
  title: pageTitle,
  description: pageDescription,
  keywords:
    "get listed, radiator repair business listing, auto repair directory, business listing, radiator repair marketing, cooling system business",
  path: "/get-listed",
});

const BENEFITS = [
  {
    icon: Users,
    title: "Reach local customers",
    description:
      "Show up for people searching for radiator repair services in your area.",
  },
  {
    icon: Eye,
    title: "Show services and contact info",
    description:
      "Put your hours, services, and contact details in one place.",
  },
  {
    icon: Search,
    title: "Appear by city and category",
    description:
      "Be found when customers search by location or repair type.",
  },
  {
    icon: BadgeCheck,
    title: "Claim and manage later",
    description:
      "After your listing is live, claim it to update photos, hours, and other business information.",
  },
];

const NEXT_STEPS = [
  "We review your submission within 2–3 business days.",
  "Once approved, your business appears in the directory.",
  "You receive an email confirmation when the listing goes live.",
];

const RELATED_LINKS = [
  {
    title: "How to claim",
    description: "Claim an existing listing and manage it with an account",
    href: "/how-to-claim",
  },
  {
    title: "FAQ",
    description: "Answers about listings, claiming, and using the directory",
    href: "/faq",
  },
  {
    title: "Contact us",
    description: "Reach the team about listing help or partnerships",
    href: "/contact",
  },
];

const Page = () => {
  const businessEmail = getBusinessEmail();
  const hasPhone = Boolean(getBusinessPhoneDigits());

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Business Listing Service",
    description: "List your radiator repair business on RadiatorRepairHub",
    provider: {
      "@id": `${SITE_URL}/#organization`,
    },
    serviceType: "Business Directory Listing",
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free business listing on RadiatorRepairHub",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />
      <div className="min-h-screen bg-background pb-24">
        <GetListedHeader />

        <div className="mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
          <section>
            <div className="mb-8 text-center">
              <h2 className="mb-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
                Why List Your Business?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Add your shop to the RadiatorRepairHub directory so local
                drivers can find you when they need cooling system repair.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {BENEFITS.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-lg border border-border bg-card p-6"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-tint">
                    <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-8 text-center">
              <h2 className="mb-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
                Submit Your Business
              </h2>
              <p className="text-lg text-muted-foreground">
                Fill out the form below to get your business listed.
              </p>
              <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
                Already in the directory?{" "}
                <Link
                  href="/how-to-claim"
                  className="font-medium text-interactive underline hover:text-primary"
                >
                  Claim your listing
                </Link>{" "}
                from the business page instead of submitting a duplicate.
              </p>
            </div>

            <ContactForm
              prefilledSubject="Business Listing Request"
              lockSubject={true}
              formTitle="Submit Your Business"
              namePlaceholder="Enter your full business name"
              nameLabel="Full Business Name"
              showSubjectInput={false}
              analyticsPage="get-listed"
              submissionKind="get-listed"
            />
          </section>

          <section className="rounded-lg border border-border bg-card p-6 md:p-8">
            <h2 className="mb-2 font-heading text-2xl font-semibold tracking-tight text-foreground">
              What Happens Next?
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Listings are currently free. Paid premium options may be available
              in the future.
            </p>
            <ol className="space-y-4">
              {NEXT_STEPS.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <p className="pt-1 leading-relaxed text-muted-foreground">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <h3 className="mb-2 font-heading text-xl font-semibold text-foreground">
                Need help?
              </h3>
              <p className="mb-6 text-muted-foreground">
                Questions about listing your business? Email or text us.
              </p>
              <div className="flex flex-col items-center gap-3">
                {businessEmail ? (
                  <a
                    href={`mailto:${businessEmail}`}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {businessEmail}
                  </a>
                ) : null}
                {hasPhone ? (
                  <SitePhoneLinks
                    showLabel={true}
                    linkClassName="text-interactive underline hover:text-primary"
                  />
                ) : null}
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Contact form
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <h3 className="mb-2 font-heading text-xl font-semibold text-foreground">
                Already listed?
              </h3>
              <p className="mb-6 text-muted-foreground">
                Claim your listing to update hours, photos, and contact details.
              </p>
              <Link
                href="/how-to-claim"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                How to claim
              </Link>
            </div>
          </section>

          <section>
            <h2 className="mb-6 font-heading text-2xl font-semibold tracking-tight text-foreground">
              Related Topics
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {RELATED_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group rounded-lg border border-border bg-background p-6 transition-colors duration-200 hover:border-interactive"
                >
                  <h3 className="mb-2 font-heading text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                    {link.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {link.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <DirectoryDisclaimer className="mb-4" />
        </div>
      </div>
    </>
  );
};

export default Page;
