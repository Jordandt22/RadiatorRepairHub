"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

// Contexts
import { ToastProvider } from "@/contexts/ToastProvider";

// Components
import HeroSearchBar from "./HeroSearchBar";

function HeroContent() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <section ref={heroRef} className="relative bg-primary py-16">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-32">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 font-heading">
            Find Trusted Radiator Repair
            <span className="block mt-3 text-white/80">Shops Near You</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto">
            Search our directory of verified radiator repair businesses across
            the U.S.
          </p>

          {/* Search Bar */}
          <ToastProvider>
            <HeroSearchBar heroInView={heroInView} />
          </ToastProvider>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroContent;
