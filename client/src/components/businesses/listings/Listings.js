"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { useFilters } from "@/contexts/FilterProvider";
import { DEFAULT_SORT_OPTION } from "@/lib/businesses/sortOptions";

import ListingBusinessCard from "../cards/ListingBusinessCard";
import BusinessListingImpression from "@/components/businesses/stats/BusinessListingImpression";
import {
  getAbsolutePosition,
  getListingSurface,
} from "@/lib/businessStats/listingSurface";
import { LISTINGS_PAGE_LIMIT } from "@/lib/businesses/listingsSearch";

const SEARCH_LIST_CLASS = "flex flex-col gap-4";

function Listings({ businesses, data, page, stateData, cityData, categoryData }) {
  const pathname = usePathname();
  const { filters, appliedFilters, updateURL } = useFilters();
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
          city_id: appliedFilters?.city_id ?? filters.city_id,
          postal_code_id:
            appliedFilters?.postal_code_id ?? filters.postal_code_id,
          state_id: appliedFilters?.state_id ?? filters.state_id,
          title: appliedFilters?.title ?? filters.title,
          primary_category_id:
            appliedFilters?.primary_category_id ?? filters.primary_category_id,
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
        <div className={SEARCH_LIST_CLASS}>
          <div className="rounded-lg border border-border bg-muted py-4 text-center font-medium text-muted-foreground">
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
        className={`${SEARCH_LIST_CLASS} stagger-fade-in`}
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
          const isElevated =
            Boolean(business?.is_featured) || Boolean(business?.is_claimed);
          const next = businesses[index + 1];
          const isLastElevatedBeforeUnclaimed =
            isElevated &&
            next &&
            !next.is_featured &&
            !next.is_claimed;

          return (
            <div
              key={business.id}
              className={
                isLastElevatedBeforeUnclaimed ? "mb-4 md:mb-6" : undefined
              }
            >
              <BusinessListingImpression
                businessId={business.id}
                source={listingSource}
                position={position}
              >
                <ListingBusinessCard
                  business={business}
                  priority={index < 2}
                  listingSource={listingSource}
                  position={position}
                />
              </BusinessListingImpression>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Listings;
