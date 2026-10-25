import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CHROME } from "@/lib/chrome";
import { getConfig } from "@/lib/config";
import { mapsHref } from "@/lib/maps";
import { phoneDisplay, telHref } from "@/lib/phone";
import { btnPrimary, muted } from "@/lib/ui";

/** Shop contact details + link to /contact for privacy & terms pages. */
export function LegalContact() {
  const config = getConfig();
  const { shop } = config;
  return (
    <div className="mt-10 border-t border-line pt-8">
      <h2 className="mb-2 text-xl font-semibold">Contact</h2>
      <p className={`mb-4 ${muted}`}>
        Questions about this page? Reach the shop directly.
      </p>
      <Link href="/contact" className={`${btnPrimary} mb-6 gap-2`}>
        {CHROME.legalContact}
        <ArrowRight aria-hidden size={18} strokeWidth={2} />
      </Link>
      <address className="m-0 not-italic">
        <p className="mb-1 font-semibold">{shop.name}</p>
        <p className="mb-1">
          <a
            href={mapsHref(config)}
            rel="noopener noreferrer"
            target="_blank"
            className="hover:underline"
          >
            {shop.address}, {shop.city}, {shop.state} {shop.zip}
          </a>
        </p>
        <p className="mb-1">
          <a href={telHref(shop)} className="hover:underline">
            {phoneDisplay(shop)}
          </a>
        </p>
        {shop.email ? (
          <p className="mb-0">
            <a href={`mailto:${shop.email}`} className="hover:underline">
              {shop.email}
            </a>
          </p>
        ) : null}
      </address>
    </div>
  );
}
