import React from "react";
import Link from "next/link";
import { Mail, MapPin, Clock, CheckCircle, List } from "lucide-react";

// Contexts
import { ToastProvider } from "@/contexts/ToastProvider";

// Components
import ContactForm from "@/components/pages/contact/ContactForm";
import ContactHeader from "@/components/pages/contact/ContactHeader";

export const metadata = {
  title:
    "Contact RadiatorRepairHub | Get Help Finding Radiator Repair Services",
  description:
    "Contact RadiatorRepairHub for help finding radiator repair services. Get support, ask questions, or provide feedback about our directory of trusted cooling system experts.",
  keywords:
    "contact radiator repair hub, radiator repair help, cooling system support, auto repair directory contact",
  openGraph: {
    title:
      "Contact RadiatorRepairHub | Get Help Finding Radiator Repair Services",
    description:
      "Contact RadiatorRepairHub for help finding radiator repair services. Get support, ask questions, or provide feedback about our directory of trusted cooling system experts.",
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
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
  // ContactPage Schema
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact RadiatorRepairHub",
    description:
      "Get in touch with RadiatorRepairHub for support and inquiries",
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
      <div className="min-h-screen bg-gray-5 pb-32">
        {/* Header */}
        <ContactHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <ToastProvider>
                <ContactForm />
              </ToastProvider>
            </div>

            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-8 h-fit border-t-5 border-blue-200 hover:border-blue-500 transition-all duration-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-heading">
                  Get in Touch
                </h2>

                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Email Us
                      </h3>
                      <p className="text-gray-600 mb-2">
                        Send us an email anytime
                      </p>
                      <a
                        href={`mailto:${process.env.BUSINESS_EMAIL}`}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        {process.env.BUSINESS_EMAIL}
                      </a>
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Response Time
                      </h3>
                      <p className="text-gray-600">
                        We typically respond to all inquiries within 24 hours
                        during business days.
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Service Area
                      </h3>
                      <p className="text-gray-600">
                        We help connect you with radiator repair professionals
                        across the United States.
                      </p>
                    </div>
                  </div>

                  {/* Get Listed */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <List className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Own a Business?
                      </h3>
                      <p className="text-gray-600">
                        Want to get your business listed? We can help grow your
                        business and reach more customers.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/get-listed"
                    className="block mt-4 font-medium rounded-full border-2 border-blue-500 text-blue-500 px-4 py-2 text-center hover:bg-blue-500 hover:text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Get Listed
                  </Link>
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-blue-900">
                      Quick Response Guarantee
                    </h4>
                  </div>
                  <p className="text-sm text-blue-800">
                    We&apos;re committed to helping you find the right radiator
                    repair service. All inquiries receive a personalized
                    response within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
