"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { getConfig } from "@/lib/config";
import { NAV_ITEMS } from "@/lib/chrome";
import { callLabel, telHref } from "@/lib/phone";
import { btnPrimary, wrap } from "@/lib/ui";

export function SiteHeader() {
  const config = getConfig();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { shop, brand } = config;
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur">
      <div className={`${wrap} flex items-center justify-between gap-4 py-2.5`}>
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 font-semibold text-ink no-underline hover:text-ink hover:no-underline"
        >
          {brand.logoPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoPath} alt="" width={40} height={40} className="h-10 w-auto shrink-0" />
          ) : null}
          <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{shop.name}</span>
        </Link>
        <nav className="hidden gap-6 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className="inline-flex items-center font-medium text-ink no-underline aria-[current=page]:text-accent hover:text-accent-hover hover:bg-accent/10 rounded-md px-2 py-1 transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a className={`${btnPrimary} max-md:hidden`} href={telHref(shop)}>
            {callLabel(shop)}
          </a>
          <button
            type="button"
            className="inline-flex h-12 w-11 cursor-pointer items-center justify-center border-0 bg-transparent text-ink touch-manipulation md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X size={24} strokeWidth={1.5} aria-hidden />
            ) : (
              <Menu size={24} strokeWidth={1.5} aria-hidden />
            )}
          </button>
        </div>
      </div>
      <nav
        className={`${wrap} flex-col border-t border-line pb-4 ${open ? "flex" : "hidden"} md:hidden`}
        aria-label="Mobile"
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="min-h-11 py-3 text-ink no-underline"
          >
            {item.label}
          </Link>
        ))}
        <a
          className={`${btnPrimary} mt-2 w-full`}
          href={telHref(shop)}
          onClick={() => setOpen(false)}
        >
          {callLabel(shop)}
        </a>
      </nav>
    </header>
  );
}
