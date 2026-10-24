import Link from "next/link";
import { getConfig } from "@/lib/config";
import { mapsHref } from "@/lib/maps";
import { phoneDisplay, telHref } from "@/lib/phone";
import { muted } from "@/lib/ui";

/** Shop contact details + link to /contact for privacy & terms pages. */
export function LegalContact() {
  const config = getConfig();
  const { shop } = config;
  return (
    <div className="mt-10 border-t border-line pt-8">
      <h2 className="mb-2 text-xl font-semibold">Contact</h2>
      <p className={`mb-4 ${muted}`}>
        Questions about this page? Reach the shop directly or use the{" "}
        <Link href="/contact" className="text-ink underline underline-offset-2 hover:no-underline">
          contact page
        </Link>
        .
      </p>
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
