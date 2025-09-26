"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, X, Menu } from "lucide-react";

function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

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
              onClick={toggleMobileMenu}
              className={`${
                isHomePage
                  ? "text-white hover:text-blue-200"
                  : "text-gray-600 hover:text-gray-900"
              } transition-colors duration-300`}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link
              href="/"
              className="flex items-center space-x-3"
              onClick={closeMobileMenu}
            >
              <Image
                src="/assets/logos/logo.png"
                alt="RadiatorRepairHub Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold font-heading text-blue-600">
                RadiatorRepairHub
              </span>
            </Link>
            <button
              onClick={closeMobileMenu}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              aria-label="Close mobile menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Sidebar Navigation */}
          <div className="flex-1 px-6 py-6">
            <nav className="space-y-4">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.path}
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 text-lg font-medium rounded-lg transition-colors duration-200 ${
                    pathname === link.path
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile Sidebar Footer */}
          <div className="p-6 border-t border-gray-200">
            <Link
              href="/search?page=1&sort=most_reviews"
              onClick={closeMobileMenu}
              className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Search className="w-5 h-5" />
              <span>Search Businesses</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
