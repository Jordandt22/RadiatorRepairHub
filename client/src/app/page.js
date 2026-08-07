import React from "react";
import Link from "next/link";

// Components
import HeroContent from "@/components/pages/home/HeroContent";
import FeaturedBusinesses from "@/components/pages/home/FeaturedBusinesses";
import FeaturedCategories from "@/components/pages/home/FeaturedCategories";
import PopularLocations from "@/components/pages/home/PopularLocations";
import HowItWorks from "@/components/pages/home/HowItWorks";
import WhyChoose from "@/components/pages/home/WhyChoose";
import ContactSection from "@/components/pages/home/ContactSection";
import FAQSection from "@/components/seo/FAQSection";
import AffiliateProductsSection from "@/components/blogs/AffiliateProductsSection";
import { HOME_KEYWORDS } from "@/lib/seo/keywords";
import { EXTRA_FAQS } from "@/lib/seo/faqs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { fetchActiveAffiliateProductsByAliases } from "@/lib/api/affiliate-products";

const homeTitle =
  "Find Radiator Repair Shops Nationwide | RadiatorRepairHub Directory";
const homeDescription =
  "Browse RadiatorRepairHub's nationwide directory of radiator repair shops. Compare reviews, filter by city, and connect with cooling system specialists near you.";

export const metadata = buildPageMetadata({
  title: homeTitle,
  description: homeDescription,
  keywords: HOME_KEYWORDS,
  path: "/",
});

export const revalidate = 60;

export default async function Home() {
  const { data: affiliateData } = await fetchActiveAffiliateProductsByAliases([
    "valvoline",
    "radiator-cap",
    "ir-thermometer",
  ]);
  const featuredProducts = affiliateData?.products ?? [];

  const faqs = [
    {
      question: "How do I find radiator repair services in my area?",
      answer:
        "Use our search tool to enter your location and instantly see verified radiator repair shops near you. You can filter by ratings, reviews, hours, and services offered to find the best match for your needs.",
      relatedBlog: {
        title: "How to Choose a Radiator Shop",
        href: "/blogs/how-to-choose-a-radiator-shop",
      },
    },
    {
      question: "How much does radiator repair typically cost?",
      answer:
        "Radiator repair costs vary based on the issue, vehicle type, and location. Simple repairs like fixing leaks can cost $100–$300 when repairable, while radiator replacement typically ranges from $400–$900+. Get quotes from multiple shops for the best price.",
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
    ...EXTRA_FAQS,
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroContent />

      <FeaturedBusinesses />

      <section className="pt-8 pb-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-gray-700 leading-relaxed">
            When your car&apos;s radiator needs repair, finding a trusted{" "}
            <strong>radiator repair shop near you</strong> is crucial. Our
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
            to locate trusted repair shops in your area. Prefer DIY maintenance?
            Browse our{" "}
            <Link
              href="/blogs"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              cooling system guides
            </Link>{" "}
            or shop{" "}
            <Link
              href="/shop"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              tools and supplies
            </Link>
            .
          </p>
        </div>
      </section>

      <FeaturedCategories />

      <PopularLocations />

      <HowItWorks />

      <WhyChoose />

      {featuredProducts.length > 0 ? (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AffiliateProductsSection
              products={featuredProducts}
              title="Tools & Supplies"
              description="Coolant, radiator caps, and diagnostic tools we recommend for common cooling system care."
              variant="showcase"
            />
          </div>
        </section>
      ) : null}

      <FAQSection faqs={faqs} includeSchema={false} />

      <section className="bg-blue-50 py-8">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-4 text-lg text-gray-700">
            Have more questions? Check out our comprehensive FAQ page for
            detailed answers—or explore guides and tools for cooling system care.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/faq"
              className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors duration-300 hover:bg-blue-700"
            >
              View All FAQs
            </Link>
            <Link
              href="/blogs"
              className="inline-flex items-center rounded-lg border border-blue-600 px-6 py-3 font-semibold text-blue-700 transition-colors duration-300 hover:bg-blue-100"
            >
              Read Blogs
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center rounded-lg border border-blue-600 px-6 py-3 font-semibold text-blue-700 transition-colors duration-300 hover:bg-blue-100"
            >
              Tools & Supplies
            </Link>
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
