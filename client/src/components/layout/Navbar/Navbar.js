"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, X, Menu, LogOut, ChevronDown, ArrowRight } from "lucide-react";
import { useIsSignedIn } from "@/lib/auth/useIsSignedIn";
import UserAccountMenu from "@/components/auth/UserAccountMenu";
import { signOut } from "@/lib/auth/session";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BROWSE_LINKS = [
  { label: "Featured", path: "/featured" },
  { label: "Categories", path: "/categories" },
  { label: "States", path: "/states" },
  { label: "Shop", path: "/shop" },
];

const RESOURCE_LINKS = [
  { label: "Blogs", path: "/blogs" },
  { label: "Get Listed", path: "/get-listed" },
  { label: "How to Claim", path: "/how-to-claim" },
  { label: "FAQ", path: "/faq" },
];

function isBrowseActive(pathname) {
  return (
    pathname === "/featured" ||
    pathname.startsWith("/featured/") ||
    pathname === "/categories" ||
    pathname.startsWith("/category/") ||
    pathname === "/states" ||
    pathname.startsWith("/states/") ||
    pathname.startsWith("/state/") ||
    pathname === "/shop" ||
    pathname.startsWith("/shop/")
  );
}

function isResourcesActive(pathname) {
  return (
    pathname === "/blogs" ||
    pathname.startsWith("/blogs/") ||
    pathname === "/get-listed" ||
    pathname.startsWith("/get-listed/") ||
    pathname === "/how-to-claim" ||
    pathname.startsWith("/how-to-claim/") ||
    pathname === "/faq"
  );
}

function isItemActive(pathname, path) {
  if (pathname === path) return true;
  if (path === "/featured") return pathname.startsWith("/featured/");
  if (path === "/categories") return pathname.startsWith("/category/");
  if (path === "/states") {
    return pathname.startsWith("/states/") || pathname.startsWith("/state/");
  }
  if (path === "/blogs") return pathname.startsWith("/blogs/");
  if (path === "/how-to-claim") return pathname.startsWith("/how-to-claim/");
  return false;
}

function navLinkClass(pathname, path, isHome) {
  const genericClass = "rounded-full px-3 py-2 text-sm font-medium transition-interactive ";
  if (isHome) {
    return `${genericClass} ${pathname === path
      ? "bg-white/15 text-white"
      : "text-white hover:bg-white/10"
      }`;
  }

  return `${genericClass} ${pathname === path
    ? "bg-tint text-primary"
    : "text-muted-foreground hover:bg-muted hover:text-primary"
    }`;
}

function NavDropdown({ label, links, pathname, isActive, isHome }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-2 text-sm font-medium outline-none transition-interactive ${isHome
          ? isActive
            ? "bg-white/15 text-white"
            : "text-white hover:bg-white/10"
          : isActive
            ? "bg-tint text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-primary"
          }`}
      >
        {label}
        <ChevronDown className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44 w-auto rounded-lg">
        {links.map((link) => (
          <DropdownMenuItem
            key={link.path}
            render={<Link href={link.path} />}
            className={`cursor-pointer rounded-md ${isItemActive(pathname, link.path) ? "bg-tint text-primary" : ""
              }`}
          >
            {link.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, user } = useIsSignedIn();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isHome = pathname === "/";

  const signedInMobileLinks = [
    { label: "Settings", path: "/settings" },
    { label: "Dashboard", path: "/dashboard" },
  ];

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
    <UserAccountMenu user={user} variant={isHome ? "home" : "default"} />
  ) : (
    <Link
      href="/signin"
      className={
        isHome
          ? "inline-flex items-center gap-1.5 rounded-full border border-white/40 px-4 py-1.5 font-medium text-white transition-interactive hover:bg-white/10"
          : "inline-flex items-center gap-1.5 rounded-full border border-primary px-4 py-1.5 font-medium text-primary transition-interactive hover:bg-tint"
      }
      aria-label="Sign in to your business account"
    >
      Sign In
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );

  const mobileLinkClassName = (path) =>
    `block rounded-md px-4 py-2.5 text-base font-medium transition-colors duration-200 ${isItemActive(pathname, path) || pathname === path
      ? "bg-tint text-primary"
      : "text-foreground hover:bg-muted hover:text-primary"
    }`;

  return (
    <nav
      className={
        isHome
          ? "absolute inset-x-0 top-0 z-50 bg-transparent"
          : "bg-card"
      }
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-3"
              aria-label="RadiatorRepairHub - Go to homepage"
              prefetch={false}
            >
              <Image
                src="/assets/logos/logo.png"
                alt="RadiatorRepairHub - Find Trusted Radiator Repair Services"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span
                className={`font-heading text-2xl font-bold tracking-tight ${isHome ? "text-white" : "text-primary"
                  }`}
              >
                RadiatorRepairHub
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-6 flex items-center space-x-1 lg:ml-10">
              <Link href="/" className={navLinkClass(pathname, "/", isHome)}>
                Home
              </Link>
              <NavDropdown
                label="Browse"
                links={BROWSE_LINKS}
                pathname={pathname}
                isActive={isBrowseActive(pathname)}
                isHome={isHome}
              />
              <NavDropdown
                label="Resources"
                links={RESOURCE_LINKS}
                pathname={pathname}
                isActive={isResourcesActive(pathname)}
                isHome={isHome}
              />
              <Link
                href="/about"
                className={navLinkClass(pathname, "/about", isHome)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={navLinkClass(pathname, "/contact", isHome)}
              >
                Contact
              </Link>
              <Link
                href="/search?page=1&sort=most_reviews"
                className="ml-2 flex items-center space-x-2 rounded-full bg-primary px-4 py-1.5 font-medium text-primary-foreground transition-interactive hover:bg-primary/90"
                aria-label="Search for radiator repair services"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span>Search</span>
              </Link>
              <div className="ml-2">{accountControl}</div>
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className={
                isHome
                  ? "text-white transition-colors duration-200 hover:text-white"
                  : "text-muted-foreground transition-colors duration-200 hover:text-foreground"
              }
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

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 z-50 h-full w-80 transform border-l border-border bg-card shadow-md transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border p-6">
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
                className="h-8 w-8"
              />
              <span className="font-heading text-xl font-bold tracking-tight text-primary">
                RadiatorRepairHub
              </span>
            </Link>
            <button
              onClick={closeMobileMenu}
              className="text-muted-foreground transition-colors duration-200 hover:text-foreground"
              aria-label="Close mobile menu"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-3 border-b border-border p-6">
            <Link
              href="/search?page=1&sort=most_reviews"
              onClick={closeMobileMenu}
              className="flex w-full items-center justify-center space-x-2 rounded-full bg-primary px-4 py-3 font-medium text-primary-foreground transition-interactive hover:bg-primary/90"
              aria-label="Search for radiator repair businesses"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
              <span>Search Businesses</span>
            </Link>
            {!isSignedIn ? (
              <Link
                href="/signin"
                onClick={closeMobileMenu}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary px-4 py-3 font-medium text-primary transition-interactive hover:bg-tint"
                aria-label="Sign in to your business account"
              >
                Sign In
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <nav
              className="space-y-6"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <div>
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className={mobileLinkClassName("/")}
                >
                  Home
                </Link>
              </div>

              <div>
                <p className="mb-2 px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Browse
                </p>
                <div className="space-y-1">
                  {BROWSE_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.path}
                      onClick={closeMobileMenu}
                      className={mobileLinkClassName(link.path)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Resources
                </p>
                <div className="space-y-1">
                  {RESOURCE_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.path}
                      onClick={closeMobileMenu}
                      className={mobileLinkClassName(link.path)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Link
                  href="/about"
                  onClick={closeMobileMenu}
                  className={mobileLinkClassName("/about")}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  onClick={closeMobileMenu}
                  className={mobileLinkClassName("/contact")}
                >
                  Contact
                </Link>
              </div>

              {isSignedIn ? (
                <div className="space-y-1 border-t border-border pt-4">
                  {signedInMobileLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.path}
                      onClick={closeMobileMenu}
                      className={mobileLinkClassName(link.path)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </nav>
          </div>

          {isSignedIn ? (
            <div className="border-t border-border p-6">
              <button
                type="button"
                onClick={handleMobileLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 px-4 py-3 text-base font-medium text-red-600 transition-interactive hover:bg-red-50 disabled:opacity-60"
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
