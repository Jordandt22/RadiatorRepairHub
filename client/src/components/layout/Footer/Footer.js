import React from "react";
import Link from "next/link";

function Footer() {
  const discoverLinks = [
    { label: "Home", path: "/" },
    { label: "Featured", path: "/featured" },
    { label: "Categories", path: "/categories" },
    { label: "Find a Shop", path: "/search" },
    { label: "States", path: "/states" },
  ];

  const aboutLinks = [
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
    { label: "Get Listed", path: "/get-listed" },
  ];

  const topCities = [
    { label: "Los Angeles, CA", path: "/state/CA/city/los-angeles" },
    { label: "Houston, TX", path: "/state/TX/city/houston" },
    { label: "Chicago, IL", path: "/state/IL/city/chicago" },
    { label: "Phoenix, AZ", path: "/state/AZ/city/phoenix" },
    { label: "Philadelphia, PA", path: "/state/PA/city/philadelphia" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Branding & Tagline */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4 font-heading">
              RadiatorRepairHub
            </h3>
            <p className="text-gray-400 mb-4 italic">
              Your trusted radiator repair directory.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Browse radiator repair shops by state and city. Find reliable
              services near you with reviews, hours, and contact details.
            </p>
          </div>

          {/* Discover Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-heading">
              Discover
            </h4>
            <ul className="space-y-2">
              {discoverLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.path}
                    className="text-gray-400 hover:text-blue-500 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Cities */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-heading">
              Top Cities
            </h4>
            <ul className="space-y-2">
              {topCities.map((city) => (
                <li key={city.label}>
                  <Link
                    href={city.path}
                    className="text-gray-400 hover:text-blue-500 transition-colors text-sm"
                  >
                    {city.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-heading">About</h4>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.path}
                    className="text-gray-400 hover:text-blue-500 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 mb-4 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 RadiatorRepairHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
