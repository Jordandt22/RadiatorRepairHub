"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const links = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "Featured",
      path: "/featured",
    },
    {
      label: "Categories",
      path: "/categories",
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
    <nav
      className={`${
        isHomePage
          ? "bg-transparent absolute top-0 left-0 right-0 z-50"
          : "bg-white shadow-sm border-b border-gray-200"
      } transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-3 transition-colors duration-300"
            >
              <Image
                src="/assets/logos/logo.png"
                alt="RadiatorRepairHub Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <span
                className={`text-2xl font-bold font-heading ${
                  isHomePage ? "text-white" : "text-blue-600"
                } transition-colors duration-300`}
              >
                RadiatorRepairHub
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.path}
                  className={`${
                    isHomePage
                      ? "text-white hover:text-blue-200"
                      : "text-gray-600 hover:text-blue-600"
                  } px-3 py-2 text-sm font-medium transition-colors duration-300`}
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/search?page=1&sort=most_reviews"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Link>
            </div>
          </div>
          <div className="md:hidden">
            <button
              className={`${
                isHomePage
                  ? "text-white hover:text-blue-200"
                  : "text-gray-600 hover:text-gray-900"
              } transition-colors duration-300`}
            >
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
