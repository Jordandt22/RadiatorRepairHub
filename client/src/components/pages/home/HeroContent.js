"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";

import HeroSearchBar from "./HeroSearchBar";
import HeroStatBox from "./HeroStatBox";
import StrokeText from "@/components/ui/StrokeText";
import FoldText from "@/components/ui/FoldText";
import { STICKY_NAVBAR_OFFSET_CLASS } from "@/lib/layout/siteHeader";

function HeroContent({
  popularStates = [],
  totalBusinesses = 0,
  totalCities = 0,
}) {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const reduceMotion = useReducedMotion();
  const headerPullClass = "-mt-16";
  const headerOffsetClass = STICKY_NAVBAR_OFFSET_CLASS;

  const strokeTextProps = {
    strokeColor: "#FFFFFF",
    fillColor: "#FFFFFF",
    fontSize: 60,
    fontWeight: 600,
    letterSpacing: 2,
    strokeWidth: 1.8,
    drawDuration: 1,
    fillDelay: 0.00,
    delay: 0.00,
  };
  return (
    <section
      ref={heroRef}
      className={`relative isolate ${headerPullClass} flex min-h-[80svh] items-center overflow-hidden border-b border-border`}
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

      <div
        className={`relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20 ${headerOffsetClass}`}
      >
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 font-heading">
            <span className="sr-only">
              Find Trusted Radiator Repair Shops Near You
            </span>
            <span className="block" aria-hidden="true">
              <StrokeText
                text="Find Trusted Radiator"
                strokeColor="#FFFFFF"
                fillColor="#FFFFFF"
                {...strokeTextProps}
              />
              <StrokeText
                text="Repair Shops Near You"
                strokeColor="#FFFFFF"
                fillColor="#FFFFFF"
                {...strokeTextProps}
                delay={0.18}
              />
            </span>
          </h1>
          <p className="mx-auto mb-6 max-w-2xl text-base text-white/75 md:text-lg">
            <FoldText
              text="Search our directory of verified radiator repair businesses across the U.S."
              splitBy="word"
              hinge="top"
              duration={0.65}
              stagger={0.05}
              delay={0.55}
              creaseShading={0.35}
              color="rgba(255, 255, 255, 1)"
              fontWeight={400}
            />
          </p>

          <HeroSearchBar heroInView={heroInView} />

          {popularStates.length > 0 ? (
            <motion.div
              className="mt-6 flex flex-wrap items-center justify-center gap-2"
              initial="hidden"
              animate={heroInView ? "visible" : "hidden"}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: reduceMotion ? 0 : 0.08,
                    delayChildren: reduceMotion ? 0 : 1.85,
                  },
                },
              }}
            >
              {popularStates.map((state) => (
                <motion.div
                  key={state.code}
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        duration: reduceMotion ? 0 : 0.4,
                        ease: "easeOut",
                      },
                    },
                  }}
                >
                  <Link
                    href={`/state/${state.code}`}
                    className="inline-block rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm transition-interactive hover:border-white/40 hover:bg-white/15"
                  >
                    {state.name}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : null}

          <motion.div
            className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-3"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: reduceMotion ? 0 : 0.12,
                  delayChildren: reduceMotion ? 0 : 2.15,
                },
              },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: reduceMotion ? 0 : 0.45,
                    ease: "easeOut",
                  },
                },
              }}
            >
              <HeroStatBox
                label="Total Businesses"
                value={totalBusinesses}
                heroInView={heroInView}
              />
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: reduceMotion ? 0 : 0.45,
                    ease: "easeOut",
                  },
                },
              }}
            >
              <HeroStatBox
                label="Total Cities"
                value={totalCities}
                heroInView={heroInView}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroContent;
