import React from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Clock3,
  Flag,
  ImageIcon,
  MapPinned,
  Phone,
  Search,
} from "lucide-react";
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
      question: "What if other listing details are wrong?",
      answer:
        "Use the same Report Info button on the business page to report outdated or incorrect listing content, or reach us through the contact page and choose Report a Listing Problem.",
    },
    {
      question: "What if someone else already claimed my business by mistake?",
      answer: supportEmail
        ? `Contact RadiatorRepairHub support right away at ${supportEmail}, by phone/SMS, or through the contact page. We'll help verify ownership and resolve mistaken claims.`
        : "Contact RadiatorRepairHub support right away by phone/SMS or through the contact page. We'll help verify ownership and resolve mistaken claims.",
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
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle="How to claim your business"
        pageDescription="Check eligibility, follow the email claim steps, and see what you can edit after claiming."
        headerLink={{
          href: "/signin",
          label: "Already claimed? Sign in",
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading mb-4">
            Claim Eligibility
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            A listing is claimable when it has a unique email on file that is
            not shared with other businesses in our directory. We send a
            verification code to that email to confirm you control the listing
            contact.
          </p>

          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-semibold text-gray-900 mb-1">
                Unclaimable Reason: No Email
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                There is no contact email on file for the listing, so email
                verification cannot run yet.
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-semibold text-gray-900 mb-1">
                Unclaimable Reason: Multiple Businesses have this Email
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                A shared or corporate inbox is used by more than one listing.
                Self-serve email claim is disabled so one account cannot lock
                that inbox for every location.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-3">
              <Flag
                className="mt-0.5 size-5 shrink-0 text-blue-600"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Wrong or outdated contact info?
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  If a missing or incorrect email is preventing you from
                  claiming, open your listing and use the{" "}
                  <strong>Report Info</strong> {" "}button under Contact Information.
                  Choose the option for wrong claim contact info, share the
                  correct phone and/or email if you have them, and we&apos;ll
                  review the report so you can complete the claim once it&apos;s
                  fixed.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading mb-4">
            How to Claim (Step-by-Step)
          </h2>
          <ol className="space-y-4">
            {CLAIM_STEPS.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="pt-1 text-gray-700 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading mb-6">
            Benefits of Claiming
          </h2>
          <div className="flex flex-col gap-4">
            {BENEFITS.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-heading mb-4">
            Coming Soon
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-blue-600" />
              <span>
                Phone verification so more shops can prove ownership without
                relying only on email.
              </span>
            </li>
            <li className="flex gap-3">
              <MapPinned className="mt-0.5 size-5 shrink-0 text-blue-600" />
              <span>
                Support for claiming when multiple businesses share the same
                email address.
              </span>
            </li>
          </ul>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Already claimed?
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Sign in to open your business listing.
            </p>
            <Link
              href="/signin"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to sign in
            </Link>
          </div>
          <div className="bg-green-50 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need help?
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              Reach our team
              {supportEmail ? (
                <>
                  {" "}
                  at{" "}
                  <a
                    href={`mailto:${supportEmail}`}
                    className="text-blue-600 hover:underline"
                  >
                    {supportEmail}
                  </a>
                </>
              ) : null}
              {hasPhone ? (
                <>
                  {supportEmail ? ", " : " "}
                  by phone or SMS (
                  <SitePhoneLinks
                    className="inline"
                    showLabel={false}
                    linkClassName="text-blue-600 hover:underline"
                  />
                  ),
                </>
              ) : null}{" "}
              or use the contact form.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Contact support
            </Link>
          </div>
        </section>
      </div>

      <FAQSection
        faqs={faqs}
        title="Claiming FAQ"
        includeSchema={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <DirectoryDisclaimer />
      </div>
    </div>
  );
}
