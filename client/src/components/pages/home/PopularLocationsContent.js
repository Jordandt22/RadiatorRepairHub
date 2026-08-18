"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";

import BusinessCount from "@/components/content/BusinessCount";
import AnimatedStaggerGrid, {
  AnimatedStaggerItem,
} from "@/components/ui/AnimatedStaggerGrid";
import { fadeIn, useHomeSectionInView } from "@/components/ui/homeSectionMotion";

export default function PopularLocationsContent({ states = [] }) {
  const { ref, inView, reduceMotion } = useHomeSectionInView();

  if (!states.length) return null;

  return (
    <section
      ref={ref}
      className="section-atmosphere border-y border-border bg-card py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn(reduceMotion)}
        >
          <h2 className="mb-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
            Popular States
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
            Search by{" "}
            <Link
              href="/states"
              className="text-interactive underline hover:text-primary"
            >
              state and city
            </Link>{" "}
            to locate verified radiator repair shops in the most active areas
            across the U.S.
          </p>
        </motion.div>

        <AnimatedStaggerGrid
          inView={inView}
          reduceMotion={reduceMotion}
          className="grid grid-cols-1 gap-3 md:grid-cols-3"
        >
          {states.slice(0, 6).map((state, index) => (
            <AnimatedStaggerItem
              key={state.code}
              reduceMotion={reduceMotion}
              className={index >= 3 ? "max-md:hidden" : undefined}
            >
              <Link
                href={`/state/${state.code}`}
                className="group flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-card-hover ease-out hover:scale-95 hover:border-interactive motion-reduce:transition-none motion-reduce:hover:scale-100"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tint">
                  <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-heading text-base font-semibold text-foreground">
                    {state.name}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {state.code} ·{" "}
                    <BusinessCount count={state.business_count} />
                  </span>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-interactive"
                  aria-hidden="true"
                />
              </Link>
            </AnimatedStaggerItem>
          ))}
        </AnimatedStaggerGrid>

        <motion.div
          className="mt-10 flex justify-center"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn(reduceMotion, 0.24)}
        >
          <Link
            href="/states"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-interactive hover:bg-primary/90"
          >
            View All States
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
