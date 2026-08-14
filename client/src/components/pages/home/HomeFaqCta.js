"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { fadeIn, useHomeSectionInView } from "@/components/ui/homeSectionMotion";

export default function HomeFaqCta() {
  const { ref, inView, reduceMotion } = useHomeSectionInView();

  return (
    <section ref={ref} className="bg-tint py-10">
      <motion.div
        className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={fadeIn(reduceMotion)}
      >
        <p className="mb-5 text-base text-foreground md:text-lg">
          Have more questions? See the full FAQ or browse our{" "}
          <Link
            href="/blogs"
            className="text-interactive underline hover:text-primary"
          >
            cooling system guides
          </Link>{" "}
          and{" "}
          <Link
            href="/shop"
            className="text-interactive underline hover:text-primary"
          >
            tools and supplies
          </Link>{" "}
          for DIY maintenance.
        </p>
        <div className="flex justify-center">
          <Link
            href="/faq"
            className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-interactive hover:bg-primary/90"
          >
            View All FAQs
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
