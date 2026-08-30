"use client";

import React, { Suspense, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Data
import FEATURES from "@/lib/data/features";
import STATES from "@/lib/data/states";

// Utils
import {
  validateArray,
  validateID,
  validateNumber,
  validateBoolean,
  formatFeatures,
  parseIdListParam,
} from "@/lib/utils/utils";
import {
  DEFAULT_LISTING_FILTERS,
  mergeListingSearchParams,
} from "@/lib/businesses/listingsSearch";

// Contexts
import { useFilters } from "@/contexts/FilterProvider";
import {
  DEFAULT_SORT_OPTION,
  getSortOptionFromKey,
} from "@/lib/businesses/sortOptions";

// Components
import FiltersWrapper from "./FiltersWrapper";
import ListingsWrapper from "./listings/ListingsWrapper";
import AffiliateProductsSection from "@/components/blogs/AffiliateProductsSection";

function ContentInner({
  stateData,
  cityData,
  categoryData,
  searchParams,
  initialListings = null,
  initialListingsPage = 1,
  initialSearchBody = null,
  affiliateProducts = [],
}) {
  const pathname = usePathname();
  const { page: pageParam, sort: sortParam } = searchParams;
  const { setAppliedFilters, setFilters, clearAllFiltersHelper } = useFilters();
  const parsedPage = Number(pageParam);
  const page =
    !Number.isNaN(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const filterSyncKey = useMemo(() => {
    const liveParams =
      typeof window === "undefined"
        ? {}
        : Object.fromEntries(
            new URLSearchParams(window.location.search).entries()
          );
    const merged = { ...searchParams, ...liveParams };
    return JSON.stringify({
      pathname,
      title: merged.title || "",
      city_id: merged.city_id || "",
      postal_code_id: merged.postal_code_id || "",
      state_id: merged.state_id || "",
      total_score: merged.total_score || "",
      reviews_count: merged.reviews_count || "",
      primary_category_id: merged.primary_category_id || "",
      secondary_categories: merged.secondary_categories || "",
      features: merged.features || "",
      weekdays: merged.weekdays || "",
      weekends: merged.weekends || "",
      sort: merged.sort || sortParam || "",
      state: stateData?.id || "",
      city: cityData?.id || "",
      category: categoryData?.id || "",
    });
  }, [searchParams, pathname, sortParam, stateData, cityData, categoryData]);

  useEffect(() => {
    const whitelist = {
      search: true,
      state: true,
      category: true,
    };
    if (!whitelist[pathname.split("/")[1]]) {
      clearAllFiltersHelper();
      return;
    }

    const liveParams =
      typeof window === "undefined"
        ? {}
        : Object.fromEntries(new URLSearchParams(window.location.search).entries());
    const filterParams = { ...searchParams, ...liveParams };
    delete filterParams.page;
    delete filterParams.sort;
    const formattedFilters = {
      ...DEFAULT_LISTING_FILTERS,
      open: { ...DEFAULT_LISTING_FILTERS.open },
    };

    if (stateData) formattedFilters.state_id = "";
    if (cityData) formattedFilters.city_id = cityData.id;
    if (categoryData) formattedFilters.primary_category_id = categoryData.id;

    const sort = getSortOptionFromKey(sortParam);

    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];

      if (key === "title") {
        let title = String(value || "").trim();
        if (title.length > 150) title = "";
        const specialCharacters = /[!@#$%^*()+\=\[\]{};:"\\|,.<>\/?]/gi;
        if (specialCharacters.test(title)) title = "";
        formattedFilters.title = title;
      }

      if (key === "total_score") {
        formattedFilters.total_score = validateNumber(value, 1, 5);
      }

      if (key === "reviews_count") {
        formattedFilters.reviews_count = validateNumber(value, 1, 500);
      }

      if (key === "primary_category_id" && !categoryData) {
        formattedFilters.primary_category_id =
          typeof value === "string" ? value.trim() : "";
      }

      if (key === "secondary_categories") {
        formattedFilters.secondary_categories = parseIdListParam(value, 5);
      }

      if (key === "city_id" && !cityData) {
        formattedFilters.city_id =
          typeof value === "string" ? value.trim() : "";
      }

      if (key === "postal_code_id") {
        formattedFilters.postal_code_id =
          typeof value === "string" ? value.trim() : "";
      }

      if (key === "state_id" && !stateData) {
        formattedFilters.state_id = validateID(value, STATES, "id");
      }

      if (key === "weekdays") {
        formattedFilters.open.weekdays = validateBoolean(value);
      }

      if (key === "weekends") {
        formattedFilters.open.weekends = validateBoolean(value);
      }

      if (key === "features") {
        formattedFilters.features = validateArray(
          FEATURES,
          "key",
          formattedFilters,
          "features",
          value
        );
      }
    });

    setFilters((prev) => ({
      ...prev,
      ...formattedFilters,
    }));

    setAppliedFilters({
      ...formattedFilters,
      features: formatFeatures(formattedFilters.features),
      sort_option: sort || DEFAULT_SORT_OPTION,
    });
    // Sync only when the actual query values change, not when searchParams
    // is a new object with the same contents (that wipe would drop a city
    // the user just picked before clicking Apply).
  }, [filterSyncKey]);

  return (
    <>
      <FiltersWrapper
        stateData={stateData}
        cityData={cityData}
        categoryData={categoryData}
        page={page}
      />

      <ListingsWrapper
        stateData={stateData}
        cityData={cityData}
        categoryData={categoryData}
        page={page}
        initialListings={initialListings}
        initialListingsPage={initialListingsPage}
        initialSearchBody={initialSearchBody}
      />

      {affiliateProducts.length > 0 ? (
        <section className="border-t border-border bg-card py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <AffiliateProductsSection
              products={affiliateProducts}
              title="Tools & Supplies"
              description="Coolant, radiator caps, and diagnostic tools useful while you compare shops or handle simple cooling system care."
              variant="showcase"
            />
          </div>
        </section>
      ) : null}
    </>
  );
}

function ContentWithClientSearchParams(props) {
  const urlSearchParams = useSearchParams();
  const searchParams = useMemo(
    () => mergeListingSearchParams(urlSearchParams, props.searchParams),
    [urlSearchParams, props.searchParams]
  );

  return <ContentInner {...props} searchParams={searchParams} />;
}

function ContentWrapper(props) {
  return (
    <Suspense fallback={<ContentInner {...props} />}>
      <ContentWithClientSearchParams {...props} />
    </Suspense>
  );
}

export default ContentWrapper;
