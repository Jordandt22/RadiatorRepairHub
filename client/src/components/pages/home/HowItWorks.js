import React from "react";
import { Search, Users, Star, Phone } from "lucide-react";

function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get connected with the right radiator repair specialist in just 4
            simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: 1,
              title: "Search by city or state",
              description:
                "Enter your location to find nearby radiator repair shops",
              icon: <Search className="w-8 h-8" />,
            },
            {
              step: 2,
              title: "Browse business listings",
              description:
                "View detailed profiles with services, hours, and contact info",
              icon: <Users className="w-8 h-8" />,
            },
            {
              step: 3,
              title: "Compare reviews and ratings",
              description: "Read customer reviews and compare service quality",
              icon: <Star className="w-8 h-8" />,
            },
            {
              step: 4,
              title: "Contact the business",
              description: "Call or visit the shop that best fits your needs",
              icon: <Phone className="w-8 h-8" />,
            },
          ].map((item, index) => (
            <div
              key={item.step}
              className="bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in-up hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                {item.step}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 font-heading">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
