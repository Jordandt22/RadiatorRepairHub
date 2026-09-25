"use client";

import FAQSection from "@/components/seo/FAQSection";
import { Button } from "@/components/ui/button";
import FeaturedUpgradeCtaLabel from "@/components/pages/pricing/FeaturedUpgradeCtaLabel";
import { featuredUpgradeButtonClass } from "@/components/pages/pricing/featuredUpgradeStyles";
import {
  FEATURED_MONTHLY_EQUIVALENT_LABEL,
  FEATURED_YEARLY_PRICE,
  FEATURED_YEARLY_PRICE_WITH_INTERVAL,
} from "@/lib/featuredPricing";
import { cn } from "@/lib/utils";

export const PRICING_FAQS = [
  {
    id: "pricing-what-featured",
    question: "What do I get with a Featured listing?",
    answer:
      "Featured adds a Featured badge, priority placement in search and on state, city, category, and postal code pages, up to 10 shop photos (claimed listings include 3), full listing analytics, and competitor insights for other public shops in your city. Claiming stays free; Featured is the optional paid upgrade.",
  },
  {
    id: "pricing-cost",
    question: "How much does Featured cost?",
    answer: `Featured is $${FEATURED_YEARLY_PRICE} per year (about ${FEATURED_MONTHLY_EQUIVALENT_LABEL} per month), billed yearly through Stripe. Applicable taxes may be added at checkout. One extra radiator sale typically covers the whole year.`,
  },
  {
    id: "pricing-claim-first",
    question: "Do I need to claim my listing first?",
    answer:
      "Yes. Featured is only available for claimed listings you own. Claim for free, then upgrade from this page.",
    relatedBlogs: [{ title: "How to Claim", href: "/how-to-claim" }],
  },
  {
    id: "pricing-cancel",
    question: "Can I cancel anytime?",
    answer:
      "Yes. Manage or cancel from the Stripe billing portal in your account Settings. Canceling stops future renewals; Featured generally continues until the end of the paid period. Fees for the current billing period are non-refundable.",
  },
  {
    id: "pricing-guarantee",
    question: "Does Featured guarantee calls or sales?",
    answer:
      "No. Demand stats on this page are directory-wide activity, not a promise for your shop. Featured improves placement and listing tools; leads still depend on local demand and how drivers choose a shop.",
  },
  {
    id: "pricing-billing",
    question: "How does billing work?",
    answer:
      "You pay yearly through Stripe Checkout at the then-current Featured price (see this page). Your card is charged in advance for each billing period. Promotion codes may apply at checkout when we provide them. You can cancel anytime to stop renewals. Featured fees are non-refundable for the current period, including if you unclaim the listing or delete your account.",
    relatedBlogs: [{ title: "Terms of Service", href: "/terms" }],
  },
  {
    id: "pricing-promo",
    question: "Can I use a promo or discount code?",
    answer:
      "Yes, when we provide a code. Enter it on the Stripe Checkout page. Codes may make the first year free or discounted; unless the coupon covers later periods, renewals bill at the then-current Featured price. You can cancel anytime in Settings to stop renewals; canceling during a promo-covered period generally keeps Featured until that period ends, with no refund for unused time.",
  },
];

export default function PricingFaqSection({
  onUpgradeClick,
  upgradeBusy = false,
  upgradeLoading = false,
  isSubmitting = false,
}) {
  return (
    <>
      <FAQSection
        faqs={PRICING_FAQS}
        title="Featured Pricing FAQ"
        description="Answers to common questions about cost, claiming, and what Featured includes."
        includeSchema
        animateOnScroll={false}
      />
      <div className="border-b border-border bg-background py-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
          <p className="text-base text-muted-foreground md:text-lg">
            Ready to get more visibility? Upgrade a claimed listing for{" "}
            {FEATURED_YEARLY_PRICE_WITH_INTERVAL}.
          </p>
          <Button
            type="button"
            className={cn(featuredUpgradeButtonClass)}
            disabled={upgradeBusy}
            aria-busy={upgradeBusy}
            onClick={onUpgradeClick}
          >
            <FeaturedUpgradeCtaLabel
              isSubmitting={isSubmitting}
              isLoading={upgradeLoading}
            />
          </Button>
        </div>
      </div>
    </>
  );
}
