import React from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Flag,
  Lock,
  MapPinned,
  MessageSquare,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Store,
} from "lucide-react";
import PageHeader from "@/components/layout/Header/PageHeader";
import DirectoryDisclaimer from "@/components/content/DirectoryDisclaimer";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";

const pageTitle = "About RadiatorRepairHub | Radiator Repair Directory";
const pageDescription =
  "Learn about RadiatorRepairHub, a directory for finding radiator repair shops across the U.S. Search by location, compare listings, and contact shops directly.";

export const metadata = buildPageMetadata({
  title: pageTitle,
  description: pageDescription,
  keywords:
    "about radiator repair hub, radiator repair directory, cooling system experts, auto repair directory, radiator specialists",
  path: "/about",
});

const FEATURES = [
  {
    title: "Search by location",
    description: "Enter a city, state, or ZIP and browse shops near you.",
    icon: Search,
  },
  {
    title: "Filter results",
    description:
      "Narrow by rating, review count, open hours, categories, and features. Sort by reviews or rating.",
    icon: SlidersHorizontal,
  },
  {
    title: "Business profiles",
    description:
      "See address, phone, hours, services, photos, and reviews on each listing.",
    icon: Store,
  },
  {
    title: "Quick contact",
    description:
      "Message a claimed shop from its page, or call using the number listed there.",
    icon: MessageSquare,
  },
  {
    title: "Browse by area or category",
    description:
      "Explore by state, city, or service category when you are not searching for a specific place.",
    icon: MapPinned,
  },
];

const TRUST_ITEMS = [
  {
    title: "Listing quality",
    description:
      "We work to list genuine radiator repair businesses and keep the directory updated, including reviewing Get Listed submissions and Report Info tips.",
    icon: BadgeCheck,
  },
  {
    title: "Claimed listings",
    description:
      "A claimed listing means the owner verified access to the listing email and created an account. It does not replace calling ahead to confirm current services and hours.",
    icon: ShieldCheck,
  },
  {
    title: "Report problems",
    description:
      "Use Report Info on a business page if contact details are wrong or content looks off.",
    icon: Flag,
  },
];

const DRIVER_LINKS = [
  {
    title: "Search the directory",
    description: "Find radiator repair shops by city, ZIP, or category",
    href: "/search?page=1&sort=most_reviews",
  },
  {
    title: "FAQ",
    description: "Answers about repair, claiming, and using the directory",
    href: "/faq",
  },
  {
    title: "Blogs",
    description: "Guides and tips on radiator repair and cooling system care",
    href: "/blogs",
  },
  {
    title: "Tools & supplies",
    description: "Browse coolant, radiator caps, funnels, and diagnostic tools",
    href: "/shop",
  },
];

const OWNER_LINKS = [
  {
    title: "Get listed",
    description: "Add your radiator repair shop to the directory",
    href: "/get-listed",
  },
  {
    title: "How to claim",
    description: "Claim an existing listing and manage it with an account",
    href: "/how-to-claim",
  },
  {
    title: "Contact us",
    description: "Reach the team about listings, partnerships, or the site",
    href: "/contact",
  },
];

function TopicLink({ title, description, href }) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-border bg-background p-6 transition-colors duration-200 hover:border-interactive"
    >
      <h3 className="mb-2 font-heading text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}

function AboutPage() {
  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About RadiatorRepairHub",
    description:
      "Learn about RadiatorRepairHub, a directory for finding radiator repair shops across the U.S.",
    url: `${SITE_URL}/about`,
    mainEntity: {
      "@id": `${SITE_URL}/#organization`,
    },
  };

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutPageSchema),
        }}
      />
      <div className="min-h-screen bg-background">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          pageTitle="About RadiatorRepairHub"
          pageDescription="A directory focused on radiator and cooling system repair. Search by location, compare listings, and contact shops directly."
          headerLink={{
            href: "/search?page=1&sort=most_reviews",
            label: "Search the directory",
          }}
        />

        <div className="mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
          <section className="rounded-lg border border-border bg-card p-6 md:p-8">
            <h2 className="mb-4 font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Why We Built It
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Generic auto repair directories mix in shops that barely touch
              radiators, and listings often go stale. We built a directory aimed
              at cooling system work so you can browse shops that actually do
              radiator repair, with filters and profiles that show services,
              hours, reviews, and contact details.
            </p>
          </section>

          <section>
            <h2 className="mb-6 font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              What You Can Do
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {FEATURES.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-lg border border-border bg-card p-6"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-tint">
                    <Icon className="size-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-6 font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              How We Keep Listings Honest
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {TRUST_ITEMS.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-lg border border-border bg-card p-6"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-tint">
                    <Icon className="size-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-tint">
                  <Lock className="size-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                  Privacy
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  We are clear about how the directory works and how we handle
                  visitor information. See our{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-interactive underline hover:text-primary"
                  >
                    Privacy Policy
                  </Link>{" "}
                  for details.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              For Drivers and Shop Owners
            </h2>
            <p className="mb-8 leading-relaxed text-muted-foreground">
              Whether you are looking for a shop or managing a listing, your
              feedback helps us keep the directory useful.
            </p>

            <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
              For drivers
            </h3>
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {DRIVER_LINKS.map((link) => (
                <TopicLink key={link.href} {...link} />
              ))}
            </div>

            <h3 className="mb-4 font-heading text-lg font-semibold text-foreground">
              For shop owners
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {OWNER_LINKS.map((link) => (
                <TopicLink key={link.href} {...link} />
              ))}
            </div>
          </section>

          <DirectoryDisclaimer className="mb-4" />
        </div>
      </div>
    </>
  );
}

export default AboutPage;
