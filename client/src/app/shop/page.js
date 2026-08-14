import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PageHeader from "@/components/layout/Header/PageHeader";
import ShopProductsList from "@/components/pages/shop/ShopProductsList";
import { fetchActiveAffiliateProducts } from "@/lib/api/affiliate-products";
import { buildPageMetadata, SITE_URL } from "@/lib/seo/metadata";

export const revalidate = 60;

export const metadata = buildPageMetadata({
  title: "Shop | Cooling System Tools & Supplies - RadiatorRepairHub",
  description:
    "Browse radiator caps, coolant, funnels, and diagnostic tools recommended for cooling system care. As an Amazon Associate, we earn from qualifying purchases.",
  keywords:
    "radiator cap, coolant, antifreeze, infrared thermometer, coolant funnel, radiator tools, Amazon",
  path: "/shop",
});

async function ShopPage() {
  const { data } = await fetchActiveAffiliateProducts();
  const products = data?.products ?? [];

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
  ];

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cooling System Tools & Supplies",
    description:
      "Recommended radiator and cooling system products for DIY maintenance and diagnosis.",
    url: `${SITE_URL}/shop`,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.title,
        description: product.description || undefined,
        image: product.image_url || undefined,
        url: product.affiliate_link || product.product_link,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      {products.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      ) : null}

      <PageHeader
        breadcrumbItems={breadcrumbItems}
        pageTitle="Shop"
        pageDescription="Cooling system tools and supplies we recommend alongside our repair guides—for common DIY top-offs, diagnosis, and maintenance."
        headerLink={{
          label: "View blogs",
          href: "/blogs",
        }}
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="mb-3 text-sm text-muted-foreground">
          As an Amazon Associate, RadiatorRepairHub earns from qualifying
          purchases.
        </p>

        <div className="mb-10 rounded-lg border border-primary/20 bg-tint p-4 md:p-5">
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Start with the right coolant for your vehicle, a correctly rated
            radiator cap, and simple tools that help you spot overheating early.
            Always match coolant type and cap pressure to your owner&apos;s
            manual and never open a hot cooling system.
          </p>
        </div>

        <ShopProductsList products={products} />

        <section className="mt-14 space-y-8 border-t border-border pt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Need guidance first?
              </h2>
              <p className="mt-1 text-muted-foreground">
                Read our cooling system guides before you buy or DIY.
              </p>
            </div>
            <Link
              href="/blogs"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
            >
              View blogs
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-xl font-semibold text-foreground">
                Looking for a shop?
              </h2>
              <p className="mt-1 text-muted-foreground">
                Search the directory for radiator repair near you.
              </p>
            </div>
            <Link
              href="/search?page=1&sort=most_reviews"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-muted"
            >
              Search directory
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ShopPage;
