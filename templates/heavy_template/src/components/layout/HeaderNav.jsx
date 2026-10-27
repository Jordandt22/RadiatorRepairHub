"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/chrome";
import { btnPrimary, wrap } from "@/lib/ui";

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

/** Desktop links, call CTA, and mobile drawer — needs pathname + open state. */
export function HeaderNav({ callHref, callText, children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef(null);

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
    <>
      <div className={`${wrap} flex items-center justify-between gap-4 py-2.5`}>
        {children}
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
          <a className={`${btnPrimary} max-md:hidden`} href={callHref}>
            {callText}
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
              href={callHref}
              onClick={() => setOpen(false)}
            >
              {callText}
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
