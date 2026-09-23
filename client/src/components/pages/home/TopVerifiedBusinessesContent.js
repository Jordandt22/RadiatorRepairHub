"use client";

import { motion } from "framer-motion";

import DetailedBusinessCard from "@/components/businesses/cards/DetailedBusinessCard";
import HomeSnapCarousel from "@/components/pages/home/HomeSnapCarousel";
import BusinessListingImpression from "@/components/businesses/stats/BusinessListingImpression";
import { fadeIn, useHomeSectionInView } from "@/components/ui/homeSectionMotion";
import { LISTING_SOURCES } from "@/lib/businessStats/listingSurface";
import { HOME_CAROUSEL_CARD_IMAGE_SIZES } from "@/lib/images";

export default function TopVerifiedBusinessesContent({ businesses = [] }) {
  const { ref, inView, reduceMotion } = useHomeSectionInView();

  return (
    <section
      ref={ref}
      className="section-atmosphere border-b border-border bg-card py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeIn(reduceMotion)}
        >
          <h2 className="mb-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
            Top Verified Businesses
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
            Claimed radiator repair shops with strong ratings from our community
          </p>
        </motion.div>

        {businesses.length > 0 ? (
          <HomeSnapCarousel label="Top verified businesses" fullWidthMobile>
            {businesses.map((business, index) => (
              <div key={business.id} className="h-full w-full">
                <BusinessListingImpression
                  businessId={business.id}
                  source={LISTING_SOURCES.TOP_VERIFIED}
                  position={index + 1}
                >
                  <DetailedBusinessCard
                    business={business}
                    listingSource={LISTING_SOURCES.TOP_VERIFIED}
                    position={index + 1}
                    imageSizes={HOME_CAROUSEL_CARD_IMAGE_SIZES}
                  />
                </BusinessListingImpression>
              </div>
            ))}
          </HomeSnapCarousel>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">No verified businesses found</p>
          </div>
        )}
      </div>
    </section>
  );
}
