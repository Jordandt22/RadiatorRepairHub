import React from "react";
import Link from "next/link";
import FAQSection from "@/components/seo/FAQSection";
import PageHeader from "@/components/layout/Header/PageHeader";
import BranchBoundBanner from "@/components/promo/BranchBoundBanner";
import AffiliateProductsSection from "@/components/blogs/AffiliateProductsSection";
import { FAQ_KEYWORDS } from "@/lib/seo/keywords";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { fetchActiveAffiliateProductsByAliases } from "@/lib/api/affiliate-products";

const faqTitle =
  "Frequently Asked Questions | Radiator Repair Help & Support - RadiatorRepairHub";
const faqDescription =
  "Get answers to common questions about radiator repair services, servicing of a radiator, car radiator repair, and finding a radiator repair shop near me.";

export const metadata = buildPageMetadata({
  title: faqTitle,
  description: faqDescription,
  keywords: FAQ_KEYWORDS,
  path: "/faq",
});

export const revalidate = 60;

export default async function FAQPage() {
  const { data: affiliateData } = await fetchActiveAffiliateProductsByAliases([
    "valvoline",
    "radiator-cap",
    "coolant-funnel",
  ]);
  const featuredProducts = affiliateData?.products ?? [];

  const faqs = [
    {
      question: "How do I find a radiator repair shop in my area?",
      answer:
        "Use our search tool to enter your city or ZIP code and browse verified radiator repair shops near you. Filter by ratings, reviews, hours, and services to find the best match for your needs.",
    },
    {
      question: "What should I look for in a radiator repair shop?",
      answer:
        "Look for shops with certified technicians, good customer reviews, proper licensing, and experience with your vehicle type. Check if they offer warranties on their work and use quality parts. For more information, you can visit their business page and give them a call.",
      relatedBlog: {
        title: "How to Choose a Radiator Shop",
        href: "/blogs/how-to-choose-a-radiator-shop",
      },
    },
    {
      question: "How much does radiator repair typically cost?",
      answer:
        "Radiator repair costs vary based on the issue, vehicle type, and location. Simple repairs like fixing leaks can cost $100–$300 when the radiator is repairable, while radiator replacement typically ranges from $400–$900+ (economy vehicles can be lower; trucks and luxury models higher). Get quotes from multiple shops for the best price. Contact the business for a more accurate estimate.",
      relatedBlog: {
        title: "Radiator Repair Cost Guide",
        href: "/blogs/radiator-repair-cost-guide",
      },
    },
    {
      question: "What are the signs that my radiator needs repair?",
      answer:
        "Common signs include overheating, coolant leaks, low coolant levels, steam from under the hood, unusual smells, and dashboard warning lights. If you notice any of these, have your cooling system checked immediately.",
      relatedBlog: {
        title: "7 Signs Your Radiator Needs Repair",
        href: "/blogs/7-signs-your-radiator-needs-repair",
      },
    },
    {
      question: "Can I drive with a radiator problem?",
      answer:
        "It's not recommended to drive with radiator problems as it can lead to engine damage. If your car is overheating, steaming, or losing coolant quickly, pull over safely, turn off the engine, and call for a tow. A very slow seep with a normal temperature gauge may allow a short trip to a nearby shop, but only if you can monitor the gauge the entire way.",
      relatedBlog: {
        title: "Can You Drive With a Radiator Leak?",
        href: "/blogs/can-you-drive-with-a-radiator-leak",
      },
    },
    {
      question: "How long does radiator repair take?",
      answer:
        "Simple repairs like fixing leaks can take 1-2 hours, while radiator replacement typically takes 2-4 hours. Complex issues may require overnight service. Most shops can provide time estimates when you call.",
      relatedBlog: {
        title: "How Long Does Radiator Repair Take?",
        href: "/blogs/how-long-does-radiator-repair-take",
      },
    },
    {
      question:
        "What's the difference between radiator repair and replacement?",
      answer:
        "Repair involves fixing specific issues like leaks, clogs, or damaged components. Replacement means installing a completely new radiator. The choice depends on the extent of damage and cost-effectiveness. A professional can help you decide.",
      relatedBlog: {
        title: "Radiator Repair vs Replacement: Which Is Better?",
        href: "/blogs/radiator-repair-vs-replacement-which-is-better",
      },
    },
    {
      question: "How often should I have my radiator serviced?",
      answer:
        "Follow your vehicle manufacturer's schedule first. Many older formulas call for service around every 30,000–50,000 miles, while some extended-life coolants last much longer. Typical service includes coolant flushes or drain-and-fills, leak checks, and verifying proper coolant levels.",
      relatedBlog: {
        title: "Radiator Flush: What to Expect & Cost",
        href: "/blogs/radiator-flush-what-to-expect-and-cost",
      },
    },
    {
      question: "What types of coolant should I use?",
      answer:
        "Always use the coolant type specified in your vehicle's owner manual. Different vehicles require different formulations (conventional green, extended-life OAT/HOAT, or OEM-specific coolants). Mixing incompatible types or using the wrong formula can cause corrosion, sludge, or cooling system damage.",
      relatedBlog: {
        title: "Radiator Flush: What to Expect & Cost",
        href: "/blogs/radiator-flush-what-to-expect-and-cost",
      },
    },
    {
      question: "Can I prevent radiator problems?",
      answer:
        "Regular maintenance helps: use the correct coolant, check levels monthly, and fix small issues early. Avoid driving with an overheating engine.",
      relatedBlog: {
        title: "How to Spot a Radiator Leak",
        href: "/blogs/how-to-spot-a-radiator-leak",
      },
    },
    {
      question: "Do you verify the businesses listed on your site?",
      answer:
        "We work to list genuine radiator repair businesses and keep the directory updated, including reviewing Get Listed submissions and Report Info tips. Claimed listings mean an owner verified access to the listing email and created an account, but we still recommend calling ahead to confirm current services and hours.",
    },
    {
      question: "How can I get my business listed on RadiatorRepairHub?",
      answer:
        "If your shop is not listed yet, submit your information through our Get Listed page. If you are already in the directory, claim your listing from the business page instead of submitting a duplicate. Listings are currently free.",
    },
    {
      question: "How do I claim my business listing?",
      answer:
        "Open your business page and use Claim Business. We send a verification email to the address on file for that listing. After you verify, create your account password and sign in to manage the listing. Full steps and eligibility rules are on our How to Claim page.",
    },
    {
      question: "Why can't I claim my business?",
      answer:
        "Self-serve claiming needs a unique email on the listing. If there is no email, or the same email is shared by multiple businesses, the listing may show as unclaimable. Use Report Info on the business page to send the correct contact details, or contact us for help. More detail is on How to Claim.",
    },
    {
      question: "How do I report incorrect or inappropriate listing information?",
      answer:
        "On the business page, use Report Info under Contact Information. You can report wrong claim contact details (and suggest corrections) or inappropriate listing content. You can also reach us through the contact page and choose Report a Listing Problem.",
    },
    {
      question: "What's included in radiator servicing?",
      answer:
        "Radiator servicing typically includes a coolant flush, leak inspection, pressure testing, hose and cap checks, and topping off coolant levels. Regular maintenance helps prevent overheating and extends the life of your cooling system.",
      relatedBlog: {
        title: "Radiator Flush: What to Expect & Cost",
        href: "/blogs/radiator-flush-what-to-expect-and-cost",
      },
    },
    {
      question: "How do I find radiator fan repair in my area?",
      answer:
        "Search our directory for auto repair shops that offer radiator fan repair and cooling system diagnostics. Many specialists also handle fan clutch, fan motor, and blade replacement. Filter results by location to find shops near you.",
      relatedBlog: {
        title: "Radiator Fan Not Working: Symptoms and Repair",
        href: "/blogs/radiator-fan-not-working",
      },
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

      {featuredProducts.length > 0 ? (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AffiliateProductsSection
              products={featuredProducts}
              title="Helpful Tools & Supplies"
              description="Products related to coolant top-offs, radiator caps, and DIY flushes—use only what matches your vehicle."
              variant="showcase"
            />
          </div>
        </section>
      ) : null}

      {/* Additional Help Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
              Still have questions?
            </h2>
            <p className="text-lg text-gray-600">
              Search the directory for a shop near you, or contact us if you
              need help with a listing or the site.
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
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
              Related Topics
            </h2>
            <p className="text-lg text-gray-600">
              Explore more resources to help with your radiator repair needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Top-rated radiator repair shops in your area
              </p>
            </Link>

            <Link
              href="/how-to-claim"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How to Claim
              </h3>
              <p className="text-gray-600 text-sm">
                Claim an existing listing and manage it with a business account
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

            <Link
              href="/blogs"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Blogs
              </h3>
              <p className="text-gray-600 text-sm">
                Read guides and tips on radiator repair and cooling system care
              </p>
            </Link>

            <Link
              href="/shop"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tools & Supplies
              </h3>
              <p className="text-gray-600 text-sm">
                Browse coolant, radiator caps, funnels, and diagnostic tools
              </p>
            </Link>
          </div>
        </div>
      </section>

      <BranchBoundBanner />
    </div>
  );
}
