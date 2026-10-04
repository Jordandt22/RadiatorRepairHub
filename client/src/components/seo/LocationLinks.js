import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Internal-link block for directory pages. Gives crawlers a flat path between
 * state, city, and listing pages instead of relying on client-side filters.
 */
export default function LocationLinks({
  title,
  description,
  links = [],
  footerLink = null,
}) {
  if (!Array.isArray(links) || links.length === 0) return null;

  return (
    <section className="border-t border-border bg-card py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}

        <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-interactive hover:bg-muted"
              >
                <span className="truncate">{link.name}</span>
                {Number(link.count) > 0 ? (
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {Number(link.count).toLocaleString()}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>

        {footerLink ? (
          <Link
            href={footerLink.href}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {footerLink.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
