import React from "react";
import Link from "next/link";

function Footer() {
  const cities = [
    {
      name: "New York, NY",
      path: "/new-york",
    },
    {
      name: "Los Angeles, CA",
      path: "/los-angeles",
    },
    {
      name: "Houston, TX",
      path: "/houston",
    },
    {
      name: "Philadelphia, PA",
      path: "/philadelphia",
    },
    {
      name: "Chicago, IL",
      path: "/chicago",
    },
  ];

  const services = [
    {
      name: "Radiator Repair",
      path: "/radiator-repair",
    },
    {
      name: "Radiator Replacement",
      path: "/radiator-replacement",
    },
    {
      name: "Cooling System Service",
      path: "/cooling-system-service",
    },
    {
      name: "Thermostat Replacement",
      path: "/thermostat-replacement",
    },
    {
      name: "Water Pump Service",
      path: "/water-pump-service",
    },
    {
      name: "Emergency Repair",
      path: "/emergency-repair",
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 font-heading">
              RadiatorRepairHub
            </h3>
            <p className="text-gray-400 mb-4 max-w-md font-body leading-7">
              Your trusted directory for finding reliable radiator repair
              services across the United States. Connect with certified
              professionals and keep your vehicle running smoothly.
            </p>
          </div>

          {/* Cities/Regions */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-heading">
              Popular Cities
            </h4>
            <ul className="space-y-2">
              {cities.map((city) => (
                <li key={city.name} className="mb-2">
                  <Link
                    href={`/cities/${city.path}`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-heading">
              Services
            </h4>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.name} className="mb-2">
                  <Link
                    href={`/services/${service.path}`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} RadiatorRepairHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
