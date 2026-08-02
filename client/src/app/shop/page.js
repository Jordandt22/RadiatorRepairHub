import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BreadcrumbList from "@/components/seo/BreadcrumbList";
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
        brand: {
          "@type": "Brand",
          name: "Amazon",
        },
      },
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {products.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      ) : null}

      <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <BreadcrumbList items={breadcrumbItems} variant="light" />

        <header className="mb-10">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Shop
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600">
            Cooling system tools and supplies we recommend alongside our repair
            guides, chosen for common DIY top-offs, diagnosis, and maintenance.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            As an Amazon Associate, RadiatorRepairHub earns from qualifying
            purchases.
          </p>
        </header>

        <section className="mb-10 space-y-4 text-base leading-relaxed text-gray-700 md:text-lg">
          <p className="bg-gray-100 p-4 rounded-lg">
            Start with the right coolant for your vehicle, a correctly rated
            radiator cap, and simple tools that help you spot overheating early.
            Always match coolant type and cap pressure to your owner&apos;s
            manual and never open a hot cooling system.
          </p>
          <p>
            Prefer a walkthrough first? Read{" "}
            <Link
              href="/blogs/radiator-cap-symptoms-and-replacement"
              className="font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-800"
            >
              radiator cap symptoms
            </Link>
            ,{" "}
            <Link
              href="/blogs/radiator-flush-what-to-expect-and-cost"
              className="font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-800"
            >
              what a radiator flush involves
            </Link>
            , or{" "}
            <Link
              href="/blogs/why-is-my-car-overheating"
              className="font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 hover:text-blue-800"
            >
              why cars overheat
            </Link>
            .
          </p>
        </section>

        <ShopProductsList products={products} />

        <section className="mt-14 border-t border-gray-200 pt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-gray-900">
                Need Guidance First?
              </h2>
              <p className="mt-1 text-gray-600">
                Read our cooling system guides before you buy or DIY.
              </p>
            </div>
            <Link
              href="/blogs"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              View blogs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ShopPage;
