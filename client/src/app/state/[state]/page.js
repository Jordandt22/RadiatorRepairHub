import React from "react";
import Image from "next/image";
import Link from "next/link";

// Components
import Header from "./Header";
import SearchBar from "./SearchBar";
import Filters from "./Filters";
import Listings from "./Listings";
import Pagination from "./Pagination";

export async function generateStaticParams() {
  const topStates = ["CA", "TX", "FL", "NY", "PA", "IL"];
  return topStates.map((state) => ({ state }));
}

// Placeholder data for California
const generatePlaceholderBusinesses = () => {
  const cities = [
    "Los Angeles",
    "San Francisco",
    "San Diego",
    "Sacramento",
    "Fresno",
    "Oakland",
    "Long Beach",
    "Bakersfield",
  ];
  const businesses = [];

  for (let i = 1; i <= 40; i++) {
    businesses.push({
      id: i,
      title: `Radiator Repair ${i}`,
      image_url: `https://picsum.photos/400/300?random=${i}`,
      total_score: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
      reviews_count: Math.floor(Math.random() * 500) + 10,
      city: { name: cities[Math.floor(Math.random() * cities.length)] },
      state: { name: "California" },
      postal_code: { code: `${Math.floor(Math.random() * 90000) + 10000}` },
      address: `${Math.floor(Math.random() * 9999) + 1} Main St`,
    });
  }

  return businesses;
};

async function Page({ params }) {
  const { state } = await params;
  const stateName = state === "CA" ? "California" : state;
  const businesses = generatePlaceholderBusinesses();

  // For now, just show first 20 businesses (page 1)
  const currentPage = 1;
  const businessesPerPage = 20;
  const startIndex = (currentPage - 1) * businessesPerPage;
  const endIndex = startIndex + businessesPerPage;
  const currentBusinesses = businesses.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <Header stateName={stateName} />

      {/* Search and Filter Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <SearchBar />

            {/* Sorting Dropdowns */}
            <Filters />
          </div>
        </div>
      </div>

      {/* Business Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Listings businesses={currentBusinesses} />

        {/* Pagination */}
        <Pagination />
      </div>
    </div>
  );
}

export default Page;
