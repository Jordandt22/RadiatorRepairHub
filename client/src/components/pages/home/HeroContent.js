"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

import { ToastProvider } from "@/contexts/ToastProvider";
import HeroSearchBar from "./HeroSearchBar";

function HeroContent({ popularStates = [] }) {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <section
      ref={heroRef}
      className="relative isolate flex min-h-[80svh] items-center overflow-hidden border-b border-border"
    >
      <Image
        src="/assets/images/rrh-hero-image.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_center]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-16 pt-24 sm:px-6 lg:px-8 lg:py-20 lg:pt-28">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0 }}
          animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-4 font-heading text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Find Trusted Radiator Repair Shops Near You
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-base text-white/75 md:text-lg">
            Search our directory of verified radiator repair businesses across
            the U.S.
          </p>

          <ToastProvider>
            <HeroSearchBar heroInView={heroInView} />
          </ToastProvider>

          {popularStates.length > 0 ? (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <div className="flex flex-wrap items-center justify-center gap-2">
                {popularStates.map((state) => (
                  <Link
                    key={state.code}
                    href={`/state/${state.code}`}
                    className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-white/15"
                  >
                    {state.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}

export default HeroContent;
