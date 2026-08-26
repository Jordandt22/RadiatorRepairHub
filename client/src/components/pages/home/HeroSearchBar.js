"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import { usePostHog } from "posthog-js/react";

import { useToast } from "@/contexts/ToastProvider";
import { getBusinessSearchAnalyticsProps } from "@/lib/analytics/businessSearch";

function HeroSearchBar({ heroInView }) {
  const [search, setSearch] = useState("");
  const { showCustomError } = useToast();
  const router = useRouter();
  const posthog = usePostHog();
  const reduceMotion = useReducedMotion();

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const submitSearch = () => {
    if (search === "") {
      posthog?.capture(
        "business_search_submitted",
        getBusinessSearchAnalyticsProps(
          { title: "" },
          { source: "hero", page: 1, sort_option: "featured" }
        )
      );
      router.push(`/search?page=1&sort=featured`);
      return;
    }

    if (search.length > 50) {
      return showCustomError(
        "Please keep your search under 50 characters..",
        "Search Input Too Long"
      );
    }

    const specialCharacters = new RegExp(
      /[!@#$%^*()+\=\[\]{};:"\\|,.<>\/?]/,
      "gi"
    );
    if (specialCharacters.test(search)) {
      return showCustomError(
        "Allowed: ', -, &, _",
        "Invalid Special Characters"
      );
    }

    const title = search.trim();
    posthog?.capture(
      "business_search_submitted",
      getBusinessSearchAnalyticsProps(
        { title },
        { source: "hero", page: 1, sort_option: "featured" }
      )
    );
    router.push(
      `/search?title=${encodeURIComponent(title)}&page=1&sort=featured`
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      submitSearch();
    }
  };

  return (
    <motion.div
      className="mx-auto w-full max-w-2xl"
      initial={{ opacity: 0 }}
      animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay: reduceMotion ? 0 : 1.35,
        ease: "easeOut",
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="hero-search" className="sr-only">
            Search for radiator repair shops
          </label>
          <input
            id="hero-search"
            type="text"
            placeholder="Enter a business name..."
            className="w-full rounded-full border border-white/20 bg-white px-6 py-3.5 text-center text-lg text-foreground placeholder-muted-foreground shadow-sm outline-none transition-all duration-200 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 sm:text-left md:pr-36"
            onChange={handleSearch}
            value={search}
            onKeyDown={handleKeyPress}
            aria-label="Search for radiator repair shops"
            aria-describedby="search-help"
          />
          <button
            type="button"
            className="absolute top-1.5 right-1.5 bottom-1.5 hidden cursor-pointer items-center justify-center rounded-full bg-primary px-5 font-medium text-primary-foreground transition-interactive hover:bg-primary/90 sm:flex"
            onClick={submitSearch}
            aria-label="Search for radiator repair shops"
          >
            <Search className="mr-2 h-5 w-5" aria-hidden="true" />
            Search
          </button>
        </div>

        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-center rounded-full bg-primary px-6 py-3.5 font-medium text-primary-foreground transition-interactive hover:bg-primary/90 sm:hidden"
          onClick={submitSearch}
          aria-label="Search for radiator repair shops"
        >
          <Search className="mr-2 h-5 w-5" aria-hidden="true" />
          Search
        </button>
      </div>
    </motion.div>
  );
}

export default HeroSearchBar;
