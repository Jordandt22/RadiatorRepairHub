import React from "react";
import Link from "next/link";

// Components
import HeroContent from "@/components/pages/home/HeroContent";
import FeaturedBusinesses from "@/components/pages/home/FeaturedBusinesses";
import FeaturedCategories from "@/components/pages/home/FeaturedCategories";
import PopularLocations from "@/components/pages/home/PopularLocations";
import HowItWorks from "@/components/pages/home/HowItWorks";
import ContactSection from "@/components/pages/home/ContactSection";
import FAQSection from "@/components/seo/FAQSection";
import AffiliateProductsSection from "@/components/blogs/AffiliateProductsSection";
import { HOME_KEYWORDS } from "@/lib/seo/keywords";
import { EXTRA_FAQS } from "@/lib/seo/faqs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { fetchActiveAffiliateProductsByAliases } from "@/lib/api/affiliate-products";
import { fetchTopPrimaryCategories } from "@/lib/api/categories";
import { fetchStateBusinessCounts } from "@/lib/api/location";

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
  const [affiliateRes, categoriesRes, statesRes] = await Promise.all([
    fetchActiveAffiliateProductsByAliases([
      "valvoline",
      "radiator-cap",
      "ir-thermometer",
    ]),
    fetchTopPrimaryCategories({ limit: 4 }),
    fetchStateBusinessCounts({ limit: 6 }),
  ]);

  const featuredProducts = affiliateRes.data?.products ?? [];
  const featuredCategories = categoriesRes.data?.categories ?? [];
  const popularStates = statesRes.data?.states ?? [];
  const heroStates = popularStates.slice(0, 4);

  const faqs = [
    {
      question: "How do I find radiator repair services in my area?",
      answer:
        "Use our search tool to enter your location and instantly see verified radiator repair shops near you. You can filter by ratings, reviews, hours, and services offered to find the best match for your needs.",
      relatedBlogs: [
        {
          title: "How to Choose a Radiator Shop",
          href: "/blogs/how-to-choose-a-radiator-shop",
        },
      ],
    },
    {
      question: "How much does radiator repair typically cost?",
      answer:
        "Radiator repair costs vary based on the issue, vehicle type, and location. Simple repairs like fixing leaks can cost $100–$300 when repairable, while radiator replacement typically ranges from $400–$900+. Get quotes from multiple shops for the best price.",
      relatedBlogs: [
        {
          title: "Radiator Repair Cost Guide",
          href: "/blogs/radiator-repair-cost-guide",
        },
      ],
    },
    {
      question: "What are the signs that my radiator needs repair?",
      answer:
        "Common signs include overheating, coolant leaks, low coolant levels, steam from under the hood, unusual smells, and dashboard warning lights. If you notice any of these, have your cooling system checked immediately.",
      relatedBlogs: [
        {
          title: "7 Signs Your Radiator Needs Repair",
          href: "/blogs/7-signs-your-radiator-needs-repair",
        },
        {
          title: "Why Is My Car Overheating?",
          href: "/blogs/why-is-my-car-overheating",
        },
      ],
    },
    ...EXTRA_FAQS,
  ];

  return (
    <div className="min-h-screen bg-background">
      <HeroContent popularStates={heroStates} />

      <FeaturedBusinesses />

      <FeaturedCategories categories={featuredCategories} />

      <PopularLocations states={popularStates} />

      <HowItWorks />

      {featuredProducts.length > 0 ? (
        <section className="bg-background py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

      <section className="bg-tint py-10">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-5 text-base text-foreground md:text-lg">
            Have more questions? See the full FAQ or browse our{" "}
            <Link
              href="/blogs"
              className="text-interactive underline hover:text-primary"
            >
              cooling system guides
            </Link>{" "}
            and{" "}
            <Link
              href="/shop"
              className="text-interactive underline hover:text-primary"
            >
              tools and supplies
            </Link>{" "}
            for DIY maintenance.
          </p>
          <div className="flex justify-center">
            <Link
              href="/faq"
              className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
            >
              View All FAQs
            </Link>
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
