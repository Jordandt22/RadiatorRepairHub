import React from "react";

// Components
import HeroContent from "@/components/pages/home/HeroContent";
import FeaturedBusinesses from "@/components/pages/home/FeaturedBusinesses";
import FeaturedCategories from "@/components/pages/home/FeaturedCategories";
import PopularLocations from "@/components/pages/home/PopularLocations";
import HowItWorks from "@/components/pages/home/HowItWorks";
import WhyChoose from "@/components/pages/home/WhyChoose";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroContent />

      {/* Featured Businesses Section */}
      <FeaturedBusinesses />

      {/* SEO Content Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-gray-700 leading-relaxed">
            When your car&apos;s radiator needs repair, finding a trusted{" "}
            <strong>radiator repair near me</strong> is crucial. Our
            comprehensive <strong>radiator repair directory</strong> connects
            you with certified specialists who can diagnose, repair, and
            maintain your vehicle&apos;s cooling system. From radiator
            replacement to leak repairs, find the right professional for your
            automotive needs.
          </p>
        </div>
      </section>

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* Popular Locations */}
      <PopularLocations />

      {/* How It Works */}
      <HowItWorks />

      {/* Why Choose RadiatorRepairHub */}
      <WhyChoose />
    </div>
  );
}
