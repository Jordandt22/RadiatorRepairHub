"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import AnimatedBusinessGrid from "@/components/businesses/cards/AnimatedBusinessGrid";
import { fadeIn, useHomeSectionInView } from "@/components/ui/homeSectionMotion";

export default function FeaturedBusinessesContent({ businesses = [] }) {
  const { ref, inView, reduceMotion } = useHomeSectionInView();
  const list = businesses.slice(0, 3);

  return (
    <section
      ref={ref}
      className="section-atmosphere border-b border-border bg-card py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn(reduceMotion)}
        >
          <h2 className="mb-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
            Featured Businesses
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
            Top-rated radiator repair shops recommended by our community
          </p>
        </motion.div>

        {list.length > 0 ? (
          <AnimatedBusinessGrid
            businesses={list}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          />
        ) : (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">No Featured Businesses Found</p>
          </div>
        )}

        <motion.div
          className="mt-10 text-center"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn(reduceMotion, 0.24)}
        >
          <Link
            href="/featured"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 font-medium text-foreground transition-colors duration-200 hover:bg-muted"
          >
            View All Featured Businesses
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
