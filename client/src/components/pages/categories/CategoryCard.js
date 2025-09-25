import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Wrench,
  Car,
  Thermometer,
  Settings,
  Truck,
  Zap,
  Fuel,
  Package,
  Cog,
  Snowflake,
  Factory,
  Shield,
  Wind,
} from "lucide-react";

// Function to get appropriate icon for each category
const getCategoryIcon = (categoryName) => {
  const name = categoryName.toLowerCase();

  // Air conditioning related
  if (name.includes("air conditioning") || name.includes("ac")) {
    return Snowflake;
  }

  // Auto/Tire related
  if (name.includes("tire")) {
    return Car;
  }

  // Auto body/glass related
  if (name.includes("auto body") || name.includes("auto glass")) {
    return Shield;
  }

  // Auto parts/machine shop
  if (name.includes("auto parts") || name.includes("auto machine")) {
    return Package;
  }

  // Auto radiator
  if (name.includes("auto radiator")) {
    return Thermometer;
  }

  // Auto repair
  if (name.includes("auto repair")) {
    return Wrench;
  }

  // Brake shop
  if (name.includes("brake")) {
    return Shield;
  }

  // Car repair and maintenance
  if (name.includes("car repair") || name.includes("maintenance")) {
    return Settings;
  }

  // Diesel engine || Transmission
  if (name.includes("diesel") || name.includes("transmission")) {
    return Cog;
  }

  // Gas station
  if (name.includes("gas station")) {
    return Fuel;
  }

  // Manufacturer
  if (name.includes("manufacturer")) {
    return Factory;
  }

  // Muffler
  if (name.includes("muffler")) {
    return Wind;
  }

  // Radiator
  if (name.includes("radiator")) {
    return Thermometer;
  }

  // Truck related
  if (name.includes("truck")) {
    return Truck;
  }

  // Used auto parts
  if (name.includes("used auto parts")) {
    return Package;
  }

  // Welder
  if (name.includes("welder")) {
    return Zap;
  }

  // ATV dealer
  if (name.includes("atv")) {
    return Car;
  }

  // Default fallback
  return Wrench;
};

function CategoryCard({ category }) {
  const IconComponent = getCategoryIcon(category.name);

  return (
    <Link
      href={`/category/${category.slug}`}
      className="block group"
      prefetch={false}
    >
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 p-6 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-300">
              <IconComponent className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 font-heading line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 capitalize">
              {category.name}
            </h3>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
        </div>

        <p className="text-gray-600 text-sm leading-relaxed">
          Find specialized {category.name.toLowerCase()} services in your area.
          Browse reviews, compare prices, and connect with trusted
          professionals.
        </p>
      </div>
    </Link>
  );
}

export default CategoryCard;
