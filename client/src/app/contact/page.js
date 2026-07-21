import React from "react";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  List,
  Store,
  Search,
  Info,
  MoveRight,
} from "lucide-react";

// Contexts
import { ToastProvider } from "@/contexts/ToastProvider";

// Components
import ContactForm from "@/components/pages/contact/ContactForm";
import ContactHeader from "@/components/pages/contact/ContactHeader";
import DirectoryDisclaimer from "@/components/content/DirectoryDisclaimer";

export const metadata = {
  title: "Contact RadiatorRepairHub | Directory Support & Feedback",
  description:
    "Contact the RadiatorRepairHub team about the directory, listings, partnerships, or website feedback. To reach a repair shop, use Quick Contact on that business's page.",
  keywords:
    "contact radiator repair hub, directory support, listing help, website feedback, radiator repair hub contact",
  openGraph: {
    title: "Contact RadiatorRepairHub | Directory Support & Feedback",
    description:
      "Reach the RadiatorRepairHub team for directory support, listing questions, and partnerships. Contact repair shops directly from their business page.",
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
    url: "https://radiatorrepairhub.com/contact",
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
    canonical: "https://radiatorrepairhub.com/contact",
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
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact RadiatorRepairHub",
    description:
      "Contact the RadiatorRepairHub team for directory support, listing help, and partnerships. Use Quick Contact on a business page to reach a repair shop.",
    url: "https://radiatorrepairhub.com/contact",
    mainEntity: {
      "@id": "https://radiatorrepairhub.com/#organization",
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
      <div className="min-h-screen bg-gray-50 pb-32">
        <ContactHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
          {/* Business contact notice */}
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">

              <div className="min-w-0 flex-1">
                <h2 className="flex items-center gap-2 text-lg font-medium mb-1 font-heading">
                  <Info className="w-5 h-5 text-yellow-700" />
                  Looking to Contact a Repair Shop?
                </h2>
                <p className="text-sm md:text-base mb-4 leading-relaxed">
                  This form reaches the <strong>RadiatorRepairHub</strong> team
                  only (directory support, listing issues, partnerships, and
                  website feedback). We cannot forward repair requests or
                  schedule appointments with shops.
                </p>
                <p className="text-sm md:text-base mb-4 leading-relaxed">
                  To message a business, open their listing and use{" "}
                  <strong>Quick Contact</strong> on the business page or call
                  them using the phone number listed there. Quick Contact
                  messages are reviewed by our team before they may be forwarded
                  to the shop.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/search"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-all hover:scale-95"
                  >
                    <Search className="w-4 h-4" />
                    Find a Shop
                  </Link>
                  <Link
                    href="/featured"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-blue-600 px-8 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <Store className="w-4 h-4" />
                    Featured Businesses
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-stretch">
            <div className="lg:col-span-2 flex">
              <ToastProvider>
                <ContactForm
                  className="h-full w-full"
                  formTitle="Message RadiatorRepairHub"
                  messagePlaceholder="Tell us about your directory question, listing issue, partnership idea, or website feedback..."
                />
              </ToastProvider>
            </div>

            <div className="lg:col-span-1 flex">
              <div className="bg-white rounded-xl shadow-lg p-8 h-full w-full flex flex-col border-t-5 border-blue-200 hover:border-blue-500 transition-all duration-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-heading">
                  About This Contact Form
                </h2>

                <div className="space-y-6 flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-md font-semibold text-gray-900 mb-1">
                        Email the Team
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Submit the form or email us directly for RadiatorRepairHub
                        support and inquiries.
                      </p>
                      <a
                        href={`mailto:${process.env.BUSINESS_EMAIL}`}
                        className="text-sm text-blue-600 hover:text-blue-600 font-medium transition-colors break-all"
                      >
                        {process.env.BUSINESS_EMAIL}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-md font-semibold text-gray-900 mb-1">
                        Response Time
                      </h3>
                      <p className="text-sm text-gray-600">
                        We typically respond within 24 hours on business days.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-md font-semibold text-gray-900 mb-1">
                        What We Can Help With
                      </h3>
                      <p className="text-sm text-gray-600">
                        Directory questions, incorrect listing details, website
                        bugs, advertising, and partnerships across the U.S.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Store className="w-6 h-6 text-slate-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-md font-semibold text-gray-900 mb-1">
                        Contacting a Shop
                      </h3>
                      <p className="text-sm text-gray-600">
                        Use <strong>Quick Contact</strong> (or the phone number)
                        on that business&apos;s page — not this form. Include your
                        vehicle and issue details so the shop can respond.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <List className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-md font-semibold text-gray-900 mb-1">
                        Own a Business?
                      </h3>
                      <p className="text-sm text-gray-600">
                        Request a free listing so customers can find your
                        radiator repair services.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/get-listed"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 font-medium rounded-full border-2 border-blue-600 text-blue-600 px-4 py-2 text-center hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-sm"
                  >
                    Get Listed
                    <MoveRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="mt-auto pt-8">
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                      <h4 className="font-semibold text-blue-900">
                        Platform Support
                      </h4>
                    </div>
                    <p className="text-sm text-blue-800">
                      Messages sent here go to RadiatorRepairHub staff. For
                      repairs, quotes, or appointments, contact the shop on their
                      business page. See our{" "}
                      <Link
                        href="/privacy"
                        className="font-medium underline hover:text-blue-900"
                      >
                        Privacy Policy
                      </Link>{" "}
                      for how we handle form submissions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DirectoryDisclaimer className="mt-12" />
        </div>
      </div>
    </>
  );
};

export default Page;
