import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/layout/Header/PageHeader";
import FAQPageContent from "@/components/pages/faq/FAQPageContent";
import AffiliateProductsSection from "@/components/blogs/AffiliateProductsSection";
import { FAQ_KEYWORDS } from "@/lib/seo/keywords";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { fetchActiveAffiliateProductsByAliases } from "@/lib/api/affiliate-products";
import {
  getAllFaqsFlat,
  getFaqSectionsWithItems,
} from "@/lib/data/faq";

const faqTitle =
  "Frequently Asked Questions | Radiator Repair Help & Support - RadiatorRepairHub";
const faqDescription =
  "Answers about radiator repair, finding shops near you, claiming a listing, Featured upgrades, and using RadiatorRepairHub.";

export const metadata = buildPageMetadata({
  title: faqTitle,
  description: faqDescription,
  keywords: FAQ_KEYWORDS,
  path: "/faq",
});

export const revalidate = 60;

const RELATED_TOPICS = [
  {
    title: "Service Categories",
    description: "Browse different types of radiator and auto repair services",
    href: "/categories",
  },
  {
    title: "Featured Businesses",
    description: "Featured partners with extra visibility in the directory",
    href: "/featured",
  },
  {
    title: "Featured Pricing",
    description: "Optional paid upgrade for claimed listings—badge, search priority, extra photos, Featured page",
    href: "/pricing",
  },
  {
    title: "How to Claim",
    description: "Claim an existing listing and manage it with a business account",
    href: "/how-to-claim",
  },
  {
    title: "Business Owners",
    description: "Get your radiator repair business listed on our platform",
    href: "/get-listed",
  },
  {
    title: "Blogs",
    description: "Read guides and tips on radiator repair and cooling system care",
    href: "/blogs",
  },
  {
    title: "Tools & Supplies",
    description: "Browse coolant, radiator caps, funnels, and diagnostic tools",
    href: "/shop",
  },
];

export default async function FAQPage() {
  const { data: affiliateData } = await fetchActiveAffiliateProductsByAliases([
    "valvoline",
    "radiator-cap",
    "coolant-funnel",
  ]);
  const featuredProducts = affiliateData?.products ?? [];
  const sections = getFaqSectionsWithItems();
  const allFaqs = getAllFaqsFlat();

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "FAQ", url: "/faq" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle="Frequently Asked Questions"
        pageDescription="Get answers to common questions about radiator repair services and find the help you need"
        headerLink={{
          label: "Search",
          href: "/search?page=1&sort=verified",
        }}
      />

      <FAQPageContent sections={sections} allFaqs={allFaqs} />

      {featuredProducts.length > 0 ? (
        <section className="border-t border-border bg-card py-16">
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

      <section className="border-t border-border bg-background py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-heading text-3xl font-semibold text-foreground">
              Still have questions?
            </h2>
            <p className="text-lg text-muted-foreground">
              Search the directory for a shop near you, or contact us if you
              need help with a listing or the site.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <h3 className="mb-4 font-heading text-xl font-semibold text-foreground">
                Find a Repair Shop
              </h3>
              <p className="mb-6 text-muted-foreground">
                Search our directory of verified radiator repair shops in your
                area.
              </p>
              <Link
                href="/search?page=1&sort=verified"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
              >
                Search Now
              </Link>
            </div>

            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <h3 className="mb-4 font-heading text-xl font-semibold text-foreground">
                Contact Support
              </h3>
              <p className="mb-6 text-muted-foreground">
                Have a specific question? Our support team is here to help.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors duration-200 hover:bg-muted"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-heading text-3xl font-semibold text-foreground">
              Related Topics
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore more resources to help with your radiator repair needs
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {RELATED_TOPICS.map((topic) => (
              <Link
                key={topic.href}
                href={topic.href}
                className="group rounded-lg border border-border bg-background p-6 transition-colors duration-200 hover:border-interactive"
              >
                <h3 className="mb-2 font-heading text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                  {topic.title}
                </h3>
                <p className="text-sm text-muted-foreground">{topic.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
