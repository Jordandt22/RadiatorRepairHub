"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

// Contexts
import { useToast } from "@/contexts/ToastProvider";

function HeroSearchBar({ heroInView }) {
  const [search, setSearch] = useState("");
  const { showCustomError } = useToast();
  const router = useRouter();

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const submitSearch = () => {
    if (search === "") {
      router.push(`/search?page=1&sort=most_reviews`);
    }

    // Check Max Length
    if (search.length > 50) {
      return showCustomError(
        "Please keep your search under 50 characters..",
        "Search Input Too Long"
      );
    }

    // Check for Special Characters (Allowed: ', -, &, _)
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

    router.push(`/search?title=${search}&page=1&sort=most_reviews`);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      submitSearch();
    }
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <label htmlFor="hero-search" className="sr-only">
            Search for radiator repair shops
          </label>
          <input
            id="hero-search"
            type="text"
            placeholder="Enter a business name..."
            className="text-center md:text-left w-full px-6 py-4 text-lg rounded-lg border-0 shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900 md:pr-32"
            onChange={handleSearch}
            value={search}
            onKeyDown={handleKeyPress}
            aria-label="Search for radiator repair shops"
            aria-describedby="search-help"
          />
          {/* Desktop Search Button - Hidden on mobile */}
          <motion.button
            type="button"
            className="hidden sm:flex absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium items-center justify-center cursor-pointer"
            onClick={submitSearch}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Search for radiator repair shops"
          >
            <Search className="w-5 h-5 mr-2" aria-hidden="true" />
            Search Now
          </motion.button>
        </div>

        {/* Mobile Search Button - Full width on mobile */}
        <motion.button
          type="button"
          className="sm:hidden w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center cursor-pointer shadow-lg"
          onClick={submitSearch}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Search for radiator repair shops"
        >
          <Search className="w-5 h-5 mr-2" aria-hidden="true" />
          Search Now
        </motion.button>
      </div>
    </motion.div>
  );
}

export default HeroSearchBar;
