import React from "react";
import Link from "next/link";
import DetailedBusinessCard from "@/components/businesses/cards/DetailedBusinessCard";

async function FeaturedBusinesses() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URI}/businesses/featured`
  );
  const data = await res.json();
  const businesses = data.data;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
            Featured Businesses
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Top-rated radiator repair shops recommended by our community
          </p>
        </div>

        {data?.data && businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businesses.slice(0, 3).map((business) => (
              <DetailedBusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <div className="text-center mt-12">
            <p className="text-gray-600">No Featured Businesses Found</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/featured"
            className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 duration-300 hover:scale-105 block w-fit mx-auto"
          >
            View All Featured Businesses
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedBusinesses;
