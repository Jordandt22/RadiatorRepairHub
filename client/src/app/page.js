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

export default function Home() {
  const faqs = [
    {
      question: "How do I find radiator repair services near me?",
      answer: "Use our search tool to enter your location and instantly see verified radiator repair shops in your area. You can filter by ratings, reviews, hours, services offered to find the best match for your needs."
    },
    {
      question: "What should I look for in a radiator repair shop?",
      answer: "Look for shops with certified technicians, good customer reviews, proper licensing, and experience with your vehicle type. Check if they offer warranties on their work and use quality parts. For more information, you can visit their business page and give them a call."
    },
    {
      question: "How much does radiator repair typically cost?",
      answer: "Radiator repair costs vary based on the issue, vehicle type, and location. Simple repairs like fixing leaks can cost $100-300, while radiator replacement typically ranges from $300-900. Get quotes from multiple shops for the best price. Contact the business for a more accurate estimate."
    },
    {
      question: "What are the signs that my radiator needs repair?",
      answer: "Common signs include overheating, coolant leaks, low coolant levels, steam from under the hood, unusual smells, and dashboard warning lights. If you notice any of these, have your cooling system checked immediately."
    },
    {
      question: "Can I drive with a radiator problem?",
      answer: "It's not recommended to drive with radiator problems as it can lead to engine damage. If your car is overheating, pull over safely and turn off the engine. Call for a tow truck rather than risk further damage."
    },
    {
      question: "How long does radiator repair take?",
      answer: "Simple repairs like fixing leaks can take 1-2 hours, while radiator replacement typically takes 2-4 hours. Complex issues may require overnight service. Most shops can provide time estimates when you call."
    }
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
            <strong>radiator repair near you</strong> is crucial. Our
            comprehensive <strong>radiator repair directory</strong> connects
            you with certified specialists who can diagnose, repair, and
            maintain your vehicle&apos;s cooling system. From{" "}
            <Link href="/category/radiator-repair-service" className="text-blue-600 hover:text-blue-800 underline">
              radiator repair services
            </Link>{" "}
            to{" "}
            <Link href="/category/auto-repair-shop" className="text-blue-600 hover:text-blue-800 underline">
              general auto repair
            </Link>
            , find the right professional for your automotive needs. Browse our{" "}
            <Link href="/categories" className="text-blue-600 hover:text-blue-800 underline">
              service categories
            </Link>{" "}
            or search by{" "}
            <Link href="/states" className="text-blue-600 hover:text-blue-800 underline">
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

      {/* FAQ Section */}
      <FAQSection faqs={faqs} />

      {/* FAQ CTA */}
      <section className="py-8 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-gray-700 mb-4">
            Have more questions? Check out our comprehensive FAQ page for detailed answers.
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
