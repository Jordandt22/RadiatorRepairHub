"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Wrench,
  Car,
  Settings,
  Zap,
  Shield,
  Clock,
  MapPin,
  Star,
  Gauge,
  Thermometer,
  Cog,
} from "lucide-react";

// Contexts
import { ToastProvider } from "@/contexts/ToastProvider";

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
        {/* Top row - mixed positioning */}
        <div className="absolute top-12 left-8 w-16 h-16 opacity-20 animate-float">
          <Car className="w-full h-full text-blue-300" />
        </div>
        <div
          className="absolute top-8 left-1/3 w-12 h-12 opacity-15 animate-bounce"
          style={{ animationDelay: "1s" }}
        >
          <Wrench className="w-full h-full text-blue-400" />
        </div>
        <div
          className="absolute top-16 right-1/3 w-14 h-14 opacity-12 animate-pulse"
          style={{ animationDelay: "2s" }}
        >
          <Settings className="w-full h-full text-blue-300" />
        </div>
        <div
          className="absolute top-10 right-8 w-10 h-10 opacity-18 animate-float"
          style={{ animationDelay: "0.5s" }}
        >
          <Shield className="w-full h-full text-blue-200" />
        </div>

        {/* Middle left column - some moved to edges */}
        <div
          className="absolute top-1/3 left-50 w-14 h-14 opacity-12 animate-bounce"
          style={{ animationDelay: "1.5s" }}
        >
          <Zap className="w-full h-full text-blue-400" />
        </div>
        <div
          className="absolute top-1/2 left-1/3 w-11 h-11 opacity-14 animate-float"
          style={{ animationDelay: "3s" }}
        >
          <Clock className="w-full h-full text-blue-300" />
        </div>
        <div
          className="absolute top-2/3 left-8 w-12 h-12 opacity-16 animate-pulse"
          style={{ animationDelay: "2.5s" }}
        >
          <Gauge className="w-full h-full text-blue-400" />
        </div>

        {/* Middle right column - some moved to edges */}
        <div
          className="absolute top-1/3 right-75 w-13 h-13 opacity-16 animate-bounce"
          style={{ animationDelay: "0.8s" }}
        >
          <MapPin className="w-full h-full text-blue-400" />
        </div>
        <div
          className="absolute top-1/2 right-1/3 w-8 h-8 opacity-12 animate-float"
          style={{ animationDelay: "3.5s" }}
        >
          <Cog className="w-full h-full text-blue-300" />
        </div>
        <div
          className="absolute top-2/3 right-40 w-10 h-10 opacity-15 animate-pulse"
          style={{ animationDelay: "2.8s" }}
        >
          <Thermometer className="w-full h-full text-blue-200" />
        </div>

        {/* Bottom row - mixed positioning */}
        <div
          className="absolute bottom-24 left-1/5 w-9 h-9 opacity-13 animate-pulse-slow"
          style={{ animationDelay: "1.2s" }}
        >
          <Star className="w-full h-full text-blue-200" />
        </div>
        <div
          className="absolute bottom-20 left-2/5 w-20 h-20 opacity-10 animate-pulse-slow"
          style={{ animationDelay: "0.3s" }}
        >
          <Car className="w-full h-full text-blue-200" />
        </div>
        <div
          className="absolute bottom-28 right-1/5 w-12 h-12 opacity-17 animate-bounce"
          style={{ animationDelay: "2.2s" }}
        >
          <Gauge className="w-full h-full text-blue-400" />
        </div>
        <div
          className="absolute bottom-16 right-4 w-11 h-11 opacity-14 animate-float"
          style={{ animationDelay: "1.8s" }}
        >
          <Clock className="w-full h-full text-blue-300" />
        </div>

        {/* Additional gradient orbs for depth */}
        <div className="absolute top-1/4 left-1/5 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-1/4 right-1/5 w-24 h-24 bg-blue-400/15 rounded-full blur-lg animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-20 h-20 bg-blue-300/8 rounded-full blur-lg animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/3 left-1/4 w-28 h-28 bg-blue-600/6 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/3 w-16 h-16 bg-blue-200/12 rounded-full blur-md animate-pulse-slow"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
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
          <ToastProvider>
            <HeroSearchBar heroInView={heroInView} />
          </ToastProvider>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroContent;
