import React from "react";
import Link from "next/link";
import { BadgeCheck, Clock3, Flag, ImageIcon, Search } from "lucide-react";
import PageHeader from "@/components/layout/Header/PageHeader";
import FAQSection from "@/components/seo/FAQSection";
import DirectoryDisclaimer from "@/components/content/DirectoryDisclaimer";
import SitePhoneLinks from "@/components/contact/SitePhoneLinks";
import { getBusinessEmail, getBusinessPhoneDigits } from "@/lib/businessContactInfo";
import { buildPageMetadata } from "@/lib/seo/metadata";

const pageTitle = "How to Claim Your Business | RadiatorRepairHub";
const pageDescription =
  "Claim eligibility, email verification steps, what claiming lets you edit, and answers to common claiming questions.";

export const metadata = buildPageMetadata({
  title: pageTitle,
  description: pageDescription,
  path: "/how-to-claim",
});

const BENEFITS = [
  {
    title: "Update How Your Listing Looks",
    description:
      "Add or edit your About section, service categories, and photos so customers see current information.",
    icon: ImageIcon,
  },
  {
    title: "Keep Contact Details Accurate",
    description:
      "Update phone and email so customers can reach you, and inquiries go to the right place.",
    icon: BadgeCheck,
  },
  {
    title: "Set Accurate Hours",
    description:
      "Show when you are open so people know when to call or stop by.",
    icon: Clock3,
  },
  {
    title: "Verified Badge and Priority Placement",
    description:
      "Claimed businesses get a verified badge and are prioritized in the featured section and search results.",
    icon: Search,
  },
];

const CLAIM_STEPS = [
  "Open your business listing on RadiatorRepairHub.",
  "Click Claim on the listing.",
  "A verification code will be sent to that business's email.",
  "Open the verification link sent in that same email.",
  "Enter the code and create a password for your new account.",
  "Congrats, you've successfully claimed your listing!",
];

function buildClaimFaqs(supportEmail) {
  return [
    {
      question: "What if I don't receive the code?",
      answer:
        "Check your spam or junk folder first. On the claim verification page, use Resend code to send a new verification email to the address on file for your listing.",
    },
    {
      question: "What if the email or phone on my listing is wrong?",
      answer:
        "If incorrect or missing contact info is blocking your claim, open your business listing and use the Report Info button under Contact Information. Choose the option for wrong claim contact info, tell us the correct details, and we'll review it so you can try claiming again.",
    },
    {
      question: "Why does the listing say the email is being reviewed?",
      answer:
        "We sometimes pause claiming and Quick Contact while we confirm the listing email is correct. Use Report Info on the business page if the contact is wrong, and we'll review it so you can try claiming again.",
    },
    {
      question: "What if other listing details are wrong?",
      answer:
        "Use the same Report Info button on the business page to report outdated or incorrect listing content, or reach us through the contact page and choose Report a Listing Problem.",
    },
    {
      question: "What if someone else already claimed my business by mistake?",
      answer: supportEmail
        ? `Contact RadiatorRepairHub support right away at ${supportEmail}, by text, or through the contact page. We'll help verify ownership and resolve mistaken claims.`
        : "Contact RadiatorRepairHub support right away by text or through the contact page. We'll help verify ownership and resolve mistaken claims.",
    },
    {
      question: "Is claiming free?",
      answer:
        "Yes. Claiming your business listing on RadiatorRepairHub is free.",
    },
  ];
}

export default function HowToClaimPage() {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "How to Claim", url: "/how-to-claim" },
  ];

  const supportEmail = getBusinessEmail();
  const hasPhone = Boolean(getBusinessPhoneDigits());
  const faqs = buildClaimFaqs(supportEmail);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle="How to claim your business"
        pageDescription="Check eligibility, follow the email claim steps, and see what you can edit after claiming."
        headerLink={{
          href: "/search?page=1&sort=most_reviews",
          label: "Search for your listing",
        }}
      />

      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-border bg-card p-6 md:p-8">
          <h2 className="mb-4 font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Claim Eligibility
          </h2>
          <p className="mb-6 leading-relaxed text-muted-foreground">
            A listing is claimable when it has a unique email on file that is
            not shared with other businesses in our directory. We send a
            verification code to that email to confirm you control the listing
            contact.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted p-4">
              <h3 className="mb-1 font-semibold text-foreground">
                Unclaimable: No Email
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                There is no contact email on file for the listing, so email
                verification cannot run yet.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted p-4">
              <h3 className="mb-1 font-semibold text-foreground">
                Unclaimable: Shared Email
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A shared or corporate inbox is used by more than one listing.
                Self-serve email claim is disabled so one account cannot lock
                that inbox for every location.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted p-4">
              <h3 className="mb-1 font-semibold text-foreground">
                Unclaimable: Email Being Reviewed
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Claiming is paused while we confirm the listing email is
                correct. Use Report Info on the business page if the contact is
                wrong.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-primary/20 bg-tint p-4">
            <div className="flex gap-3">
              <Flag
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <h3 className="mb-1 font-semibold text-foreground">
                  Wrong or outdated contact info?
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  If a missing or incorrect email is preventing you from
                  claiming, open your listing and use the{" "}
                  <strong className="text-foreground">Report Info</strong>{" "}
                  button under Contact Information. Choose the option for wrong
                  claim contact info, share the correct phone and/or email if
                  you have them, and we&apos;ll review the report so you can
                  complete the claim once it&apos;s fixed.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Not in the directory yet?{" "}
            <Link
              href="/get-listed"
              className="font-medium text-interactive underline hover:text-primary"
            >
              Get listed
            </Link>{" "}
            instead of claiming.
          </p>
        </section>

        <section className="rounded-lg border border-border bg-card p-6 md:p-8">
          <h2 className="mb-4 font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            How to Claim (Step-by-Step)
          </h2>
          <ol className="space-y-4">
            {CLAIM_STEPS.map((step, index) => (
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
          <p className="mt-6 text-sm text-muted-foreground">
            Coming soon: phone verification, and claiming when multiple
            businesses share the same email.
          </p>
        </section>

        <section>
          <h2 className="mb-6 font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Benefits of Claiming
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {BENEFITS.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-lg border border-border bg-card p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-tint">
                  <Icon className="size-6 text-primary" aria-hidden="true" />
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

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h3 className="mb-2 font-heading text-xl font-semibold text-foreground">
              Already claimed?
            </h3>
            <p className="mb-6 text-muted-foreground">
              Sign in to open your business listing.
            </p>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
            >
              Sign in
            </Link>
          </div>
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h3 className="mb-2 font-heading text-xl font-semibold text-foreground">
              Need help?
            </h3>
            <p className="mb-6 text-muted-foreground">
              Reach our team
              {supportEmail ? (
                <>
                  {" "}
                  at{" "}
                  <a
                    href={`mailto:${supportEmail}`}
                    className="text-interactive underline hover:text-primary"
                  >
                    {supportEmail}
                  </a>
                </>
              ) : null}
              {hasPhone ? (
                <>
                  {supportEmail ? ", " : " "}
                  by text (
                  <SitePhoneLinks
                    className="inline"
                    showLabel={false}
                    linkClassName="text-interactive underline hover:text-primary"
                  />
                  ),
                </>
              ) : null}{" "}
              or use the contact form.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors duration-200 hover:bg-muted"
            >
              Contact support
            </Link>
          </div>
        </section>
      </div>

      <FAQSection
        faqs={faqs}
        title="Claiming FAQ"
        description="Answers about verification codes, contact info, mistaken claims, and cost."
        includeSchema={true}
      />

      <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
        <DirectoryDisclaimer />
      </div>
    </div>
  );
}
