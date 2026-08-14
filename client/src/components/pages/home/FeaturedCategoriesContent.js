"use client";

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
import { motion } from "framer-motion";

import BusinessCount from "@/components/content/BusinessCount";
import AnimatedStaggerGrid, {
  AnimatedStaggerItem,
} from "@/components/ui/AnimatedStaggerGrid";
import { fadeIn, useHomeSectionInView } from "@/components/ui/homeSectionMotion";

const CATEGORY_ICONS = {
  "auto-repair-shop": Wrench,
  "radiator-repair-service": Thermometer,
  "auto-radiator-repair-service": Thermometer,
  "radiator-shop": Fan,
  "auto-body-shop": Car,
  "auto-parts-store": Package,
  "tire-shop": CircleDot,
};

export default function FeaturedCategoriesContent({ categories = [] }) {
  const { ref, inView, reduceMotion } = useHomeSectionInView();

  if (!categories.length) return null;

  return (
    <section ref={ref} className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn(reduceMotion)}
        >
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
        </motion.div>

        <AnimatedStaggerGrid
          inView={inView}
          reduceMotion={reduceMotion}
          className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4"
        >
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.slug] || Tag;
            return (
              <AnimatedStaggerItem
                key={category.id}
                reduceMotion={reduceMotion}
                className="h-full"
              >
                <Link
                  className="group flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-card-hover ease-out hover:scale-95 hover:border-interactive motion-reduce:transition-none motion-reduce:hover:scale-100"
                  href={`/category/${category.slug}`}
                >
                  <div className="mb-4 shrink-0">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-tint">
                      <Icon
                        className="h-5 w-5 text-primary"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                  <h3 className="mb-2 line-clamp-2 font-heading text-lg font-semibold capitalize text-foreground transition-colors group-hover:text-primary">
                    {category.name}
                  </h3>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                    <BusinessCount count={category.business_count} /> in this
                    category
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-interactive transition-colors group-hover:text-primary">
                    Browse shops
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </AnimatedStaggerItem>
            );
          })}
        </AnimatedStaggerGrid>

        <motion.div
          className="mt-10 flex justify-center"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn(reduceMotion, 0.24)}
        >
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-interactive hover:bg-primary/90"
          >
            View All Categories
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
