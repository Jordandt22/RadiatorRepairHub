"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Phone } from "lucide-react";

function FeaturedBusinesses() {
  // const res = await fetch(`${process.env.API_URL}/v1/api/businesses/featured`);
  // const data = await res.json();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
            Featured Businesses
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Top-rated radiator repair shops recommended by our community
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              id: 1,
              name: "Houston Radiator Experts",
              location: "Houston, TX",
              rating: 4.9,
              reviewCount: 127,
              description:
                "Specializing in radiator repair, replacement, and maintenance for all vehicle types.",
              services: ["Radiator Repair", "Coolant System", "Engine Cooling"],
              phone: "(713) 555-0123",
              image: "/api/placeholder/300/200",
            },
            {
              id: 2,
              name: "Dallas Auto Cooling Solutions",
              location: "Dallas, TX",
              rating: 4.8,
              reviewCount: 89,
              description:
                "Professional radiator services with same-day repairs and lifetime warranty on parts.",
              services: [
                "Radiator Replacement",
                "AC Repair",
                "Preventive Maintenance",
              ],
              phone: "(214) 555-0456",
              image: "/api/placeholder/300/200",
            },
            {
              id: 3,
              name: "Phoenix Cool Car Care",
              location: "Phoenix, AZ",
              rating: 4.9,
              reviewCount: 156,
              description:
                "Expert radiator repair and cooling system diagnostics for extreme heat conditions.",
              services: [
                "Radiator Repair",
                "Overheating Diagnosis",
                "Cooling System Flush",
              ],
              phone: "(602) 555-0789",
              image: "/api/placeholder/300/200",
            },
          ].map((business, index) => (
            <motion.div
              key={business.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1 font-heading">
                      {business.name}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{business.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center mb-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 font-semibold text-gray-900">
                        {business.rating}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {business.reviewCount} reviews
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {business.description}
                </p>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {business.services.map((service, serviceIndex) => (
                      <span
                        key={serviceIndex}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="text-sm">{business.phone}</span>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <button className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            View All Featured Businesses
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturedBusinesses;
