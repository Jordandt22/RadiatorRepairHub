"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

function HeroSearchBar({ heroInView }) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const submitSearch = () => {
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
      <div className="relative">
        <input
          type="text"
          placeholder="Enter a business name..."
          className="w-full px-6 py-4 text-lg rounded-lg border-0 shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900"
          onChange={handleSearch}
          value={search}
          onKeyDown={handleKeyPress}
          aria-label="Search for radiator repair shops"
        />
        <motion.button
          type="button"
          className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center cursor-pointer"
          onClick={submitSearch}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Search className="w-5 h-5 mr-2" />
          Search Now
        </motion.button>
      </div>
    </motion.div>
  );
}

export default HeroSearchBar;
