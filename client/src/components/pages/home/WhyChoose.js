import React from "react";
import { Shield, Clock, Search, CheckCircle } from "lucide-react";

function WhyChoose() {
  return (
    <section className="py-24 pb-48 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
            Why Choose RadiatorRepairHub
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We make finding reliable radiator repair services simple and
            trustworthy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Verified business listings",
              description:
                "All shops are verified and regularly updated for accuracy",
              icon: <Shield className="w-8 h-8" />,
            },
            {
              title: "Updated contact info and hours",
              description:
                "Current phone numbers, addresses, and operating hours",
              icon: <Clock className="w-8 h-8" />,
            },
            {
              title: "Easy-to-use search and filters",
              description:
                "Find exactly what you need with our intuitive search tools",
              icon: <Search className="w-8 h-8" />,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="group hover:bg-blue-600 hover:text-white bg-gray-50 rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-5 animate-fade-in-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="w-16 h-16 group-hover:bg-green-500 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 duration-300">
                <CheckCircle className="w-8 h-8 group-hover:text-white text-green-600" />
              </div>
              <h3 className="text-xl font-semibold group-hover:text-white text-gray-900 mb-3 font-heading duration-300 capitalize">
                {item.title}
              </h3>
              <p className="text-gray-600 group-hover:text-white duration-300">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChoose;
