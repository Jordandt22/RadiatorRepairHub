import React from "react";
import Link from "next/link";
import FAQSection from "@/components/seo/FAQSection";
import PageHeader from "@/components/layout/Header/PageHeader";
import BranchBoundBanner from "@/components/promo/BranchBoundBanner";

export const metadata = {
  title:
    "Frequently Asked Questions | Radiator Repair Help & Support - RadiatorRepairHub",
  description:
    "Get answers to common questions about radiator repair services. Learn about costs, finding repair shops, what to look for, and more. Expert advice for your cooling system needs.",
  keywords:
    "radiator repair FAQ, cooling system questions, auto repair help, radiator repair costs, find radiator repair shop, automotive FAQ",
  openGraph: {
    title:
      "Frequently Asked Questions | Radiator Repair Help & Support - RadiatorRepairHub",
    description:
      "Get answers to common questions about radiator repair services. Learn about costs, finding repair shops, what to look for, and more.",
    type: "website",
    locale: "en_US",
    siteName: "RadiatorRepairHub",
  },
  alternates: {
    canonical: "https://radiatorrepairhub.com/faq",
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

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I find radiator repair services near me?",
      answer:
        "Use our search tool to enter your location and instantly see verified radiator repair shops in your area. You can filter by ratings, reviews, hours, services offered to find the best match for your needs.",
    },
    {
      question: "What should I look for in a radiator repair shop?",
      answer:
        "Look for shops with certified technicians, good customer reviews, proper licensing, and experience with your vehicle type. Check if they offer warranties on their work and use quality parts. For more information, you can visit their business page and give them a call.",
    },
    {
      question: "How much does radiator repair typically cost?",
      answer:
        "Radiator repair costs vary based on the issue, vehicle type, and location. Simple repairs like fixing leaks can cost $100-300, while radiator replacement typically ranges from $300-900. Get quotes from multiple shops for the best price. Contact the business for a more accurate estimate.",
    },
    {
      question: "What are the signs that my radiator needs repair?",
      answer:
        "Common signs include overheating, coolant leaks, low coolant levels, steam from under the hood, unusual smells, and dashboard warning lights. If you notice any of these, have your cooling system checked immediately.",
    },
    {
      question: "Can I drive with a radiator problem?",
      answer:
        "It's not recommended to drive with radiator problems as it can lead to engine damage. If your car is overheating, pull over safely and turn off the engine. Call for a tow truck rather than risk further damage.",
    },
    {
      question: "How long does radiator repair take?",
      answer:
        "Simple repairs like fixing leaks can take 1-2 hours, while radiator replacement typically takes 2-4 hours. Complex issues may require overnight service. Most shops can provide time estimates when you call.",
    },
    {
      question:
        "What's the difference between radiator repair and replacement?",
      answer:
        "Repair involves fixing specific issues like leaks, clogs, or damaged components. Replacement means installing a completely new radiator. The choice depends on the extent of damage and cost-effectiveness. A professional can help you decide.",
    },
    {
      question: "How often should I have my radiator serviced?",
      answer:
        "Regular radiator maintenance should be done every 30,000-50,000 miles or as recommended by your vehicle manufacturer. This includes coolant flushes, checking for leaks, and ensuring proper coolant levels.",
    },
    {
      question: "What types of coolant should I use?",
      answer:
        "Always use the coolant type specified in your vehicle's owner manual. Different vehicles require different coolant formulations (conventional, extended-life, or specific OEM formulas). Using the wrong type can cause damage.",
    },
    {
      question: "Can I prevent radiator problems?",
      answer:
        "Yes! Regular maintenance, using the correct coolant, checking coolant levels monthly, and addressing small issues promptly can prevent major radiator problems. Also, avoid driving with an overheating engine.",
    },
    {
      question: "Do you verify the businesses listed on your site?",
      answer:
        "Yes, we verify that all listed businesses offer genuine radiator repair services. We continuously update our directory to ensure accuracy and remove outdated information. However, we recommend calling ahead to confirm current services and hours.",
    },
    {
      question: "How can I get my business listed on RadiatorRepairHub?",
      answer:
        "Business owners can submit their information through our Get Listed page. We review all submissions to ensure they meet our quality standards for radiator repair services. Listings are currently free.",
    },
  ];

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "FAQ", url: "/faq" },
  ];

  const pageTitle = "Frequently Asked Questions";
  const pageDescription =
    "Get answers to common questions about radiator repair services and find the help you need";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle={pageTitle}
        pageDescription={pageDescription}
      />

      {/* FAQ Section */}
      <FAQSection faqs={faqs} title="Radiator Repair Questions & Answers" />

      {/* Additional Help Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
              Still Need Help?
            </h2>
            <p className="text-lg text-gray-600">
              Can&apos;t find the answer you&apos;re looking for? We&apos;re
              here to help you find the right radiator repair service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Find a Repair Shop
              </h3>
              <p className="text-gray-600 mb-6">
                Search our directory of verified radiator repair shops in your
                area.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Search Now
              </Link>
            </div>

            <div className="bg-green-50 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Contact Support
              </h3>
              <p className="text-gray-600 mb-6">
                Have a specific question? Our support team is here to help.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-300"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Topics Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
              Related Topics
            </h2>
            <p className="text-lg text-gray-600">
              Explore more resources to help with your radiator repair needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/categories"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Service Categories
              </h3>
              <p className="text-gray-600 text-sm">
                Browse different types of radiator and auto repair services
              </p>
            </Link>

            <Link
              href="/featured"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Featured Businesses
              </h3>
              <p className="text-gray-600 text-sm">
                Discover top-rated radiator repair shops in your area
              </p>
            </Link>

            <Link
              href="/get-listed"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Business Owners
              </h3>
              <p className="text-gray-600 text-sm">
                Get your radiator repair business listed on our platform
              </p>
            </Link>
          </div>
        </div>
      </section>

      <BranchBoundBanner />
    </div>
  );
}
