"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, X, Menu, LogOut } from "lucide-react";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import UserAccountMenu from "@/components/auth/UserAccountMenu";
import { signOut } from "@/lib/auth/session";

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, user } = useIsSignedIn();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check if on homepage after component mounts to avoid hydration mismatch
  useEffect(() => {
    setIsHomePage(pathname === "/");
  }, [pathname]);

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
      label: "Blogs",
      path: "/blogs",
    },
    {
      label: "Tools & Supplies",
      path: "/shop",
    },
    {
      label: "Contact",
      path: "/contact",
    },
  ];

  const mobileLinks = [
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
      label: "Blogs",
      path: "/blogs",
    },
    {
      label: "Tools & Supplies",
      path: "/shop",
    },
    {
      label: "Contact",
      path: "/contact",
    },
  ];

  const signedInMobileLinks = [
    {
      label: "Settings",
      path: "/settings",
    },
    {
      label: "Dashboard",
      path: "/dashboard",
    },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleMobileLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut();
      closeMobileMenu();
      router.push("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const accountControl = isSignedIn ? (
    <UserAccountMenu
      user={user}
      triggerClassName={
        isHomePage ? "ring-offset-transparent" : "ring-offset-white"
      }
    />
  ) : (
    <Link
      href="/signin"
      className={`px-4 py-1 rounded-full font-medium transition-all duration-300 ${
        isHomePage
          ? "border-2 border-white/80 text-white hover:bg-white/20"
          : "border-2 border-blue-600 text-blue-600 hover:bg-blue-100"
      }`}
      aria-label="Sign in to your business account"
    >
      Sign In
    </Link>
  );

  const linkClassName = (path) =>
    `block px-4 py-3 text-lg font-medium rounded-lg transition-colors duration-200 ${
      pathname === path
        ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
    }`;

  return (
    <nav
      className={`${
        isHomePage
          ? "bg-transparent absolute top-0 left-0 right-0 z-50"
          : "bg-white shadow-sm border-b border-gray-200"
      } transition-all duration-300`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-3 transition-colors duration-300"
              aria-label="RadiatorRepairHub - Go to homepage"
              prefetch={false}
            >
              <Image
                src="/assets/logos/logo.png"
                alt="RadiatorRepairHub - Find Trusted Radiator Repair Services"
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
                      ? "text-white hover:bg-blue-500 hover:text-white"
                      : "text-gray-600 hover:text-blue-600"
                  } rounded-full px-3 py-2 text-sm font-medium transition-colors duration-300`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/search?page=1&sort=most_reviews"
                className="flex items-center space-x-2 px-4 py-1 rounded-full font-medium transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
                aria-label="Search for radiator repair services"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                <span>Search</span>
              </Link>
              {accountControl}
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
              aria-label={
                isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"
              }
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
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
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div className="flex flex-col h-full">
          {/* Mobile Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link
              href="/"
              className="flex items-center space-x-3"
              onClick={closeMobileMenu}
              aria-label="RadiatorRepairHub - Go to homepage"
            >
              <Image
                src="/assets/logos/logo.png"
                alt="RadiatorRepairHub - Find Trusted Radiator Repair Services"
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
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Mobile Search Button */}
          <div className="p-6 border-b border-gray-200 space-y-3">
            <Link
              href="/search?page=1&sort=most_reviews"
              onClick={closeMobileMenu}
              className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white"
              aria-label="Search for radiator repair businesses"
            >
              <Search className="w-5 h-5" aria-hidden="true" />
              <span>Search Businesses</span>
            </Link>
            {!isSignedIn ? (
              <Link
                href="/signin"
                onClick={closeMobileMenu}
                className="flex items-center justify-center w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 border border-blue-600 text-blue-600 hover:bg-blue-50"
                aria-label="Sign in to your business account"
              >
                Sign In
              </Link>
            ) : null}
          </div>

          {/* Mobile Sidebar Navigation */}
          <div className="flex-1 px-6 py-6 overflow-y-auto">
            <nav
              className="space-y-4"
              role="navigation"
              aria-label="Mobile navigation"
            >
              {mobileLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.path}
                  onClick={closeMobileMenu}
                  className={linkClassName(link.path)}
                >
                  {link.label}
                </Link>
              ))}

              {isSignedIn ? (
                <>
                  <div className="border-t border-gray-200 pt-4 space-y-4">
                    {signedInMobileLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.path}
                        onClick={closeMobileMenu}
                        className={linkClassName(link.path)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : null}
            </nav>
          </div>

          {isSignedIn ? (
            <div className="p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleMobileLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-base font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                <LogOut className="size-5" aria-hidden="true" />
                {isLoggingOut ? "Signing out…" : "Log out"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
