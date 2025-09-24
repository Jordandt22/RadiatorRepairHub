import React from "react";
import { Wrench, Car, Shield } from "lucide-react";
import Link from "next/link";

// Data
import PRIMARY_CATEGORIES from "@/lib/data/primary_categories";

function FeaturedCategories() {
  // Featured primary categories
  const icons = [
    <Wrench key="wrench" className="w-8 h-8 text-blue-600" />,
    <Car key="car" className="w-8 h-8 text-blue-600" />,
    <Car key="car" className="w-8 h-8 text-blue-600" />,
    <Shield key="shield" className="w-8 h-8 text-blue-600" />,
  ];
  const featuredPrimaryCategories = PRIMARY_CATEGORIES.slice(0, 4).map(
    (category, i) => ({
      ...category,
      icon: icons[i],
    })
  );

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
            Featured Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the most common radiator repair services available through
            our verified network
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredPrimaryCategories.map((category, index) => (
            <Link
              key={category.id}
              className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-1 animate-fade-in-up hover:bg-blue-50 hover:border-blue-500 border-2 border-transparent"
              style={{ animationDelay: `${index * 100}ms` }}
              href={`/search?page=1&sort=most_reviews&primary_category_id=${category.id}`}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-heading">
                {category.name}
              </h3>
              <p className="text-gray-600">
                Professional {category.name.toLowerCase()} services from
                verified specialists
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedCategories;
