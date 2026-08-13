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
    <div className="min-h-screen bg-background">
      <HeroContent />

      <FeaturedBusinesses />

      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-muted-foreground leading-relaxed">
            When your car&apos;s radiator needs repair, finding a trusted{" "}
            <strong>radiator repair shop near you</strong> is crucial. Our
            comprehensive directory connects you with certified specialists who
            can diagnose, repair, and maintain your vehicle&apos;s cooling
            system. From{" "}
            <Link
              href="/category/radiator-repair-service"
              className="text-interactive hover:text-primary underline"
            >
              radiator repair services
            </Link>{" "}
            to{" "}
            <Link
              href="/category/auto-repair-shop"
              className="text-interactive hover:text-primary underline"
            >
              general auto repair
            </Link>
            , find the right professional for your needs. Browse our{" "}
            <Link
              href="/categories"
              className="text-interactive hover:text-primary underline"
            >
              service categories
            </Link>{" "}
            or search by{" "}
            <Link
              href="/states"
              className="text-interactive hover:text-primary underline"
            >
              state and city
            </Link>{" "}
            to locate trusted repair shops in your area. Prefer DIY maintenance?
            Browse our{" "}
            <Link
              href="/blogs"
              className="text-interactive hover:text-primary underline"
            >
              cooling system guides
            </Link>{" "}
            or shop{" "}
            <Link
              href="/shop"
              className="text-interactive hover:text-primary underline"
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
        <section className="bg-background py-16">
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

      <section className="bg-tint py-10">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="mb-5 text-lg text-foreground">
            Have more questions? Check out our comprehensive FAQ page for
            detailed answers—or explore guides and tools for cooling system care.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            <Link
              href="/faq"
              className="inline-flex items-center rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
            >
              View All FAQs
            </Link>
            <Link
              href="/blogs"
              className="inline-flex items-center font-medium text-interactive transition-colors duration-200 hover:text-primary"
            >
              Read Blogs
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center font-medium text-interactive transition-colors duration-200 hover:text-primary"
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
