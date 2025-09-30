import React from "react";
import { CheckCircle, Users, Search, Eye, TrendingUp } from "lucide-react";

// Contexts
import { ToastProvider } from "@/contexts/ToastProvider";

// Components
import ContactForm from "@/components/pages/contact/ContactForm";
import GetListedHeader from "@/components/pages/get-listed/GetListedHeader";

export const metadata = {
  title: "Get Listed | Add Your Radiator Repair Business - RadiatorRepairHub",
  description:
    "List your radiator repair business on RadiatorRepairHub for free. Get discovered by customers searching for cooling system repair services. Boost your online visibility and attract more customers.",
  keywords:
    "get listed, radiator repair business listing, auto repair directory, business listing, radiator repair marketing, cooling system business",
  openGraph: {
    title: "Get Listed | Add Your Radiator Repair Business - RadiatorRepairHub",
    description:
      "List your radiator repair business on RadiatorRepairHub for free. Get discovered by customers searching for cooling system repair services. Boost your online visibility and attract more customers.",
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
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
  const benefits = [
    {
      icon: Users,
      title: "Get discovered by local customers",
      description:
        "Connect with customers actively searching for radiator repair services in your area.",
    },
    {
      icon: Eye,
      title: "Showcase services, reviews, and contact info",
      description:
        "Display your business details, services, and customer reviews in one place.",
    },
    {
      icon: Search,
      title: "Appear in search results by city and category",
      description:
        "Be found when customers search by location or specific repair services.",
    },
    {
      icon: TrendingUp,
      title: "Boost your online visibility",
      description:
        "Increase your digital presence and attract more customers to your business.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <GetListedHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
        {/* Benefits Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
              Why List Your Business?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our growing directory of trusted radiator repair
              professionals and reach more customers in your area.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105 duration-300"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
                Submit Your Business
              </h2>
              <p className="text-lg text-gray-600">
                Fill out the form below to get your business listed in our
                directory.
              </p>
            </div>

            {/* Custom ContactForm with pre-filled subject */}
            <div className="relative">
              <ToastProvider>
                <ContactForm
                  prefilledSubject="Business Listing Request"
                  lockSubject={true}
                  formTitle="Submit Your Business"
                  messagePlaceholder="Let us know about your business..."
                  namePlaceholder="Enter your full business name"
                  nameLabel="Full Business Name"
                  showSubjectInput={false}
                />
              </ToastProvider>
            </div>
          </div>
        </div>

        {/* Process Explanation */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-blue-500">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    What Happens Next?
                  </h3>
                  <div className="space-y-3 text-gray-600">
                    <p>
                      • We&apos;ll review your submission within 2-3 business
                      days.
                    </p>
                    <p>
                      • Once approved, your business will appear in our
                      directory.
                    </p>
                    <p>
                      • You&apos;ll receive an email confirmation when your
                      listing goes live.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Free Listing Note */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-600 rounded-xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4 font-heading">
                Free Business Listings
              </h3>
              <p className="text-lg opacity-90">
                Currently, all listings are free. Paid premium options will be
                available in the future.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gray-100 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Need Help?
              </h3>
              <p className="text-gray-600 mb-4">
                Have questions about listing your business? We&apos;re here to
                help!
              </p>
              <a
                href={`mailto:${process.env.BUSINESS_EMAIL}`}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                {process.env.BUSINESS_EMAIL}
              </a>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-sm text-gray-500">
            <p>
              By submitting your business, you agree to our{" "}
              <a
                href="/terms"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
