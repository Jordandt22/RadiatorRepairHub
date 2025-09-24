"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Wrench, Car } from "lucide-react";

// Components
import HeroSearchBar from "./HeroSearchBar";

function HeroContent() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden py-16"
      style={{
        background:
          "linear-gradient(-45deg, #0f172a, #1e3a8a, #1e293b, #1e40af, #0f172a, #1e3a8a)",
        backgroundSize: "400% 400%",
        animation: "gradient-shift 12s ease infinite",
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating radiator/car elements */}
        <div className="absolute top-20 left-10 w-16 h-16 opacity-20 animate-float">
          <Car className="w-full h-full text-blue-300" />
        </div>
        <div
          className="absolute top-40 right-20 w-12 h-12 opacity-15 animate-bounce"
          style={{ animationDelay: "1s" }}
        >
          <Wrench className="w-full h-full text-blue-400" />
        </div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 opacity-10 animate-pulse-slow">
          <Car className="w-full h-full text-blue-200" />
        </div>

        {/* Moving gradient orbs */}
        <div className="absolute top-1/4 left-1/5 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-1/4 right-1/5 w-24 h-24 bg-blue-400/15 rounded-full blur-lg animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-10 font-heading">
            Find Trusted Radiator Repair
            <span className="block text-blue-300 mt-4">Shops Near You</span>
          </h1>
          <p className="text-xl text-gray-300 mb-16 max-w-3xl mx-auto font-body">
            Search our directory of verified radiator repair businesses across
            the U.S.
          </p>

          {/* Search Bar */}
          <HeroSearchBar heroInView={heroInView} />
        </motion.div>
      </div>
    </section>
  );
}

export default HeroContent;
