"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import AffiliateProductCard from "@/components/blogs/AffiliateProductCard";
import AnimatedStaggerGrid, {
  AnimatedStaggerItem,
} from "@/components/ui/AnimatedStaggerGrid";
import { fadeIn, useHomeSectionInView } from "@/components/ui/homeSectionMotion";

function AffiliateDisclosure({ className = "" }) {
  return (
    <p className={`text-xs leading-relaxed text-muted-foreground ${className}`}>
      As an Amazon Associate, RadiatorRepairHub earns from qualifying purchases.
    </p>
  );
}

export default function HomeToolsSuppliesSection({ products = [] }) {
  const { ref, inView, reduceMotion } = useHomeSectionInView();

  if (!products.length) return null;

  return (
    <section ref={ref} className="bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto mb-4 max-w-3xl space-y-1 text-center"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn(reduceMotion)}
        >
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Tools & Supplies
          </h2>
          <p className="text-base text-muted-foreground md:text-lg">
            Coolant, radiator caps, and diagnostic tools we recommend for common
            cooling system care.
          </p>
          <AffiliateDisclosure className="mx-auto max-w-3xl" />
        </motion.div>

        <AnimatedStaggerGrid
          inView={inView}
          reduceMotion={reduceMotion}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {products.map((product) => (
            <AnimatedStaggerItem key={product.id} reduceMotion={reduceMotion}>
              <AffiliateProductCard
                product={product}
                variant="showcase"
              />
            </AnimatedStaggerItem>
          ))}
        </AnimatedStaggerGrid>

        <motion.div
          className="mt-6 text-center"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn(reduceMotion, 0.24)}
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-interactive transition-colors hover:text-primary"
          >
            Browse all tools & supplies
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
