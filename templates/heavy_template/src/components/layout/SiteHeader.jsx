"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { getConfig } from "@/lib/config";
import { NAV_ITEMS } from "@/lib/chrome";
import { callLabel, telHref } from "@/lib/phone";
import { btnPrimary, wrap } from "@/lib/ui";

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

export function SiteHeader() {
  const config = getConfig();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const { shop, brand } = config;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/95">
      <div className={`${wrap} flex items-center justify-between gap-4 py-2.5`}>
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 font-semibold text-ink no-underline transition-colors duration-200 hover:text-ink/75 hover:no-underline"
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
              className="inline-flex items-center text-ink no-underline aria-[current=page]:font-medium aria-[current=page]:text-accent-text hover:text-accent-hover hover:bg-accent/10 rounded-md px-2 py-1 transition-all duration-200"
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
            ref={menuButtonRef}
            className="inline-flex h-12 w-11 cursor-pointer items-center justify-center border-0 bg-transparent text-ink touch-manipulation md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative size-6">
              <Menu
                size={24}
                strokeWidth={1.5}
                aria-hidden
                className={`absolute inset-0 transition-all duration-300 ${ease} motion-reduce:transition-none ${open ? "rotate-90 opacity-0" : "opacity-100"}`}
              />
              <X
                size={24}
                strokeWidth={1.5}
                aria-hidden
                className={`absolute inset-0 transition-all duration-300 ${ease} motion-reduce:transition-none ${open ? "opacity-100" : "-rotate-90 opacity-0"}`}
              />
            </span>
          </button>
        </div>
      </div>
      <nav
        className={`grid transition-[grid-template-rows] duration-300 ${ease} motion-reduce:transition-none md:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        id="mobile-nav"
        aria-label="Mobile"
        aria-hidden={open ? undefined : true}
        inert={open ? undefined : true}
      >
        <div className="overflow-hidden">
          <div
            className={`${wrap} flex flex-col border-t border-line pb-4 transition-opacity duration-300 ${ease} motion-reduce:transition-none ${open ? "opacity-100" : "opacity-0"}`}
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === item.href ? "page" : undefined}
                className="min-h-11 py-3 text-ink no-underline aria-[current=page]:font-medium aria-[current=page]:text-accent-text"
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
          </div>
        </div>
      </nav>
    </header>
  );
}
