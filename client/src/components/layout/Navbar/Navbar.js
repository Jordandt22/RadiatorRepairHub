import React from "react";
import Link from "next/link";

function Navbar() {
  const links = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "Search",
      path: "/search",
    },
    {
      label: "States",
      path: "/states",
    },
    {
      label: "About",
      path: "/about",
    },
    {
      label: "Contact",
      path: "/contact",
    },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600 font-heading">
              RadiatorRepairHub
            </h1>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.path}
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm
                  font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-900">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
