import React from "react";
import { preload } from "react-dom";

// Components
import HeroContent from "@/components/pages/home/HeroContent";
import FeaturedBusinesses from "@/components/pages/home/FeaturedBusinesses";
import FeaturedCategories from "@/components/pages/home/FeaturedCategories";
import PopularLocations from "@/components/pages/home/PopularLocations";
import HowItWorks from "@/components/pages/home/HowItWorks";
import HomeToolsSuppliesSection from "@/components/pages/home/HomeToolsSuppliesSection";
import HomeFaqCta from "@/components/pages/home/HomeFaqCta";
import ContactSection from "@/components/pages/home/ContactSection";
import FAQSection from "@/components/seo/FAQSection";
import { HOME_KEYWORDS } from "@/lib/seo/keywords";
import { EXTRA_FAQS } from "@/lib/seo/faqs";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { fetchActiveAffiliateProductsByAliases } from "@/lib/api/affiliate-products";
import { FEATURED_AFFILIATE_PRODUCT_ALIASES } from "@/lib/affiliateProducts";
import { fetchTopPrimaryCategories } from "@/lib/api/categories";
import {
  DIRECTORY_STATE_COUNTS_LIMIT,
  fetchDirectoryTotals,
  fetchStateBusinessCountsByLimit,
} from "@/lib/api/cachedReads";
import { HOME_HERO_IMAGE_PATH } from "@/lib/images";

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

export const revalidate = 120;

export default async function Home() {
  preload(HOME_HERO_IMAGE_PATH, {
    as: "image",
    fetchPriority: "high",
  });

  const [affiliateRes, categoriesRes, statesRes, directoryTotalsRes] =
    await Promise.all([
    fetchActiveAffiliateProductsByAliases(FEATURED_AFFILIATE_PRODUCT_ALIASES),
    fetchTopPrimaryCategories({ limit: 3 }),
    fetchStateBusinessCountsByLimit(DIRECTORY_STATE_COUNTS_LIMIT),
    fetchDirectoryTotals(),
  ]);

  const featuredProducts = affiliateRes.data?.products ?? [];
  const featuredCategories = categoriesRes.data?.categories ?? [];
  const popularStates = statesRes.data?.states ?? [];
  const heroStates = popularStates.slice(0, 4);
  const totalBusinesses = directoryTotalsRes.totalBusinesses ?? 0;
  const totalCities = directoryTotalsRes.totalCities ?? 0;

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
      <HeroContent
        popularStates={heroStates}
        totalBusinesses={totalBusinesses}
        totalCities={totalCities}
      />

      <FeaturedBusinesses />

      <FeaturedCategories categories={featuredCategories} />

      <PopularLocations states={popularStates} />

      <HowItWorks />

      <HomeToolsSuppliesSection products={featuredProducts} />

      <FAQSection faqs={faqs} includeSchema={false} />

      <HomeFaqCta />

      <ContactSection />
    </div>
  );
}
