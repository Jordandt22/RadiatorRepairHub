"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";
import { DEFAULT_SORT_OPTION } from "@/lib/businesses/sortOptions";

// Components
import MobileBusinessCard from "../cards/MobileBusinessCard";
import BusinessCard from "../cards/BusinessCard";
import BusinessHours from "../cards/BusinessHours";
import BusinessInfo from "../cards/BusinessInfo";
import BusinessListingImpression from "@/components/businesses/stats/BusinessListingImpression";
import {
  getAbsolutePosition,
  getListingSurface,
} from "@/lib/businessStats/listingSurface";
import { LISTINGS_PAGE_LIMIT } from "@/lib/businesses/listingsSearch";

const SEARCH_GRID_CLASS =
  "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

function Listings({ businesses, data, page, stateData, cityData, categoryData }) {
  const pathname = usePathname();
  const { filters, appliedFilters, updateURL } = useFilters();
  const [activeCard, setActiveCard] = useState(null);
  const [activeBackCard, setActiveBackCard] = useState(1);
  const isFirstRender = useRef(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setRefreshKey((key) => key + 1);
  }, [page, appliedFilters]);

  useEffect(() => {
    if (!data || data.page === page) return;

    // Only correct the URL when the server clamped past the last valid page
    if (data.page < page) {
      updateURL(
        stateData,
        cityData,
        data.page,
        {
          ...filters,
          sort_option: appliedFilters?.sort_option || DEFAULT_SORT_OPTION,
        },
        categoryData
      );
    }
  }, [
    data,
    page,
    stateData,
    cityData,
    categoryData,
    filters,
    appliedFilters,
    updateURL,
  ]);

  if (!businesses || businesses.length === 0) {
    return (
      <div>
        <div className={SEARCH_GRID_CLASS}>
          <div className="col-span-full rounded-lg border border-border bg-muted py-4 text-center font-medium text-muted-foreground">
            No Businesses Found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        key={`${pathname}-listings-${refreshKey}`}
        className={`${SEARCH_GRID_CLASS} stagger-fade-in`}
      >
        {businesses.map((business, index) => {
          const listingSource = getListingSurface({
            stateData,
            cityData,
            categoryData,
          });
          const position = getAbsolutePosition(
            page,
            LISTINGS_PAGE_LIMIT,
            index
          );
          return (
          <div key={business.id} className="group relative h-[400px]">
            <div
              className="relative h-full w-full transform-gpu transition-transform duration-700 ease-in-out"
              style={{
                transformStyle: "preserve-3d",
                transform:
                  activeCard === business.id
                    ? "rotateY(180deg)"
                    : "rotateY(0deg)",
              }}
            >
              <div
                className="absolute inset-0 h-full w-full backface-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <BusinessListingImpression
                  businessId={business.id}
                  source={listingSource}
                  position={position}
                >
                  <MobileBusinessCard
                    business={business}
                    priority={index < 2}
                    listingSource={listingSource}
                    position={position}
                  />
                  <BusinessCard
                    business={business}
                    activeCard={activeCard}
                    setActiveCard={setActiveCard}
                    setActiveBackCard={setActiveBackCard}
                    priority={index < 2}
                    listingSource={listingSource}
                    position={position}
                  />
                </BusinessListingImpression>
              </div>

              <div
                className="absolute inset-0 h-full w-full rounded-lg border border-border bg-card backface-hidden"
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
          );
        })}
      </div>
    </div>
  );
}

export default Listings;
