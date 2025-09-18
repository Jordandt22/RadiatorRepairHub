"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Utils
import { getPaginationLink } from "@/lib/utils/utils";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";

// Components
import MobileBusinessCard from "../cards/MobileBusinessCard";
import BusinessCard from "../cards/BusinessCard";
import BusinessHours from "../cards/BusinessHours";
import BusinessInfo from "../cards/BusinessInfo";

function Listings({ businesses, data, page, stateData, cityData }) {
  const router = useRouter();
  const { appliedFilters, getSortOption } = useFilters();
  const [activeCard, setActiveCard] = useState(null);
  const [activeBackCard, setActiveBackCard] = useState(1);

  useEffect(() => {
    if (data && data.page !== page) {
      const url = getPaginationLink(
        stateData,
        cityData,
        data.page,
        getSortOption(appliedFilters.sort_option)
      );
      router.replace(url);
    }
  }, [data, page, stateData, cityData, router, appliedFilters]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {businesses.length > 0 ? (
          <>
            {businesses.map((business) => (
              <div key={business.id} className="group relative h-[400px]">
                {/* Card Container with 3D Flip */}
                <div
                  className="relative w-full h-full transition-transform duration-700 ease-in-out transform-gpu"
                  style={{
                    transformStyle: "preserve-3d",
                    transform:
                      activeCard === business.id
                        ? "rotateY(180deg)"
                        : "rotateY(0deg)",
                  }}
                >
                  {/* Front of Card */}
                  <div
                    className="absolute inset-0 w-full h-full backface-hidden"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    {/* Mobile: Entire card is clickable */}
                    <MobileBusinessCard business={business} />

                    {/* Desktop: Card with hover effects */}
                    <BusinessCard
                      business={business}
                      activeCard={activeCard}
                      setActiveCard={setActiveCard}
                      setActiveBackCard={setActiveBackCard}
                    />
                  </div>

                  {/* Back of Card - Business Hours */}
                  <div
                    className="absolute inset-0 w-full h-full bg-white rounded-lg shadow-md border border-gray-200 backface-hidden"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {activeBackCard === 1 ? (
                      <BusinessInfo
                        business={business}
                        setActiveCard={setActiveCard}
                      />
                    ) : (
                      <BusinessHours
                        business={business}
                        setActiveCard={setActiveCard}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="col-span-full bg-gray-200 text-center text-gray-500 py-4 rounded-lg font-medium">
            No Businesses Found
          </div>
        )}
      </div>
    </div>
  );
}

export default Listings;
