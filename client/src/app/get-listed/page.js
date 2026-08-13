import React from "react";
import Link from "next/link";
import { CheckCircle, Users, Search, Eye, TrendingUp } from "lucide-react";

// Contexts
import { ToastProvider } from "@/contexts/ToastProvider";

// Components
import ContactForm from "@/components/pages/contact/ContactForm";
import GetListedHeader from "@/components/pages/get-listed/GetListedHeader";
import SitePhoneLinks from "@/components/contact/SitePhoneLinks";
import {
  getBusinessEmail,
  getBusinessPhoneDigits,
} from "@/lib/businessContactInfo";

export const metadata = {
  title: "Get Listed | Add Your Radiator Repair Business - RadiatorRepairHub",
  description:
    "List your radiator repair business on RadiatorRepairHub for free. Show up when customers search by city or category for cooling system repair.",
  keywords:
    "get listed, radiator repair business listing, auto repair directory, business listing, radiator repair marketing, cooling system business",
  openGraph: {
    title: "Get Listed | Add Your Radiator Repair Business - RadiatorRepairHub",
    description:
      "List your radiator repair business on RadiatorRepairHub for free. Show up when customers search by city or category for cooling system repair.",
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
    url: "https://radiatorrepairhub.com/get-listed",
    images: [
      {
        url: "https://radiatorrepairhub.com/assets/logos/logo.png",
        width: 1200,
        height: 630,
        alt: "RadiatorRepairHub - Find Trusted Auto Radiator Repair Services",
      },
    ],
  },
  alternates: {
    canonical: "https://radiatorrepairhub.com/get-listed",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const Page = () => {
  const businessEmail = getBusinessEmail();
  const hasPhone = Boolean(getBusinessPhoneDigits());

  // Service Schema for Business Listing
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Business Listing Service",
    description: "List your radiator repair business on RadiatorRepairHub",
    provider: {
      "@id": "https://radiatorrepairhub.com/#organization",
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

  const benefits = [
    {
      icon: Users,
      title: "Reach local customers",
      description:
        "Show up for people searching for radiator repair services in your area.",
    },
    {
      icon: Eye,
      title: "Show services, reviews, and contact info",
      description:
        "Put your business details, services, and reviews in one place.",
    },
    {
      icon: Search,
      title: "Appear in search by city and category",
      description:
        "Be found when customers search by location or repair type.",
    },
    {
      icon: TrendingUp,
      title: "Stay findable online",
      description:
        "Keep a public listing customers can use to call or message you.",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <GetListedHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
          {/* Benefits Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4 font-heading">
                Why List Your Business?
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Add your shop to the RadiatorRepairHub directory so local
                drivers can find you when they need cooling system repair.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={index}
                    className="bg-card rounded-lg border border-border p-6"
                  >
                    <div className="w-12 h-12 bg-tint rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Business Listing Form */}
          <div className="mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-4 font-heading">
                  Submit Your Business
                </h2>
                <p className="text-lg text-muted-foreground">
                  Fill out the form below to get your business listed in our
                  directory.
                </p>
                <p className="text-base text-muted-foreground mt-3 max-w-2xl mx-auto">
                  Already in the directory?{" "}
                  <Link
                    href="/how-to-claim"
                    className="text-interactive hover:text-primary underline"
                  >
                    Claim your listing
                  </Link>{" "}
                  from the business page instead of submitting a duplicate.
                </p>
              </div>

              {/* Custom ContactForm with pre-filled subject */}
              <div className="relative">
                <ToastProvider>
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
                </ToastProvider>
              </div>
            </div>
          </div>

          {/* Process Explanation */}
          <div className="mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-lg border border-border p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">
                      What Happens Next?
                    </h3>
                    <ol className="list-decimal space-y-3 pl-5 text-muted-foreground">
                      <li>
                        We&apos;ll review your submission within 2-3 business
                        days.
                      </li>
                      <li>
                        Once approved, your business will appear in our
                        directory.
                      </li>
                      <li>
                        You&apos;ll receive an email confirmation when your
                        listing goes live.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Free Listing Note */}
          <div className="mb-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-tint rounded-lg border border-border p-8 text-center">
                <h3 className="text-2xl font-semibold mb-3 font-heading text-primary">
                  Free Business Listings
                </h3>
                <p className="text-lg text-foreground">
                  Currently, all listings are free. Paid premium options will be
                  available in the future.
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mb-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-card rounded-lg border border-border p-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Need Help?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Have questions about listing your business? Email, call, or
                  text us — we&apos;re here to help!
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  {businessEmail ? (
                    <a
                      href={`mailto:${businessEmail}`}
                      className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200"
                    >
                      {businessEmail}
                    </a>
                  ) : null}
                  {hasPhone ? (
                    <div className="text-sm text-foreground">
                      <SitePhoneLinks showLabel={true} />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                By submitting your business, you agree to our{" "}
                <a
                  href="/terms"
                  className="text-interactive hover:text-primary underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-interactive hover:text-primary underline"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
