import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BreadcrumbList from "@/components/seo/BreadcrumbList";
import ShopProductsList from "@/components/pages/shop/ShopProductsList";
import { fetchActiveAffiliateProducts } from "@/lib/api/affiliate-products";
import { buildPageMetadata } from "@/lib/seo/metadata";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <BreadcrumbList items={breadcrumbItems} variant="light" />

        <header className="mb-10">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Shop
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-600">
            Cooling system tools and supplies we recommend alongside our repair
            guides.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            As an Amazon Associate, RadiatorRepairHub earns from qualifying
            purchases.
          </p>
        </header>

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
