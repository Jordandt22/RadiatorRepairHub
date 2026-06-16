import React from "react";
import Link from "next/link";

// Components
import HeroContent from "@/components/pages/home/HeroContent";
import FeaturedBusinesses from "@/components/pages/home/FeaturedBusinesses";
import BranchBoundBanner from "@/components/promo/BranchBoundBanner";
import FeaturedCategories from "@/components/pages/home/FeaturedCategories";
import PopularLocations from "@/components/pages/home/PopularLocations";
import HowItWorks from "@/components/pages/home/HowItWorks";
import WhyChoose from "@/components/pages/home/WhyChoose";
import ContactSection from "@/components/pages/home/ContactSection";
import FAQSection from "@/components/seo/FAQSection";
import { HOME_KEYWORDS } from "@/lib/seo/keywords";
import { EXTRA_FAQS } from "@/lib/seo/faqs";
import { buildPageMetadata } from "@/lib/seo/metadata";

const homeTitle =
  "Radiator Repair Near Me | Find Auto Repair Shops - RadiatorRepairHub";
const homeDescription =
  "Find radiator repair near me and trusted auto repair shop listings in your area. Browse radiator services, compare reviews, and connect with certified specialists.";

export const metadata = buildPageMetadata({
  title: homeTitle,
  description: homeDescription,
  keywords: HOME_KEYWORDS,
  path: "/",
});

export default function Home() {
  const faqs = [
    {
      question: "How do I find radiator repair services in my area?",
      answer:
        "Use our search tool to enter your location and instantly see verified radiator repair shops near you. You can filter by ratings, reviews, hours, and services offered to find the best match for your needs.",
    },
    {
      question: "How much does radiator repair typically cost?",
      answer:
        "Radiator repair costs vary based on the issue, vehicle type, and location. Simple repairs like fixing leaks can cost $100-300, while radiator replacement typically ranges from $300-900. Get quotes from multiple shops for the best price.",
    },
    {
      question: "What are the signs that my radiator needs repair?",
      answer:
        "Common signs include overheating, coolant leaks, low coolant levels, steam from under the hood, unusual smells, and dashboard warning lights. If you notice any of these, have your cooling system checked immediately.",
    },
    ...EXTRA_FAQS,
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroContent />

      {/* Featured Businesses Section */}
      <FeaturedBusinesses />

      {/* SEO Content Section */}
      <section className="pt-8 pb-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-gray-700 leading-relaxed">
            When your car&apos;s radiator needs repair, finding a trusted{" "}
            <strong>radiator repair shop near you</strong>{" "}is crucial. Our
            comprehensive directory connects you with certified specialists who
            can diagnose, repair, and maintain your vehicle&apos;s cooling
            system. From{" "}
            <Link
              href="/category/radiator-repair-service"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              radiator repair services
            </Link>{" "}
            to{" "}
            <Link
              href="/category/auto-repair-shop"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              general auto repair
            </Link>
            , find the right professional for your needs. Browse our{" "}
            <Link
              href="/categories"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              service categories
            </Link>{" "}
            or search by{" "}
            <Link
              href="/states"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              state and city
            </Link>{" "}
            to locate trusted repair shops in your area.
          </p>
        </div>
      </section>

      {/* BranchBound promo banner (dismissible, persisted via localStorage) */}
      <BranchBoundBanner />

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* Popular Locations */}
      <PopularLocations />

      {/* How It Works */}
      <HowItWorks />

      {/* Why Choose RadiatorRepairHub */}
      <WhyChoose />

      {/* FAQ Section — schema lives on /faq to avoid duplicate FAQPage markup */}
      <FAQSection faqs={faqs} includeSchema={false} />

      {/* FAQ CTA */}
      <section className="py-8 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-gray-700 mb-4">
            Have more questions? Check out our comprehensive FAQ page for
            detailed answers.
          </p>
          <Link
            href="/faq"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            View All FAQs
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />
    </div>
  );
}
