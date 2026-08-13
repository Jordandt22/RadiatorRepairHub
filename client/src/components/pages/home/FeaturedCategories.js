import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Wrench,
  Thermometer,
  Fan,
  Car,
  Tag,
  CircleDot,
  Package,
} from "lucide-react";

const CATEGORY_ICONS = {
  "auto-repair-shop": Wrench,
  "radiator-repair-service": Thermometer,
  "auto-radiator-repair-service": Thermometer,
  "radiator-shop": Fan,
  "auto-body-shop": Car,
  "auto-parts-store": Package,
  "tire-shop": CircleDot,
};

function BusinessCount({ count }) {
  const n = Number(count) || 0;
  return (
    <>
      <span className="font-semibold text-green-700">{n.toLocaleString()}</span>{" "}
      {n === 1 ? "Business" : "Businesses"}
    </>
  );
}

function FeaturedCategories({ categories = [] }) {
  if (!categories.length) return null;

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
            Featured Categories
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
            Find a trusted <strong>radiator repair shop near you</strong> by
            service. Browse all{" "}
            <Link
              href="/categories"
              className="text-interactive underline hover:text-primary"
            >
              service categories
            </Link>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.slug] || Tag;
            return (
              <Link
                key={category.id}
                className="group rounded-lg border border-border bg-card p-6 transition-colors duration-200 hover:border-interactive"
                href={`/category/${category.slug}`}
              >
                <div className="mb-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-tint">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold capitalize text-foreground transition-colors group-hover:text-primary">
                  {category.name}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  <BusinessCount count={category.business_count} /> in this
                  category
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-interactive transition-colors group-hover:text-primary">
                  Browse shops
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
          >
            View All Categories
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedCategories;
